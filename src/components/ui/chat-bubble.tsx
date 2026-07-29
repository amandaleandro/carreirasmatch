import React from "react";
import { Bot, User } from "lucide-react";

export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  sender?: "ai" | "user" | "system";
  avatar?: string | React.ReactNode;
  time?: string;
  senderName?: string;
  children: React.ReactNode;
}

export function ChatBubble({
  sender = "ai",
  avatar,
  time,
  senderName,
  className = "",
  children,
  ...props
}: ChatBubbleProps) {
  const isUser = sender === "user";

  return (
    <div
      className={`flex items-start gap-3 my-2 ${
        isUser ? "flex-row-reverse" : "flex-row"
      } ${className}`}
      {...props}
    >
      <div className="shrink-0">
        {avatar ? (
          typeof avatar === "string" ? (
            <img src={avatar} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            avatar
          )
        ) : isUser ? (
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <User className="h-4 w-4" />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-slate-900 dark:bg-slate-800 text-blue-400 flex items-center justify-center border border-slate-700">
            <Bot className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className={`max-w-[82%] space-y-1 ${isUser ? "text-right" : "text-left"}`}>
        {senderName && (
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1">
            {senderName}
          </p>
        )}
        <div
          className={`${
            isUser ? "chat-bubble-user" : "chat-bubble-ai"
          } text-sm leading-relaxed text-slate-900 dark:text-slate-100`}
        >
          {children}
        </div>
        {time && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 px-1">{time}</p>
        )}
      </div>
    </div>
  );
}
