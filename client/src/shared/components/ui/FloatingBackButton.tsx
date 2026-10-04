"use client";

import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

export const FloatingBackButton = () => {
  const router = useRouter();

  return (
    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 bg-background/80 hover:bg-background backdrop-blur-md text-foreground rounded-full border border-border shadow-sm transition-all cursor-pointer"
        title="Go Back"
      >
        <MdArrowBack className="text-xl" />
        <span className="font-medium text-sm hidden sm:inline">Back</span>
      </button>
    </div>
  );
};
