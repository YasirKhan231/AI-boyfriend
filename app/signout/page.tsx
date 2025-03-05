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
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";

export default function SignOutPage() {
  const [isLoading, setIsLoading] = useState(false);
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
            Sign Out
          </CardTitle>
          <CardDescription>
            Are you sure you want to sign out from the AI Assistant?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-2">
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            You will need to sign in again to continue using the AI chat
            features and access your conversation history.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full font-semibold rounded-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                Sign Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This will sign you out from your current session. You will
                  need to sign in again to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSignOut}
                  className="bg-destructive hover:bg-destructive/90 text-white rounded-full"
                >
                  Yes, sign me out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="outline"
            className="w-full rounded-full"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
