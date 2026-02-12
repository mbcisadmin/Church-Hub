import {
  Users,
  Hash,
  CircleDot,
  BarChart3,
  Rocket,
  Search,
  Settings,
  Home,
  Calendar,
  Mail,
  Bell,
  Heart,
  Star,
  Folder,
  FileText,
  Image,
  Video,
  Music,
  MapPin,
  Phone,
  Globe,
  Lock,
  Unlock,
  Eye,
  Edit,
  Trash,
  Plus,
  Minus,
  Check,
  X,
  ChevronRight,
  Calculator,
  PieChart,
  type LucideIcon,
} from 'lucide-react';

/**
 * Map of icon names (lowercase) to Lucide components.
 * Keys are normalized to lowercase for case-insensitive lookup.
 */
const iconMap: Record<string, LucideIcon> = {
  users: Users,
  hash: Hash,
  circledot: CircleDot,
  barchart3: BarChart3,
  rocket: Rocket,
  search: Search,
  settings: Settings,
  home: Home,
  calendar: Calendar,
  mail: Mail,
  bell: Bell,
  heart: Heart,
  star: Star,
  folder: Folder,
  filetext: FileText,
  image: Image,
  video: Video,
  music: Music,
  mappin: MapPin,
  phone: Phone,
  globe: Globe,
  lock: Lock,
  unlock: Unlock,
  eye: Eye,
  edit: Edit,
  trash: Trash,
  plus: Plus,
  minus: Minus,
  check: Check,
  x: X,
  chevronright: ChevronRight,
  calculator: Calculator,
  piechart: PieChart,
  'pie-chart': PieChart,
};

/**
 * Get a Lucide icon component by name.
 * Handles various formats: PascalCase, camelCase, kebab-case, lowercase.
 * Falls back to Rocket if icon not found.
 */
export function getIcon(name: string): LucideIcon {
  // Normalize: remove hyphens and convert to lowercase
  const normalized = name.toLowerCase().replace(/-/g, '');
  return iconMap[normalized] || iconMap[name.toLowerCase()] || Rocket;
}

/**
 * Render a Lucide icon by name with optional className.
 */
export function Icon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  const IconComponent = getIcon(name);
  return <IconComponent className={className} />;
}
