import { GoogleGenerativeAI } from '@google/generative-ai';

const DEFAULT_CHAT_MODEL = 'gemini-2.5-flash';
const DEFAULT_PLAN_MODEL = 'gemini-2.5-flash';
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ Thiếu GEMINI_API_KEY trong file .env');
  console.error('Vui lòng tạo file .env và thêm GEMINI_API_KEY=... của bạn.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

function buildChatPrompt(userPrompt, options = {}) {
  const { role = 'trợ lý AI', language = 'tiếng Việt' } = options;
  return `
Bạn là một ${role} thông minh, trả lời ngắn gọn, rõ ràng, dễ hiểu, bằng ${language}.

Yêu cầu của người dùng:
${userPrompt}

Hãy trả lời trực tiếp, không cần giải thích lan man.
`;
}

function parseModelJsonResponse(text) {
  try {
    const jsonMatch =
      text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    return JSON.parse(jsonString);
  } catch (err) {
    console.warn('⚠️ Không thể parse JSON từ response, trả về raw text');
    return { rawResponse: text };
  }
}

function getModel(modelName) {
  return genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
}

export async function generateFromGemini(userPrompt, options = {}) {
  const modelName = options.model || DEFAULT_CHAT_MODEL;
  const model = getModel(modelName);
  const prompt = buildChatPrompt(userPrompt, options);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  return {
    model: modelName,
    prompt,
    text,
  };
}

function buildDevelopmentPlanPrompt(competencySkillData, interviewHistory, domain = null, aspectData = null) {
  const competencyAreas = {};
  competencySkillData.forEach(item => {
    const areaName = item.compatencyAreaName;
    if (!competencyAreas[areaName]) {
      competencyAreas[areaName] = [];
    }
    competencyAreas[areaName].push({
      level: item.sfiaLevel,
      name: item.name,
      description: item.description,
    });
  });

  const interviewData = interviewHistory.map(item => ({
    aspectName: item.aspectName,
    aspectRepresent: item.aspectRepresent,
    aspectDimension: item.aspectDimension,
    competencyName: item.competencyName || item.name,
    score: item.score,
    comment: item.comment || item.feedback || '',
    competencyDescription: item.competencyDescription || '',
  }));

  const domainContext = domain 
    ? `\n## LĨNH VỰC ỨNG DỤNG:\n\nLộ trình phát triển này được tạo cho lĩnh vực **${domain.name}**.\n\nMô tả lĩnh vực: ${domain.description}\n\n`
    : '';

  const mentorRole = domain
    ? `Bạn là một mentor chuyên nghiệp và có kinh nghiệm cao trong lĩnh vực **${domain.name}**, đặc biệt là việc ứng dụng AI trong ${domain.name.toLowerCase()}. Bạn đã có nhiều năm kinh nghiệm làm việc, nghiên cứu và phát triển các giải pháp AI trong ${domain.name.toLowerCase()}, hiểu rõ các thách thức, cơ hội và xu hướng trong lĩnh vực này.`
    : `Bạn là một mentor chuyên nghiệp và giàu kinh nghiệm trong lĩnh vực phát triển năng lực AI, với nhiều năm kinh nghiệm trong việc đánh giá, phát triển và hướng dẫn các chuyên gia AI.`;

  return `${mentorRole}

Nhiệm vụ của bạn là phân tích kết quả đánh giá từ một mentor khác (cũng là người có kinh nghiệm cao trong lĩnh vực này) và đưa ra lộ trình phát triển cá nhân chi tiết, thực tế và có thể thực hiện được.${domainContext}

## DỮ LIỆU TIÊU CHÍ GỐC (Thang điểm 1-7):

${Object.entries(competencyAreas).map(([areaName, levels]) => {
  return `### ${areaName}\n${levels.map(l => `- Level ${l.level}: ${l.name}\n  Mô tả: ${l.description}`).join('\n')}`;
}).join('\n\n')}

## KẾT QUẢ ĐÁNH GIÁ INTERVIEW:

${interviewData.map((item, idx) => {
  let result = `### ${idx + 1}. ${item.aspectName || item.competencyName}`;
  if (item.aspectRepresent) {
    result += ` (${item.aspectRepresent})`;
  }
  if (item.aspectDimension) {
    result += ` - ${item.aspectDimension}`;
  }
  result += `\n- Competency Level: ${item.competencyName}`;
  if (item.competencyDescription) {
    result += `\n  ${item.competencyDescription}`;
  }
  result += `\n- Điểm đánh giá: ${item.score}/7`;
  result += `\n- Nhận xét: ${item.comment || 'Không có nhận xét'}`;
  return result;
}).join('\n\n')}

## YÊU CẦU PHÂN TÍCH:

Hãy phân tích và đưa ra lộ trình phát triển cá nhân với định dạng JSON sau (trả lời bằng tiếng Việt):

{
  "swotAnalysis": {
    "strengths": [
      "Liệt kê các điểm mạnh dựa trên các tiêu chí có điểm cao (>= 5)",
      "Mỗi điểm mạnh nên kèm theo giải thích ngắn gọn"
    ],
    "weaknesses": [
      "Liệt kê các điểm yếu dựa trên các tiêu chí có điểm thấp (< 4)",
      "Mỗi điểm yếu nên kèm theo giải thích và tác động"
    ],
    "opportunities": [
      "Cơ hội phát triển dựa trên điểm mạnh hiện tại",
      "Cơ hội từ xu hướng công nghệ AI",
      "Cơ hội từ các tiêu chí có tiềm năng cải thiện"
    ],
    "threats": [
      "Thách thức từ các điểm yếu",
      "Thách thức từ môi trường làm việc",
      "Thách thức từ sự thay đổi công nghệ"
    ]
  },
  "shortTermGoals": [
    {
      "title": "Tiêu đề mục tiêu",
      "description": "Mô tả chi tiết mục tiêu",
      "targetCompetencies": ["Tên các tiêu chí liên quan"],
      "timeline": "Thời gian dự kiến (ví dụ: 3-6 tháng)",
      "priority": "Cao/Trung bình/Thấp"
    }
  ],
  "longTermGoals": [
    {
      "title": "Tiêu đề mục tiêu",
      "description": "Mô tả chi tiết mục tiêu",
      "targetCompetencies": ["Tên các tiêu chí liên quan"],
      "timeline": "Thời gian dự kiến (ví dụ: 1-2 năm)",
      "priority": "Cao/Trung bình/Thấp"
    }
  ],
  "actionPlan": [
    {
      "action": "Hành động cụ thể",
      "competencyArea": "Tên lĩnh vực năng lực",
      "targetLevel": "Level mục tiêu (1-7)",
      "currentLevel": "Level hiện tại",
      "steps": [
        "Bước 1: Mô tả cụ thể",
        "Bước 2: Mô tả cụ thể"
      ],
      "resources": ["Tài liệu, khóa học, công cụ gợi ý"],
      "timeline": "Thời gian thực hiện",
      "successCriteria": "Tiêu chí đánh giá thành công"
    }
  ],
  "summary": "Tóm tắt tổng quan về tình trạng hiện tại và định hướng phát triển"
}

## HƯỚNG DẪN PHÂN TÍCH:

Với tư cách là một mentor có kinh nghiệm cao${domain ? ` trong lĩnh vực ${domain.name}` : ''}, hãy:

1. **Phân tích SWOT sâu sắc**: 
   - Dựa trên kinh nghiệm thực tế của bạn trong lĩnh vực${domain ? ` ${domain.name.toLowerCase()}` : ''}, đánh giá các điểm mạnh/yếu một cách chính xác
   - Xác định các cơ hội và thách thức dựa trên xu hướng thực tế của ngành${domain ? ` trong ${domain.name.toLowerCase()}` : ''}
   - Đưa ra nhận định dựa trên các case studies và best practices bạn đã trải nghiệm

2. **Định hướng phát triển thực tế**:
   - Đưa ra các mục tiêu ngắn hạn và dài hạn dựa trên lộ trình phát triển thực tế trong ngành${domain ? ` ${domain.name.toLowerCase()}` : ''}
   - Ưu tiên các kỹ năng và năng lực quan trọng nhất cho sự nghiệp trong lĩnh vực${domain ? ` ${domain.name.toLowerCase()}` : ''}
   - Xem xét các yêu cầu thực tế của thị trường lao động${domain ? ` trong ${domain.name.toLowerCase()}` : ''}

3. **Kế hoạch hành động cụ thể**:
   - Đưa ra các bước hành động cụ thể, có thể thực hiện được ngay
   - Gợi ý các tài liệu, khóa học, công cụ thực tế mà bạn biết là hiệu quả${domain ? ` trong ${domain.name.toLowerCase()}` : ''}
   - Đề xuất các dự án thực tế hoặc case studies để thực hành${domain ? ` trong ${domain.name.toLowerCase()}` : ''}
   - Đưa ra timeline thực tế dựa trên kinh nghiệm của bạn

4. **Lưu ý quan trọng**:
   - Phân tích phải dựa trên so sánh điểm đánh giá với thang điểm tối đa (7) và mô tả của từng level
   - Đưa ra các gợi ý cụ thể, có thể thực hiện được${domain ? `, tập trung vào ứng dụng thực tế trong lĩnh vực ${domain.name.toLowerCase()}` : ''}
   - Ưu tiên các tiêu chí có điểm thấp nhưng quan trọng cho sự nghiệp${domain ? ` trong ${domain.name.toLowerCase()}` : ''}
   - Cân bằng giữa phát triển điểm mạnh và cải thiện điểm yếu
   - Sử dụng kinh nghiệm thực tế của bạn để đưa ra các ví dụ và case studies cụ thể${domain ? ` trong ${domain.name.toLowerCase()}` : ''}
   - Trả lời hoàn toàn bằng tiếng Việt, định dạng JSON hợp lệ`;
}

export async function generateDevelopmentPlan(competencySkillData, interviewHistory, options = {}) {
  const modelName = options.model || DEFAULT_PLAN_MODEL;
  const domain = options.domain || null;
  const aspectData = options.aspectData || null;

  const model = getModel(modelName);
  const prompt = buildDevelopmentPlanPrompt(competencySkillData, interviewHistory, domain, aspectData);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const parsedData = parseModelJsonResponse(text);

  return {
    model: modelName,
    prompt,
    text,
    data: parsedData,
  };
}


