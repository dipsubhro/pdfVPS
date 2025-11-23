import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "./ChatMessage";
import { Send } from "lucide-react";

interface Doc {
  pageContent?: string;
  metadata: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
}

interface Message {
  id: number;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  documents?: Doc[];
}

const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "Hello! I can help you analyze the PDF you've uploaded. Feel free to ask me any questions about the document.",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = {
      id: messages.length + 1,
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/chat?message=${input}`);
      const data = await res.json();

      const aiMessage: Message = {
        id: messages.length + 2,
        content: data?.message,
        role: "assistant",
        timestamp: new Date(),
        documents: data?.docs,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-3">
        <h2 className="text-lg font-semibold">Chat with your PDF</h2>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="flex flex-col">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              role={message.role}
              timestamp={message.timestamp}
            />
          ))}

          {isLoading && (
            <div className="flex gap-2 items-center my-4 animate-fade-in">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse-light"></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse-light delay-300"></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse-light delay-500"></div>
              <span className="text-sm text-muted-foreground">AI is thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Ask something about your PDF..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={input.trim() === "" || isLoading}
            className="transition-all hover:scale-105"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;


// import React, { useState, useRef, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import ChatMessage from './ChatMessage';
// import { Send } from 'lucide-react';

// interface Message {
//   id: number;
//   content: string;
//   role: 'user' | 'assistant';
//   timestamp: Date;
// }

// const ChatPanel = () => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: 1,
//       content: "Hello! I can help you analyze the PDF you've uploaded. Feel free to ask me any questions about the document.",
//       role: 'assistant',
//       timestamp: new Date(),
//     }
//   ]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const scrollAreaRef = useRef<HTMLDivElement>(null);

//   const handleSend = () => {
//     if (input.trim() === '') return;

//     // Add user message
//     const userMessage: Message = {
//       id: messages.length + 1,
//       content: input,
//       role: 'user',
//       timestamp: new Date(),
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInput('');
//     setIsLoading(true);

//     // Simulate AI reply after a short delay
//     setTimeout(() => {
//       const aiMessage: Message = {
//         id: messages.length + 2,
//         content: `I'm analyzing your question about the PDF: "${input}".\n\nThis is a simulated response for the demo. In a real implementation, this would connect to an AI service to process your PDF and provide relevant answers.`,
//         role: 'assistant',
//         timestamp: new Date(),
//       };

//       setMessages(prev => [...prev, aiMessage]);
//       setIsLoading(false);
//     }, 1500);
//   };

//   // Scroll to bottom when messages update
//   useEffect(() => {
//     if (scrollAreaRef.current) {
//       const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
//       if (scrollContainer) {
//         scrollContainer.scrollTop = scrollContainer.scrollHeight;
//       }
//     }
//   }, [messages]);

//   return (
//     <div className="flex flex-col h-full">
//       <div className="border-b p-3">
//         <h2 className="text-lg font-semibold">Chat with your PDF</h2>
//       </div>

//       <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
//         <div className="flex flex-col">
//           {messages.map((message) => (
//             <ChatMessage
//               key={message.id}
//               content={message.content}
//               role={message.role}
//               timestamp={message.timestamp}
//             />
//           ))}

//           {isLoading && (
//             <div className="flex gap-2 items-center my-4 animate-fade-in">
//               <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse-light"></div>
//               <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse-light delay-300"></div>
//               <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse-light delay-500"></div>
//               <span className="text-sm text-gray-500">AI is thinking...</span>
//             </div>
//           )}
//         </div>
//       </ScrollArea>

//       <div className="p-3 border-t">
//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             handleSend();
//           }}
//           className="flex gap-2"
//         >
//           <Input
//             placeholder="Ask something about your PDF..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             className="flex-1"
//             disabled={isLoading}
//           />
//           <Button
//             type="submit"
//             size="icon"
//             disabled={input.trim() === '' || isLoading}
//             className="transition-all hover:scale-105"
//           >
//             <Send className="h-4 w-4" />
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ChatPanel;
