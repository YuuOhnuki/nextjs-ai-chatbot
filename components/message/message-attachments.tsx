"use client";
import type { ChatMessage } from "@/lib/types";
import { PreviewAttachment } from "@/components/preview-attachment";

interface MessageAttachmentsProps {
  message: ChatMessage;
}

export function MessageAttachments({ message }: MessageAttachmentsProps) {
  const attachments = message.parts.filter((part) => part.type === "file");

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div
      className="flex flex-row justify-end gap-2"
      data-testid="message-attachments"
    >
      {attachments.map((attachment) => (
        <PreviewAttachment
          attachment={{
            name: attachment.filename ?? "file",
            contentType: attachment.mediaType,
            url: attachment.url,
          }}
          key={attachment.url}
        />
      ))}
    </div>
  );
}
