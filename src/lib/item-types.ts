import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  type LucideIcon,
} from "lucide-react";
import { mockItemTypes } from "@/lib/mock-data";

export const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

export function getItemTypeInfo(itemTypeId: string) {
  const itemType = mockItemTypes.find((t) => t.id === itemTypeId);
  const icon = itemType ? (ICON_MAP[itemType.icon] ?? Code) : Code;
  const color = itemType?.color ?? "#6b7280";
  return { icon, color, name: itemType?.name ?? "unknown" };
}
