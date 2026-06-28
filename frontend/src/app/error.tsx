"use client";

import { ErrorState } from "@/components/ui/states";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page py-20">
      <ErrorState
        title="This pitch didn't go to plan"
        description="Something went wrong loading the page. Give it another go."
        onRetry={reset}
      />
    </div>
  );
}
