import { generateFromGemini, generateDevelopmentPlan } from '../services/geminiService.js';
import { competencySkillData } from '../data/competencySkillData.js';
import { domainsData, findDomainByName } from '../data/domainsData.js';
import { aspectData } from '../data/aspectData.js';

const aspectLookup = new Map(aspectData.map(aspect => [aspect.name.toLowerCase(), aspect]));
const requiredAspectNames = aspectData.map(item => item.name);
const aspectCount = requiredAspectNames.length;

const competencyLookup = new Map(
  competencySkillData.map(item => [
    `${item.competencyAreaName.toLowerCase()}::${item.sfiaLevel}`,
    item,
  ])
);

function normalizeAspectName(item) {
  return (item.aspectName || item.name || item.competencyName || '').trim();
}

function getAspectByName(name) {
  return aspectLookup.get(name.toLowerCase()) || null;
}

function resolveDomain(domainInput) {
  if (!domainInput) return null;
  if (typeof domainInput === 'string') {
    return findDomainByName(domainInput);
  }
  if (typeof domainInput === 'object' && domainInput.name) {
    return findDomainByName(domainInput.name);
  }
  return null;
}

function buildMappedInterviewHistory(interviewHistory) {
  const evaluatedNames = [];

  const mapped = interviewHistory.map(item => {
    const aspectName = normalizeAspectName(item);
    const aspect = getAspectByName(aspectName);
    const score = item.score;

    evaluatedNames.push(aspectName);

    const competencyKey = `${aspect.name.toLowerCase()}::${score}`;
    const matchedCompetency = competencyLookup.get(competencyKey);

    return {
      aspectName: aspect.name,
      aspectRepresent: aspect.represent,
      aspectDimension: aspect.dimension,
      score,
      comment: item.comment ?? item.feedback ?? '',
      competencyName: matchedCompetency
        ? matchedCompetency.name
        : `${aspect.name.split('(')[0].trim()} (Level ${score})`,
      competencyDescription: matchedCompetency ? matchedCompetency.description : '',
    };
  });

  return { mapped, evaluatedNames };
}

function validateInterviewHistory(interviewHistory) {
  if (!Array.isArray(interviewHistory) || interviewHistory.length === 0) {
    return {
      status: 400,
      error: 'INVALID_INTERVIEW_HISTORY',
      message: 'Trường "interviewHistory" là bắt buộc và phải là một mảng không rỗng.',
    };
  }

  for (const item of interviewHistory) {
    const aspectName = normalizeAspectName(item);
    if (!aspectName) {
      return {
        status: 400,
        error: 'INVALID_INTERVIEW_ITEM',
        message: 'Mỗi item trong interviewHistory phải có "aspectName", "name" hoặc "competencyName".',
      };
    }

    const aspect = getAspectByName(aspectName);
    if (!aspect) {
      return {
        status: 400,
        error: 'INVALID_ASPECT',
        message: `Aspect "${aspectName}" không hợp lệ. Vui lòng sử dụng tên aspect từ danh sách 14 aspects.`,
      };
    }

    if (typeof item.score !== 'number' || item.score < 1 || item.score > 7) {
      return {
        status: 400,
        error: 'INVALID_SCORE',
        message: `Aspect "${aspectName}" phải có "score" là số từ 1 đến 7.`,
      };
    }

    if (item.comment === undefined && item.feedback === undefined) {
      return {
        status: 400,
        error: 'MISSING_COMMENT',
        message: `Aspect "${aspectName}" thiếu trường "comment" hoặc "feedback". Tất cả aspects đều phải có nhận xét.`,
      };
    }
  }

  const { mapped, evaluatedNames } = buildMappedInterviewHistory(interviewHistory);

  const evaluatedSet = new Set(evaluatedNames);
  const missingAspects = requiredAspectNames.filter(name => !evaluatedSet.has(name));
  if (missingAspects.length > 0) {
    return {
      status: 400,
      error: 'INCOMPLETE_EVALUATION',
      message: `Thiếu đánh giá cho ${missingAspects.length} aspect(s). Tất cả ${aspectCount} aspects đều phải được đánh giá và có nhận xét.`,
      missingAspects,
      totalRequired: aspectCount,
      totalEvaluated: evaluatedNames.length,
    };
  }

  const duplicateAspects = evaluatedNames.filter((name, idx) => evaluatedNames.indexOf(name) !== idx);
  if (duplicateAspects.length > 0) {
    return {
      status: 400,
      error: 'DUPLICATE_EVALUATION',
      message: `Có ${duplicateAspects.length} aspect(s) bị đánh giá trùng lặp.`,
      duplicateAspects: [...new Set(duplicateAspects)],
    };
  }

  return { mappedInterviewHistory: mapped };
}

export async function generateText(req, res) {
  try {

    const { prompt, model, options } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        error: 'INVALID_PROMPT',
        message: 'Trường "prompt" là bắt buộc và phải là chuỗi không rỗng.',
      });
    }
    const result = await generateFromGemini(prompt, {
      model,
      ...(options || {}),
    });

    return res.json({
      success: true,
      data: {
        model: result.model,
        prompt: result.prompt,
        text: result.text,
      },
    });
  } catch (err) {
    console.error('❌ Lỗi trong generateText controller:', err);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Có lỗi xảy ra khi gọi Gemini API.',
      detail: err?.message,
    });
  }
}

export async function generateDevelopmentPlanController(req, res) {
  try {
    const { interviewHistory, domain, model, options } = req.body || {};

    const validation = validateInterviewHistory(interviewHistory);
    if (validation.error) {
      const { status = 400, ...payload } = validation;
      return res.status(status).json(payload);
    }

    const { mappedInterviewHistory } = validation;

    const domainData = resolveDomain(domain);
    if (domain && !domainData) {
      return res.status(400).json({
        error: 'INVALID_DOMAIN',
        message: `Domain "${typeof domain === 'string' ? domain : domain?.name}" không hợp lệ. Vui lòng chọn một trong các domain: Y tế, Tài chính, Giáo dục, Công nghệ thông tin, Đa lĩnh vực, Marketing, Thiết kế sáng tạo, Phân tích nghiệp vụ (BA).`,
      });
    }

    const result = await generateDevelopmentPlan(
      competencySkillData,
      mappedInterviewHistory,
      {
        model,
        domain: domainData,
        aspectData: aspectData,
        ...(options || {}),
      }
    );

    return res.json({
      success: true,
      data: {
        domain: domainData ? {
          name: domainData.name,
          description: domainData.description,
        } : null,
        model: result.model,
        developmentPlan: result.data,
      },
    });
  } catch (err) {
    console.error('❌ Lỗi trong generateDevelopmentPlanController:', err);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Có lỗi xảy ra khi tạo lộ trình phát triển.',
      detail: err?.message,
    });
  }
}

export async function getDomainsController(req, res) {
  try {
    return res.json({
      success: true,
      data: domainsData,
    });
  } catch (err) {
    console.error('❌ Lỗi trong getDomainsController:', err);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Có lỗi xảy ra khi lấy danh sách domains.',
      detail: err?.message,
    });
  }
}

export async function getCompetenciesController(req, res) {
  try {
    const competenciesByArea = {};
    
    competencySkillData.forEach(item => {
      const areaName = item.compatencyAreaName;
      if (!competenciesByArea[areaName]) {
        competenciesByArea[areaName] = [];
      }
      competenciesByArea[areaName].push({
        name: item.name,
        description: item.description,
        sfiaLevel: item.sfiaLevel,
      });
    });

    return res.json({
      success: true,
      data: {
        total: competencySkillData.length,
        competencies: competencySkillData.map(item => ({
          name: item.name,
          description: item.description,
          sfiaLevel: item.sfiaLevel,
          competencyAreaName: item.compatencyAreaName,
        })),
        groupedByArea: Object.entries(competenciesByArea).map(([areaName, competencies]) => ({
          areaName,
          competencies,
          count: competencies.length,
        })),
      },
    });
  } catch (err) {
    console.error('❌ Lỗi trong getCompetenciesController:', err);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Có lỗi xảy ra khi lấy danh sách competencies.',
      detail: err?.message,
    });
  }
}

export async function getAspectsController(req, res) {
  try {
    const aspectsByDimension = {};
    
    aspectData.forEach(item => {
      const dimension = item.dimension;
      if (!aspectsByDimension[dimension]) {
        aspectsByDimension[dimension] = [];
      }
      aspectsByDimension[dimension].push({
        name: item.name,
        represent: item.represent,
        description: item.description,
        weightWithinDimension: item.weightWithinDimension,
      });
    });

    return res.json({
      success: true,
      data: {
        total: aspectData.length,
        aspects: aspectData.map(item => ({
          name: item.name,
          represent: item.represent,
          dimension: item.dimension,
          description: item.description,
          weightWithinDimension: item.weightWithinDimension,
        })),
        groupedByDimension: Object.entries(aspectsByDimension).map(([dimension, aspects]) => ({
          dimension,
          aspects,
          count: aspects.length,
        })),
      },
    });
  } catch (err) {
    console.error('❌ Lỗi trong getAspectsController:', err);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Có lỗi xảy ra khi lấy danh sách aspects.',
      detail: err?.message,
    });
  }
}


