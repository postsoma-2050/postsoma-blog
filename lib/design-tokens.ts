/**
 * PostSoma-2050 Design Tokens
 * Single source of truth for category slugs, accent mapping, 3D icons, and English-first taxonomy.
 */

export const CATEGORIES = [
  "AI Insights",
  "Philosophy",
  "Blockchain",
  "Investing",
  "Sheshin Notes",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_SLUGS: Record<Category, string> = {
  "AI Insights": "ai-insights",
  Philosophy: "philosophy",
  Blockchain: "blockchain",
  Investing: "investing",
  "Sheshin Notes": "sheshin-notes",
};

export const CATEGORY_ACCENTS: Record<Category, string> = {
  "AI Insights": "var(--accent-ai)",
  Philosophy: "var(--accent-philosophy)",
  Blockchain: "var(--accent-blockchain)",
  Investing: "var(--accent-philosophy)",
  "Sheshin Notes": "var(--accent-notes)",
};

export const CATEGORY_3D_ICONS: Record<string, string> = {
  "AI": "/icons/AI.png",
  "AI Insights": "/icons/AI.png",
  Philosophy: "/icons/Philosophy.png",
  Investing: "/icons/investing.png",
  Blockchain: "/icons/Blockchain.png",
  "Sheshin Notes": "/icons/Sheshin Notes.png",
};

export function getCategoryBySlug(slug: string): Category | undefined {
  return (Object.entries(CATEGORY_SLUGS) as [Category, string][]).find(
    ([, s]) => s === slug
  )?.[0];
}

// ── English-First SubCategory Editorial Dictionary ──────────────────────────
export const SUB_CATEGORY_MAP: Record<string, string> = {
  // Blockchain
  "公鏈生態 / 基礎設施": "Infrastructure",
  "公鏈生態/基礎設施": "Infrastructure",
  "公链生态 / 基础设施": "Infrastructure",
  "公链生态/基础设施": "Infrastructure",
  "公鏈生態": "Infrastructure",
  "公链生态": "Infrastructure",
  "基礎設施": "Infrastructure",
  "基础设施": "Infrastructure",
  "去中心化金融": "DeFi",
  "DeFi 與穩定幣": "DeFi & Stablecoins",
  "DeFi與穩定幣": "DeFi & Stablecoins",
  "DeFi 与稳定币": "DeFi & Stablecoins",
  "DeFi与稳定币": "DeFi & Stablecoins",
  "預測市場": "Prediction Markets",
  "预测市场": "Prediction Markets",
  "代幣經濟學": "Tokenomics",
  "代币经济学": "Tokenomics",
  "安全與駭客": "Security & Exploit",
  "安全与骇客": "Security & Exploit",
  "迷因幣": "Meme Assets",
  "迷因币": "Meme Assets",
  "共識機制": "Consensus",
  "共识机制": "Consensus",
  "技術解析與原理": "Technical Architecture",
  "技术解析与原理": "Technical Architecture",
  "區塊鏈基礎知識": "Blockchain Fundamentals",
  "区块链基础知识": "Blockchain Fundamentals",
  "觀點與市場分享": "Market Perspectives",
  "观点与市场分享": "Market Perspectives",
  "應用實戰與投資": "Applied Strategy",
  "应用实战与投资": "Applied Strategy",
  "安全防護與資產管理": "Security & Asset Protection",
  "安全防护与资产管理": "Security & Asset Protection",

  // AI Insights
  "人類與AI": "Human-AI Symbiosis",
  "人类与AI": "Human-AI Symbiosis",
  "開發與技術": "Engineering & Tech",
  "开发与技术": "Engineering & Tech",
  "提示詞工程與AI應用": "Prompt Engineering & Apps",
  "提示词工程与AI应用": "Prompt Engineering & Apps",
  "基礎知識": "AI Fundamentals",
  "基础知识": "AI Fundamentals",
  "AI前沿論文": "Frontier Research",
  "AI前沿论文": "Frontier Research",
  "入門學習": "Beginner Onboarding",
  "入门学习": "Beginner Onboarding",

  // Investing
  "非对称投资": "Asymmetry",
  "非對稱投資": "Asymmetry",
  "特殊市場與新興產業": "Emerging Markets",
  "特殊市场与新兴产业": "Emerging Markets",
  "投資入門與心態": "Investor Mindset",
  "投资入门与心态": "Investor Mindset",
  "產業與市場分析": "Industry & Macro",
  "产业与市场分析": "Industry & Macro",
  "投資策略與實務": "Investment Strategy",
  "投资策略与实务": "Investment Strategy",
  "公司與財報分析": "Financial Statement Analysis",
  "公司与财报分析": "Financial Statement Analysis",
  "退休規劃": "Wealth Architecture",
  "退休规划": "Wealth Architecture",
  "退休保障": "Wealth Architecture",
  "資產配置": "Asset Allocation",
  "资产配置": "Asset Allocation",
  "被動收入": "Passive Income",
  "被动收入": "Passive Income",
  "財務自由": "Financial Sovereignty",
  "财务自由": "Financial Sovereignty",
  "投資觀念": "Capital Philosophy",
  "投资观念": "Capital Philosophy",
  "財富維度": "Wealth Dynamics",
  "财富维度": "Wealth Dynamics",
  "止損策略": "Risk Asymmetry",
  "止损策略": "Risk Asymmetry",
  "交易心理學": "Trading Psychology",
  "交易心理学": "Trading Psychology",
  "行為經濟學": "Behavioral Economics",
  "行为经济学": "Behavioral Economics",
  "風險管理": "Risk Management",
  "风险管理": "Risk Management",

  // Sheshin Notes & Philosophy
  "讀書筆記與觀點": "Reading Notes",
  "读书笔记与观点": "Reading Notes",
  "讀書筆記": "Reading Notes",
  "读书笔记": "Reading Notes",
  "心理學與自我成長": "Cognition & Psychology",
  "心理学与自我成长": "Cognition & Psychology",
  "心智模型": "Mental Models",
  "思維模型": "Mental Models",
  "自我成長": "Self-Actualization",
  "自我成长": "Self-Actualization",
  "時間管理": "Time Economics",
  "时间管理": "Time Economics",
  "職涯發展與創業": "Career & Entrepreneurship",
  "职涯发展与创业": "Career & Entrepreneurship",
  "藝術、文化與觀察": "Culture & Observations",
  "艺术、文化与观察": "Culture & Observations",
  "學習方法與思考工具": "Mental Models & Learning",
  "学习方法与思考工具": "Mental Models & Learning",
  "深度學習": "Deep Learning",
  "深度学习": "Deep Learning",
  "認知效率": "Cognitive Velocity",
  "认知效率": "Cognitive Velocity",
  "去中心化": "Decentralization",
  "自由": "Sovereignty",
  "Self Esteem": "Self Esteem",
  "PRINCIPLE": "Principles",
  "Happiness": "Happiness",
};

/**
 * Preserves the author's original subcategory label as designed in Notion.
 * Does not force Chinese-to-English translation.
 */
export function toEnglishSubCategory(raw?: string | null, category?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed;
}

/**
 * Preserves the author's original tag as designed in Notion.
 * Does not force Chinese-to-English translation.
 */
export function toEnglishTag(tag: string): string {
  if (!tag) return "";
  return tag.trim();
}


