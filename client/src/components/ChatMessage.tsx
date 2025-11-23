import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const ChatMessage = ({ content, role, timestamp }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 w-full max-w-full mb-4 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
          <AvatarImage src="/pdfAI.png" alt="AI" />
          <AvatarFallback className="bg-gradient-to-br from-palette-3 to-palette-4 text-white">
            AI
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "py-2 px-3 rounded-lg max-w-[85%]",
          isUser
            ? "bg-palette-3 text-primary-foreground rounded-tr-none"
            : "bg-accent text-accent-foreground rounded-tl-none"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
        <p
          className={cn(
            "text-xs mt-1",
            isUser ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
          <AvatarImage src="/me.png" alt="User" />
          <AvatarFallback className="bg-gradient-to-br from-palette-1 to-palette-2 text-white">
            US
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;

// "use client";

// import * as React from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import ChatMessage from "@/components/ChatMessage"; // Path must match your project
// import { v4 as uuidv4 } from "uuid";

// interface Doc {
//   pageContent?: string;
//   metadata: {
//     loc?: {
//       pageNumber?: number;
//     };
//     source?: string;
//   };
// }

// interface Imessage {
//   role: "assistant" | "user";
//   content?: string;
//   documents?: Doc[];
//   timestamp: Date;
//   id: string;
// }

// const ChatComponent: React.FC = () => {
//   const [message, setMessage] = React.useState<string>("");
//   const [messages, setMessages] = React.useState<Imessage[]>([]);

//   const handleSendChatMessage = async () => {
//     if (!message.trim()) return;

//     const userMessage: Imessage = {
//       id: uuidv4(),
//       role: "user",
//       content: message,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMessage]);

//     try {
//       const res = await fetch(`http://localhost:8000/chat?message=${encodeURIComponent(message)}`);
//       const data = await res.json();

//       const assistantMessage: Imessage = {
//         id: uuidv4(),
//         role: "assistant",
//         content: data?.message,
//         documents: data?.docs,
//         timestamp: new Date(),
//       };

//       setMessages((prev) => [...prev, assistantMessage]);
//     } catch (err) {
//       console.error("Failed to send message:", err);
//     }

//     setMessage("");
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       handleSendChatMessage();
//     }
//   };

//   return (
//     <div className="p-4 pb-24">
//       <div className="flex flex-col space-y-2 mb-4">
//         {messages.map((msg) =>
//           msg.content ? (
//             <ChatMessage
//               key={msg.id}
//               content={msg.content}
//               role={msg.role}
//               timestamp={msg.timestamp}
//             />
//           ) : null
//         )}
//       </div>
//       <div className="fixed bottom-4 left-0 w-full px-4 flex gap-3">
//         <Input
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Type your query here"
//           onKeyDown={handleKeyDown}
//         />
//         <Button onClick={handleSendChatMessage} disabled={!message.trim()}>
//           Send
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default ChatComponent;
