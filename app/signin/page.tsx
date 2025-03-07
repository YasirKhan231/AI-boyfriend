"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { signInWithGoogle } from "../firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/"); // Redirect when Firebase detects a signed-in user
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignIn = async () => {
    setIsLoading(true);
    const user = await signInWithGoogle();
    if (user) {
      router.push("/onboarding"); // Ensure redirect on successful sign-in
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-xl relative overflow-hidden">
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 border border-zinc-800 rounded-lg z-0"></div>
        <div className="absolute -inset-[1px] bg-gradient-to-r from-zinc-800/0 via-zinc-700/50 to-zinc-800/0 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse"></div>

        <CardHeader className="space-y-1 flex flex-col items-center text-center pb-8 relative z-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center mb-6 ring-1 ring-zinc-700 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-blue-500/10 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Image
              src="/placeholder.svg?height=48&width=48"
              alt="AI Boyfriend Logo"
              width={40}
              height={40}
              className="text-white relative z-10"
            />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tighter bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Continue with Google to access your AI friend
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-6 relative z-10">
          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full font-medium rounded-full h-12 text-base transition-all duration-300 transform hover:scale-[1.02] bg-white text-black hover:bg-zinc-100 shadow-md group relative overflow-hidden hover:cursor-pointer"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Subtle shine effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-zinc-100/0 via-zinc-400/20 to-zinc-100/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>

            <span className="relative flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <svg
                  className={`mr-2 h-5 w-5 transition-transform duration-300 ${
                    isHovering ? "scale-110" : ""
                  }`}
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
              )}
              {isLoading ? "Signing in..." : "Continue with Google"}
            </span>
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2 pb-8 relative z-10">
          <p className="text-center text-xs text-zinc-500">
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
