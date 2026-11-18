import {
  Award,
  Backpack,
  BookOpen,
  Calendar,
  Clock,
  Compass,
  Flag,
  Footprints,
  Globe,
  GraduationCap,
  Heart,
  HeartPulse,
  Leaf,
  MapPin,
  Medal,
  Mountain,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Tent,
  ThumbsUp,
  TreePine,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon names stored on highlight items. Keep in sync with the website's
 * `lib/highlight-icons.ts` (same keys).
 */
export const HIGHLIGHT_ICONS: Record<string, { label: string; Icon: LucideIcon }> = {
  trophy: { label: "Trophy", Icon: Trophy },
  users: { label: "Users", Icon: Users },
  "shield-check": { label: "Shield", Icon: ShieldCheck },
  award: { label: "Award", Icon: Award },
  medal: { label: "Medal", Icon: Medal },
  star: { label: "Star", Icon: Star },
  mountain: { label: "Mountain", Icon: Mountain },
  compass: { label: "Compass", Icon: Compass },
  tent: { label: "Tent", Icon: Tent },
  "tree-pine": { label: "Pine Tree", Icon: TreePine },
  leaf: { label: "Leaf", Icon: Leaf },
  footprints: { label: "Footprints", Icon: Footprints },
  backpack: { label: "Backpack", Icon: Backpack },
  "map-pin": { label: "Map Pin", Icon: MapPin },
  globe: { label: "Globe", Icon: Globe },
  flag: { label: "Flag", Icon: Flag },
  calendar: { label: "Calendar", Icon: Calendar },
  clock: { label: "Clock", Icon: Clock },
  "graduation-cap": { label: "Graduation Cap", Icon: GraduationCap },
  "book-open": { label: "Book", Icon: BookOpen },
  "heart-pulse": { label: "Heart Pulse", Icon: HeartPulse },
  heart: { label: "Heart", Icon: Heart },
  smile: { label: "Smile", Icon: Smile },
  "thumbs-up": { label: "Thumbs Up", Icon: ThumbsUp },
  sparkles: { label: "Sparkles", Icon: Sparkles },
};

/** Sign/suffix shown after the numeric value. Must match the backend enum. */
export const HIGHLIGHT_VALUE_SIGNS: { value: string; label: string }[] = [
  { value: "", label: "None" },
  { value: "+", label: "Plus (16+)" },
  { value: "-", label: "Minus (16-)" },
  { value: "*", label: "Asterisk (16*)" },
  { value: "%", label: "Percent (100%)" },
  { value: "x", label: "Times (3x)" },
  { value: "K", label: "Thousand (15K)" },
  { value: "K+", label: "Thousand plus (15K+)" },
  { value: "M", label: "Million (2M)" },
  { value: "M+", label: "Million plus (2M+)" },
];

export function formatHighlightValue(value?: number | null, sign?: string) {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return `${value.toLocaleString("en-US")}${sign ?? ""}`;
}
