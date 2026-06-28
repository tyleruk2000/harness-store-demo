import { Skeleton } from "@/components/ui/states";

export default function Loading() {
  return (
    <div className="container-page py-8">
      <Skeleton className="mb-6 h-4 w-56" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-12 w-full max-w-xs" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
