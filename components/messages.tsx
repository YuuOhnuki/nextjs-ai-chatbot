"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { AnimatePresence } from "framer-motion";
import { ArrowDownIcon } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useMessages } from "@/hooks/use-messages";
import { useChatMessages } from "@/hooks/use-chat-messages";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { useDataStream } from "./data-stream-provider";
import { Conversation, ConversationContent } from "./elements/conversation";
import { Greeting } from "./greeting";
import { PreviewMessage, ThinkingMessage } from "./message";
import { SuggestedActions } from "./suggested-actions";
import { DynamicSuggestedActions } from "./dynamic-suggested-actions";
import type { VisibilityType } from "./visibility-selector";

type MessagesProps = {
  chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  votes: Vote[] | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  isArtifactVisible: boolean;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
};

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  regenerate,
  isReadonly,
  isArtifactVisible,
  sendMessage,
  selectedVisibilityType,
}: MessagesProps) {
  const [scrollInfo, setScrollInfo] = useState<{ isAtBottom: boolean; scrollToBottom: (behavior?: ScrollBehavior) => void } | null>(null);

  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
    hasSentMessage,
    hasFirstCharacter,
  } = useMessages({
    status,
    messages,
  });

  const { messages: chatMessages, votes: chatVotes } = useChatMessages({
    chatId,
    initialMessages: messages,
  });

  const memoizedMessages = useMemo(() => chatMessages, [chatMessages]);
  const memoizedVotes = useMemo(() => chatVotes || votes, [chatVotes, votes]);

  const handleScrollToBottom = useCallback((behavior?: ScrollBehavior) => {
    scrollToBottom(behavior);
  }, [scrollToBottom]);

  useEffect(() => {
    setScrollInfo({ isAtBottom, scrollToBottom: handleScrollToBottom });
  }, [isAtBottom, handleScrollToBottom]);

  useDataStream();

  useEffect(() => {
    if (status === "submitted") {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
      });
    }
  }, [status, messagesContainerRef]);

  const shouldShowThinking = useMemo(() => {
    return status === "submitted" && 
           (messages.length === 0 || messages[messages.length - 1]?.role === 'user') &&
           !hasFirstCharacter;
  }, [status, messages, hasFirstCharacter]);

  const renderMessage = useCallback((message: ChatMessage, index: number) => {
    const isLoading = status === "streaming" &&
                    messages.length - 1 === index &&
                    message.role === "assistant" &&
                    !message.parts.some(part => part.type === "text" && part.text?.trim());
    
    const vote = memoizedVotes.find((vote) => vote.messageId === message.id);
    
    return (
      <PreviewMessage
        chatId={chatId}
        isLoading={isLoading}
        isReadonly={isReadonly}
        key={message.id}
        message={message}
        regenerate={regenerate}
        requiresScrollPadding={hasSentMessage && index === messages.length - 1}
        setMessages={setMessages}
        vote={vote}
      />
    );
  }, [chatId, status, messages, memoizedVotes, isReadonly, regenerate, hasSentMessage, setMessages]);

  return (
    <div
      className="overscroll-behavior-contain -webkit-overflow-scrolling-touch flex-1 touch-pan-y overflow-y-scroll"
      ref={messagesContainerRef}
      style={{ overflowAnchor: "none" }}
    >
      <Conversation className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 md:gap-6">
        <ConversationContent className="flex flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
          {messages.length === 0 && <Greeting />}

          {memoizedMessages.map(renderMessage)}

          <AnimatePresence mode="wait">
            {shouldShowThinking && <ThinkingMessage key="thinking" />}
          </AnimatePresence>

          {scrollInfo && !scrollInfo.isAtBottom && (
            <button
              aria-label="Scroll to bottom"
              className="-translate-x-1/2 absolute bottom-20 left-1/2 z-10 rounded-full border bg-background p-2 shadow-lg transition-colors hover:bg-muted"
              onClick={() => scrollInfo.scrollToBottom("smooth")}
              type="button"
            >
              <ArrowDownIcon className="size-4" />
            </button>
          )}

          <div
            className="min-h-[24px] min-w-[24px] shrink-0"
            ref={messagesEndRef}
          />
        </ConversationContent>
      </Conversation>
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) {
    return true;
  }

  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false;
  }
  if (!equal(prevProps.messages, nextProps.messages)) {
    return false;
  }
  if (!equal(prevProps.votes, nextProps.votes)) {
    return false;
  }

  return false;
});
