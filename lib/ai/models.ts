export const DEFAULT_CHAT_MODEL: string = "chat-model-reasoning";

export type ChatModel = {
  id: string;
  nameKey: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    nameKey: "gemini25Pro",
    description: "modelDescriptionAdvanced",
  },
  {
    id: "chat-model-reasoning",
    nameKey: "gemini25Flash",
    description: "modelDescriptionFast",
  },
];
