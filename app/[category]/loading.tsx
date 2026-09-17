import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function CategoryLoading() {
  return (
    <div className="min-h-[50vh] max-w-[760px] mx-auto px-6 flex flex-col items-center justify-center">
      <LoadingSpinner text="ACCESSING SECTOR ARCHIVE..." />
    </div>
  );
}
