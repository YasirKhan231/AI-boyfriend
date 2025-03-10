"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logOut } from "../firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";

export default function SignOutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();

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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-xl relative overflow-hidden">
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 border border-zinc-800 rounded-lg z-0"></div>
        <div className="absolute -inset-[1px] bg-gradient-to-r from-zinc-800/0 via-zinc-700/50 to-zinc-800/0 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse"></div>

        <CardHeader className="space-y-1 flex flex-col items-center text-center pb-8 relative z-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center mb-6 ring-1 ring-zinc-700 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Image
              src="/placeholder.svg?height=48&width=48"
              alt="Boltshift Logo"
              width={40}
              height={40}
              className="text-white relative z-10"
            />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tighter bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
            Sign Out
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Are you sure you want to sign out from the AI Assistant?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-6 relative z-10">
          <p className="text-sm text-zinc-500 text-center max-w-sm">
            You will need to sign in again to continue using the AI chat
            features and access your conversation history.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2 pb-8 relative z-10">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full font-medium rounded-full h-12 text-base transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 shadow-md hover:shadow-red-500/20 group relative overflow-hidden  hover:cursor-pointer"
                disabled={isLoading}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {/* Subtle pulse effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-500/0 via-white/10 to-red-500/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>

                <span className="relative flex items-center justify-center">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <LogOut
                      className={`w-5 h-5 mr-2 transition-transform duration-300 ${
                        isHovering ? "scale-110" : ""
                      }`}
                    />
                  )}
                  Sign Out
                </span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border-zinc-800 shadow-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  This will sign you out from your current session. You will
                  need to sign in again to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full bg-zinc-800 hover:bg-zinc-700 border-zinc-700 transition-all duration-200">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSignOut}
                  className="rounded-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-md hover:shadow-red-500/20 transition-all duration-200 hover:cursor-pointer"
                >
                  Yes, sign me out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="outline"
            className="w-full rounded-full h-12 text-base font-medium border-zinc-800 hover:bg-zinc-800 transition-all duration-300 hover:border-zinc-700 group relative overflow-hidden  hover:cursor-pointer"
            onClick={() => router.back()}
          >
            {/* Subtle shine effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-zinc-800/0 via-zinc-400/10 to-zinc-800/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>

            <span className="relative flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
              Go Back
            </span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
