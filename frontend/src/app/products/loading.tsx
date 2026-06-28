import { ProductGridSkeleton } from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/states";

export default function Loading() {
  return (
    <div className="container-page py-10">
      <Skeleton className="mb-2 h-9 w-48" />
      <Skeleton className="mb-8 h-4 w-32" />
      <ProductGridSkeleton />
    </div>
  );
}
