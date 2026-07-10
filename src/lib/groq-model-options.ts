export const GROQ_MODEL_SETTING_KEY = "groq_model";

export const GROQ_MODEL_OPTIONS = [
  {
    value: "llama-3.3-70b-versatile",
    label: "Llama 3.3 70B Versatil (padrao atual)",
    helper: "100K tokens/dia gratis - $0,59 entrada / $0,79 saida por milhao",
  },
  {
    value: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B",
    helper: "200K tokens/dia gratis - $0,15 entrada / $0,60 saida por milhao",
  },
  {
    value: "qwen/qwen3-32b",
    label: "Qwen3 32B",
    helper: "500K tokens/dia gratis - $0,29 entrada / $0,59 saida por milhao - modelo menor",
  },
] as const;
