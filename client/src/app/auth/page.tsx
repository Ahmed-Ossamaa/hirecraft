import { AuthSlider } from '@/features/auth/components/AuthSlider';

export default function AuthPage() {
  return (
    <div className="bg-background text-foreground font-body min-h-screen antialiased selection:bg-primary selection:text-white flex flex-col justify-between relative overflow-x-hidden">
      {/* background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-180 h-125 bg-primary/10 rounded-full blur-[140px]"></div>
        <div className="absolute -bottom-40 right-1/4 w-150 h-125 bg-primary/20 rounded-full blur-[160px]"></div>
      </div>


      {/* Main Container with Slider */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center">
        <AuthSlider />
      </main>
    </div>
  );
}
