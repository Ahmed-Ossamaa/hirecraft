"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import {
  MdPrecisionManufacturing,
  MdArrowForward,
  MdArrowBack,
  MdSquareFoot,
} from "react-icons/md";
import { Button } from "@/shared/components/ui/Button";

export const AuthSlider = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialMode =
    searchParams.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Sync state with URL without triggering a full page reload if needed
  useEffect(() => {
    const currentMode = searchParams.get("mode");
    if (currentMode === "register" && mode !== "register") {
      setMode("register");
    } else if (currentMode !== "register" && mode === "register") {
      setMode("login");
    }
  }, [searchParams]);

  const handleModeChange = (newMode: "login" | "register") => {
    setMode(newMode);
    router.replace(`${pathname}?mode=${newMode}`, { scroll: false });
  };

  const isRegister = mode === "register";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 py-8 lg:py-6 relative z-20 w-full max-w-7xl mx-auto">
      {/* Mobile-only Centered Header linking to home'/'*/}
      <Link
        href="/"
        className="lg:hidden flex items-center gap-2.5 mb-5 group cursor-pointer transition-transform hover:scale-[1.02]"
        title="Return to Home"
      >
        <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-primary group-hover:border-primary group-hover:scale-105 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
          <MdSquareFoot className="text-xl" />
        </div>
        <div className="flex items-center gap-1.5">
          <h1 className="font-headline font-bold text-2xl tracking-tight text-foreground">
            Technically
          </h1>
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        </div>
      </Link>

      <div className="relative w-full max-w-5xl h-auto lg:h-150 bg-card border border-border rounded-2xl shadow-2xl flex flex-col lg:flex-row lg:overflow-hidden my-auto">
        {/* Mobile View Toggle - hidden on lg */}
        <div className="lg:hidden w-full flex p-4 border-b border-border bg-background rounded-t-2xl">
          <div className="flex w-full bg-input p-1 rounded-xl gap-1">
            <Button
              onClick={() => handleModeChange("login")}
              variant={!isRegister ? "primary" : "ghost"}
              className="flex-1 "
            >
              Sign In
            </Button>
            <Button
              onClick={() => handleModeChange("register")}
              variant={isRegister ? "primary" : "ghost"}
              className="flex-1"
            >
              Register
            </Button>
          </div>
        </div>

        {/* left :Sign in */}
        <div
          className={`w-full lg:w-1/2 p-6 sm:p-7 lg:py-6 lg:px-9 relative border-r border-border/50 lg:block ${isRegister ? "hidden lg:block" : "block"}`}
        >
          <div
            className={`w-full h-full transition-[opacity,transform] duration-[400ms,650ms] ease-[ease,cubic-bezier(0.65,0,0.35,1)] ${
              isRegister
                ? "lg:opacity-0 lg:-translate-x-7.5 lg:pointer-events-none opacity-0 hidden lg:flex"
                : "opacity-100 translate-x-0 pointer-events-auto"
            }`}
          >
            <LoginForm />
          </div>
        </div>

        {/* right: SIGN UP */}
        <div
          className={`w-full lg:w-1/2 p-6 sm:p-7 lg:py-6 lg:px-9 relative bg-card lg:block ${!isRegister ? "hidden lg:block" : "block"}`}
        >
          <div
            className={`w-full h-full transition-[opacity,transform] duration-[400ms,650ms] ease-[ease,cubic-bezier(0.65,0,0.35,1)] ${
              !isRegister
                ? "lg:opacity-0 lg:translate-x-7.5 lg:pointer-events-none opacity-0 hidden lg:flex"
                : "opacity-100 translate-x-0 pointer-events-auto"
            }`}
          >
            <SignupForm onSuccess={() => handleModeChange("login")} />
          </div>
        </div>

        {/* Overlay panel (Desktop lg) */}
        <div
          className={`absolute top-0 left-[50%] w-[50%] h-full hidden lg:block border-l border-border bg-background shadow-2xl z-40 transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
            isRegister ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          {/* Image Backdrop */}
          <Image
            alt="Industrial technician operating a CNC machine on a manufacturing floor"
            className="  object-cover object-center filter brightness-[0.8] contrast-[1.12]"
            src="/images/sqr_img_39.jpg"
            fill
            sizes="50vw"
            priority
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-sky-950/20 mix-blend-overlay"></div>

          {/* Overlay Content */}
          <div className="absolute inset-0 p-8 flex flex-col z-10">
            {/* Top Bar with Specialized Trades Badge */}
            <div className="flex items-center justify-end shrink-0">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase bg-input/90 backdrop-blur-md border border-primary/40 text-primary flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span>Specialized Trades</span>
              </span>
            </div>

            {/* Centered Content */}
            <div className="flex-1 flex flex-col justify-end mb-15">
              <div className="p-5 rounded-2xl bg-card/90 backdrop-blur-md border border-border/80 mb-4 shadow-xl">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <MdPrecisionManufacturing className="text-base" />
                  <span className="text-[11px] font-mono uppercase font-semibold">
                    Precision Skill Matching
                  </span>
                </div>
                <h3 className="font-headline text-xl text-foreground leading-tight">
                  {isRegister
                    ? "Filter talent by the exact machinery and control systems on your factory floor."
                    : "Stop re-writing your resume. Let your hands-on machine experience do the talking."}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {isRegister
                    ? "Skip the irrelevant resumes and connect instantly with qualified operators and maintenance mechanics."
                    : "Join an exclusive network of CNC operators, maintenance mechanics, and specialized factory technicians."}
                </p>
              </div>
              <Button
                onClick={() =>
                  handleModeChange(isRegister ? "login" : "register")
                }
                variant="primary"
                fullWidth
                rightIcon={<MdArrowForward className="text-sm" />}
              >
                {isRegister
                  ? "Already have an account? Sign In"
                  : "Need an account? Register Now"}
              </Button>

              {/* back to home*/}
              <div className="flex flex-col items-center mt-3">
                <Link
                  href="/"
                  className="inline-flex items-center bg-card/80 gap-1.5 text-xs text-muted-foreground/80 hover:text-foreground transition-colors group cursor-pointer py-1 px-3 border   rounded-full"
                >
                  <MdArrowBack className="text-xs transition-transform group-hover:-translate-x-1" />
                  <span>Back to home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
