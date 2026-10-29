import Link from "next/link";
import { MdSquareFoot } from "react-icons/md";

export const Footer = () => {
  return (
    <footer className="w-full bg-background border-t border-border/60 mt-auto">
      <div className="max-w-360 mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-card-hover border border-border flex items-center justify-center text-primary">
            <MdSquareFoot className="text-[16px]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm text-foreground tracking-tight">
              Technically
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          </div>
          <span className="text-border">|</span>
          <p className="text-xs text-muted-foreground">
            Connecting skilled machine operators with local manufacturing
            plants.
          </p>
        </div>

        {/* Right : Links*/}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <Link href="/about" className="hover:text-primary transition-colors">
            About Us
          </Link>
          <Link href="/faq" className="hover:text-primary transition-colors">
            FAQ
          </Link>
          <Link
            href="/privacy"
            className="hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link
            href="/contact"
            className="hover:text-primary transition-colors"
          >
            Contact Us
          </Link>
          <span className="text-border hidden sm:inline">|</span>
          <span>© 2026 Technically</span>
        </div>
      </div>
    </footer>
  );
};
