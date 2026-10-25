"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui";
import { MdInfoOutline, MdArrowBack } from "react-icons/md";

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-card rounded-3xl border border-border/80 shadow-lg p-8 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto text-3xl">
          <MdInfoOutline />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-foreground tracking-tight">
            Checkout Incomplete
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your checkout session was canceled or timed out. No charges were made to your account.
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full text-sm"
          onClick={() => router.replace("/dashboard/company/billing")}
          leftIcon={<MdArrowBack />}
        >
          Return to Billing & Plans
        </Button>
      </div>
    </div>
  );
}
