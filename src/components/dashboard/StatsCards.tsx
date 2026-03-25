import {
  LayoutGrid,
  FolderOpen,
  Star,
  FolderHeart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/db/items";

export default async function StatsCards() {
  const { totalItems, totalCollections, favoriteItems, favoriteCollections } =
    await getDashboardStats();

  const stats = [
    {
      label: "Total Items",
      value: totalItems,
      icon: LayoutGrid,
      color: "#3b82f6",
    },
    {
      label: "Collections",
      value: totalCollections,
      icon: FolderOpen,
      color: "#8b5cf6",
    },
    {
      label: "Favorite Items",
      value: favoriteItems,
      icon: Star,
      color: "#f59e0b",
    },
    {
      label: "Favorite Collections",
      value: favoriteCollections,
      icon: FolderHeart,
      color: "#ec4899",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm">
          <CardContent className="flex items-center gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <stat.icon className="size-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
