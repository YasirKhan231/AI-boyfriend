"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Phone, LogOut, Moon, Sun } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logOut } from "@/app/firebase/auth";
import { toast } from "react-toastify";
import { User } from "firebase/auth";

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check localStorage for dark mode preference
    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await logOut();
      toast.success("Signed out successfully");
      router.push("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = () => {
    // Implement call functionality
    toast.info("Call feature coming soon!");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center ring-1 ring-zinc-700">
              <Image
                src="/placeholder.svg?height=24&width=24"
                alt="Logo"
                width={20}
                height={20}
                className="text-white"
              />
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
              AI Assistant
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.displayName?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                  <span className="ml-2 text-zinc-300">{user.displayName}</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                  onClick={handleCall}
                >
                  <Phone className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  disabled={isLoading}
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px] bg-zinc-900 border-zinc-800">
                {user && (
                  <div className="flex flex-col space-y-4 mt-6">
                    <div className="flex items-center p-2">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt={user.displayName || "User"}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                          <span className="text-lg font-medium text-white">
                            {user.displayName?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}
                      <span className="ml-3 text-lg text-zinc-300">
                        {user.displayName}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      onClick={handleCall}
                      className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Start Call
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={toggleDarkMode}
                      className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      {isDarkMode ? (
                        <>
                          <Sun className="h-5 w-5 mr-2" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="h-5 w-5 mr-2" />
                          Dark Mode
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      disabled={isLoading}
                      className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
