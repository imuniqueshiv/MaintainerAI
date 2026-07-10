import { Card, CardContent } from "@/components/ui/card";

export function StatCardSkeleton() {
  return (
    <Card className="bg-card border border-border">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-border">
      <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      <div className="h-4 w-16 bg-muted rounded animate-pulse" />
      <div className="h-4 w-12 bg-muted rounded animate-pulse" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <Card className="bg-card border border-border">
      <CardContent className="pt-6 space-y-4">
        <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
