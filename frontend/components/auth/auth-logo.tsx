import { SiSpacemacs } from "react-icons/si";

export function AuthLogo({ showText = true }: { showText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <SiSpacemacs className="h-6 w-6" />
      </div>
      {showText && (
        <span className="text-xl font-semibold tracking-tight text-foreground">
          TMS
        </span>
      )}
    </div>
  );
}
