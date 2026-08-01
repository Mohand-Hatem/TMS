import { ReactNode } from "react";
import { AuthLogo } from "@/components/auth/auth-logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-4 md:p-8">
      {/* Pinned Top-Left Branding per Stitch Reference */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8">
        <AuthLogo />
      </div>

      <main className="w-full max-w-100 my-12">{children}</main>
    </div>
  );
}
