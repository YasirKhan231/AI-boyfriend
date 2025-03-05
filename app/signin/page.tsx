"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const user = await signInWithGoogle();
      if (user) {
        router.push("/"); // Redirect to home after successful sign-in
      }
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-secondary/20">
        <CardHeader className="space-y-1 flex flex-col items-center text-center pb-2">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="Boltshift Logo"
              width={32}
              height={32}
              className="text-black"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome Back
          </CardTitle>
          <CardDescription>Sign in to access your AI friend</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-2">
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
            Sign in to continue your conversation with your AI assistant and
            access all features
          </p>

          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            variant="outline"
            className="w-full bg-white text-black hover:bg-gray-100 hover:text-black rounded-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg
                className="mr-2 h-4 w-4"
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
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-secondary/20 px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button variant="secondary" className="w-full rounded-full">
            Create an account
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <a
              href="#"
              className="font-medium text-primary hover:text-primary/80"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="font-medium text-primary hover:text-primary/80"
            >
              Privacy Policy
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
