"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Plus, Search, Clock, Settings } from "lucide-react";
import { useState } from "react";

interface LandingPageProps {
  userName: string;
  onStartChat: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ userName, onStartChat }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onStartChat();
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Left Sidebar */}
      <div className="w-16 border-r border-gray-800 flex flex-col items-center py-4 space-y-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <Moon className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <Clock className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold">
              Hi, {userName}
            </h1>
            <p className="text-xl md:text-2xl text-gray-400">
              How may I help you?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2 bg-gray-900 border-gray-800 hover:bg-gray-800"
              onClick={onStartChat}
            >
              <div className="p-2 bg-gray-800 rounded-lg">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-sm">Create a to-do calendar</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2 bg-gray-900 border-gray-800 hover:bg-gray-800"
              onClick={onStartChat}
            >
              <div className="p-2 bg-gray-800 rounded-lg">
                <Search className="h-5 w-5" />
              </div>
              <span className="text-sm">
                Create a meal plan for my healthy living
              </span>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="relative">
              <Input
                placeholder="Ask AI a question or make a request..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-gray-900 border-gray-800 rounded-xl py-6 pl-12 pr-12 text-white placeholder:text-gray-500"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Plus className="h-5 w-5 text-gray-500" />
              </div>
              <Button
                type="submit"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-transparent hover:bg-gray-800"
              >
                <Search className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
