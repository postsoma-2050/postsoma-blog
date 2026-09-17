import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function PostLoading() {
  return (
    <div className="min-h-[60vh] max-w-[720px] mx-auto px-6 flex flex-col items-center justify-center">
      <LoadingSpinner text="FETCHING TRANSMISSION..." />
    </div>
  );
}
