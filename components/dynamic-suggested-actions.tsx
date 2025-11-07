"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { memo, useMemo } from "react";
import { useTranslation } from "@/hooks/use-translation";
import type { ChatMessage } from "@/lib/types";
import { Suggestion } from "./elements/suggestion";
import type { VisibilityType } from "./visibility-selector";

type DynamicSuggestedActionsProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
  messages: ChatMessage[];
};

function generateSuggestions(
  lastMessage: string,
  t: (key: string) => string
): string[] {
  const message = lastMessage.toLowerCase();

  // 質問が含まれている場合
  if (
    message.includes("?") ||
    message.includes("what") ||
    message.includes("how") ||
    message.includes("why") ||
    message.includes("？") ||
    message.includes("何") ||
    message.includes("どう") ||
    message.includes("なぜ")
  ) {
    return [
      t("suggestionYes"),
      t("suggestionNo"),
      t("suggestionMoreDetails"),
      t("suggestionThankYou"),
    ];
  }

  // 提案や提案が含まれている場合
  if (
    message.includes("recommend") ||
    message.includes("suggest") ||
    message.includes("try") ||
    message.includes("提案") ||
    message.includes("おすすめ") ||
    message.includes("試して")
  ) {
    return [
      t("suggestionSoundsGood"),
      t("suggestionMaybeLater"),
      t("suggestionTellMeMore"),
      t("suggestionThankYou"),
    ];
  }

  // 説明や情報提供の場合
  if (
    message.includes("is") ||
    message.includes("are") ||
    message.includes("means") ||
    message.includes("です") ||
    message.includes("ます") ||
    message.includes("でした")
  ) {
    return [
      t("suggestionUnderstood"),
      t("suggestionCanYouExplain"),
      t("suggestionGiveExample"),
      t("suggestionThankYou"),
    ];
  }

  // デフォルトの返答例
  return [
    t("suggestionThankYou"),
    t("suggestionCanYouExplain"),
    t("suggestionTellMeMore"),
    t("suggestionGotIt"),
  ];
}

function PureDynamicSuggestedActions({
  chatId,
  sendMessage,
  messages,
}: DynamicSuggestedActionsProps) {
  const { t } = useTranslation();

  const suggestions = useMemo(() => {
    if (messages.length === 0) {
      return [];
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "assistant") {
      return [];
    }

    // 最後のアシスタントメッセージからテキストを取得
    const lastMessageText = lastMessage.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join(" ")
      .trim();

    if (!lastMessageText) {
      return [];
    }

    return generateSuggestions(lastMessageText, t);
  }, [messages, t]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div
      className="mb-4 flex w-full gap-2 overflow-x-auto pb-2"
      data-testid="dynamic-suggested-actions"
    >
      {suggestions.map((suggestedAction, index) => (
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="flex-shrink-0"
          exit={{ opacity: 0, x: -20 }}
          initial={{ opacity: 0, x: 20 }}
          key={suggestedAction}
          transition={{ delay: 0.05 * index }}
        >
          <Suggestion
            className="h-auto min-w-[200px] whitespace-normal p-3 text-left"
            onClick={(suggestion) => {
              window.history.replaceState({}, "", `/chat/${chatId}`);
              sendMessage({
                role: "user",
                parts: [{ type: "text", text: suggestion }],
              });
            }}
            suggestion={suggestedAction}
          >
            {suggestedAction}
          </Suggestion>
        </motion.div>
      ))}
    </div>
  );
}

export const DynamicSuggestedActions = memo(
  PureDynamicSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }
    if (prevProps.messages.length !== nextProps.messages.length) {
      return false;
    }

    return true;
  }
);
