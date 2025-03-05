import Image from "next/image";

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
      <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center">
        <Image
          src="/placeholder.svg?height=40&width=40"
          alt="Boltshift Logo"
          width={24}
          height={24}
          className="text-black"
        />
      </div>

      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-white rounded-full animate-pulse delay-150"></div>
        <div className="w-3 h-3 bg-white rounded-full animate-pulse delay-300"></div>
      </div>

      <p className="text-lg">Loading...</p>
    </div>
  );
}
