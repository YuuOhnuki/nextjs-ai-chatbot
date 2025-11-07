import { translations } from "../translations";

export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  nameKey: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    nameKey: "gemini15Pro",
    description: "modelDescriptionAdvanced",
  },
  {
    id: "chat-model-reasoning",
    nameKey: "gemini15Flash",
    description: "modelDescriptionFast",
  },
];
