export const CompetencyDimension = {
  MINDSET: "MINDSET",
  SKILLSET: "SKILLSET",
  TOOLSET: "TOOLSET",
};

export const aspectData = [
  {
    name: "Khả Năng Thích Ứng & Tư Duy Phát Triển (Adaptability & Growth Mindset)",
    dimension: CompetencyDimension.MINDSET,
    weightWithinDimension: 0.25,
    represent: "A1",
    description:
      "Ability to adapt to changes and maintain a growth mindset in the context of AI evolution.",
  },
  {
    name: "Tự Học & Cải Tiến Liên Tục (Self-Learning & Continuous Improvement) a",
    dimension: CompetencyDimension.MINDSET,
    weightWithinDimension: 0.2,
    represent: "A2",
    description:
      "Commitment to continuous learning and self-improvement in AI-related knowledge and skills.",
  },
  {
    name: "Tư Duy Phản Biện & Lý Luận Đạo Đức (Critical Thinking & Ethical Reasoning)",
    dimension: CompetencyDimension.MINDSET,
    weightWithinDimension: 0.25,
    represent: "A3",
    description:
      "Ability to think critically and make ethical decisions in AI development and implementation.",
  },
  {
    name: "Trí Tuệ Ranh Giới Con Người-AI (Human-AI Boundary Intelligence)",
    dimension: CompetencyDimension.MINDSET,
    weightWithinDimension: 0.15,
    represent: "A4",
    description:
      "Understanding the boundaries and relationships between human intelligence and artificial intelligence.",
  },
  {
    name: "Nhận Thức Rủi Ro & Quản Trị AI (AI Risk Awareness & Governance)",
    dimension: CompetencyDimension.MINDSET,
    weightWithinDimension: 0.15,
    represent: "A5",
    description:
      "Understanding and managing risks associated with AI implementation and governance.",
  },
  {
    name: "Giao Tiếp AI & Prompt Engineering (AI Communication & Prompt Engineering)",
    dimension: CompetencyDimension.SKILLSET,
    weightWithinDimension: 0.25,
    represent: "B1",
    description:
      "Ability to effectively communicate with AI systems and design prompts for optimal results.",
  },
  {
    name: "Nghiên Cứu & Tổng Hợp Thông Tin (Research & Information Synthesis)",
    dimension: CompetencyDimension.SKILLSET,
    weightWithinDimension: 0.2,
    represent: "B2",
    description:
      "Skills in researching and synthesizing information related to AI technologies and applications.",
  },
  {
    name: "Làm Việc Nhóm & Hợp Tác AI-Con Người (Teamwork & Human-AI Collaboration)",
    dimension: CompetencyDimension.SKILLSET,
    weightWithinDimension: 0.15,
    represent: "B3",
    description:
      "Ability to work effectively in teams and facilitate collaboration between humans and AI systems.",
  },
  {
    name: "Hiểu Biết Dữ Liệu & Xác Thực (Data Understanding & Validation)",
    dimension: CompetencyDimension.SKILLSET,
    weightWithinDimension: 0.15,
    represent: "B4",
    description:
      "Skills in understanding and validating data used in AI systems.",
  },
  {
    name: "Phân Tách Vấn Đề & Xác Định Phạm Vi AI (Problem Decomposition & AI Scoping)",
    dimension: CompetencyDimension.SKILLSET,
    weightWithinDimension: 0.15,
    represent: "B5",
    description:
      "Ability to break down problems and determine appropriate AI application scope.",
  },
  {
    name: "Năng Lực Bảo Mật & Quyền Riêng Tư (Security & Privacy Competency)",
    dimension: CompetencyDimension.SKILLSET,
    weightWithinDimension: 0.1,
    represent: "B6",
    description:
      "Understanding and implementing security and privacy measures in AI systems.",
  },
  {
    name: "Thành Thạo Công Cụ AI Cốt Lõi (Core AI Tools Mastery)",
    dimension: CompetencyDimension.TOOLSET,
    weightWithinDimension: 0.4,
    represent: "C1",
    description: "Proficiency in using core AI tools and platforms.",
  },
  {
    name: "Đánh Giá & Lựa Chọn Công Cụ (Tool Evaluation & Selection)",
    dimension: CompetencyDimension.TOOLSET,
    weightWithinDimension: 0.25,
    represent: "C2",
    description:
      "Ability to evaluate and select appropriate AI tools for specific tasks.",
  },
  {
    name: "Tích Hợp & Thiết Kế Quy Trình (Integration & Workflow Design)",
    dimension: CompetencyDimension.TOOLSET,
    weightWithinDimension: 0.25,
    represent: "C3",
    description:
      "Skills in integrating AI tools and designing effective workflows.",
  },
  {
    name: "Đổi Mới & Phát Triển Tùy Chỉnh (Innovation & Custom Development)",
    dimension: CompetencyDimension.TOOLSET,
    weightWithinDimension: 0.1,
    represent: "C4",
    description: "Ability to innovate and develop custom AI solutions.",
  },
];

/**
 * @param {string} aspectName
 * @returns {object|null}
 */
export function findAspectByName(aspectName) {
  return (
    aspectData.find(
      (aspect) => aspect.name.toLowerCase() === aspectName.toLowerCase()
    ) || null
  );
}

/**
 * @param {string} aspectName
 * @returns {boolean}
 */
export function isValidAspect(aspectName) {
  return findAspectByName(aspectName) !== null;
}
