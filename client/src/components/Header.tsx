import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="flex justify-between items-center py-3 px-4 border-b bg-white/90 backdrop-blur-sm sticky top-0 z-10 animate-fade-in">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          PDFChat
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="h-9 w-9 transition-all hover:scale-110 cursor-pointer shadow-sm border border-slate-200">
          <AvatarImage src="/me.png" alt="User" />
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            US
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;
