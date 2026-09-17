import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function GlobalLoading() {
  return (
    <div className="mx-auto max-w-[760px] px-6 flex flex-col items-center justify-center min-h-[50vh]">
      <LoadingSpinner text="INITIALIZING SYSTEM..." />
    </div>
  );
}
