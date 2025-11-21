import type { UseChatHelpers } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { useScrollToBottom } from "./use-scroll-to-bottom";

export function useMessages({
  status,
  messages,
}: {
  status: UseChatHelpers<ChatMessage>["status"];
  messages: ChatMessage[];
}) {
  const {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  } = useScrollToBottom();

  const [hasSentMessage, setHasSentMessage] = useState(false);
  const [hasFirstCharacter, setHasFirstCharacter] = useState(false);

  useEffect(() => {
    if (status === "submitted") {
      setHasSentMessage(true);
      setHasFirstCharacter(false);
    } else if (status === "streaming") {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === "assistant") {
        const hasContent = lastMessage.parts.some(
          part => part.type === "text" && part.text?.trim().length > 0
        );
        if (hasContent) {
          setHasFirstCharacter(true);
        }
      }
    }
  }, [status, messages]);

  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
    hasFirstCharacter,
  };
}
