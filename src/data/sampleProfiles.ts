import { UserProfile } from '../types';

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user_1',
    name: 'Orang 1 (Aji)',
    subtitle: 'Keuangan Pribadi Utama',
    avatarIcon: 'User',
    color: 'emerald',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    borderClass: 'border-emerald-300',
  },
  {
    id: 'user_2',
    name: 'Orang 2 (Pasangan)',
    subtitle: 'Keuangan Mandiri Pasangan',
    avatarIcon: 'Heart',
    color: 'violet',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-800',
    borderClass: 'border-violet-300',
  },
];

export const PROFILE_COLOR_MAP: Record<
  string,
  {
    color: string;
    label: string;
    bgBadge: string;
    textBadge: string;
    bgAccent: string;
    textAccent: string;
    border: string;
    dot: string;
  }
> = {
  emerald: {
    color: 'emerald',
    label: 'Hijau Zamrud',
    bgBadge: 'bg-emerald-100',
    textBadge: 'text-emerald-800',
    bgAccent: 'bg-emerald-600',
    textAccent: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  violet: {
    color: 'violet',
    label: 'Ungu Violet',
    bgBadge: 'bg-violet-100',
    textBadge: 'text-violet-800',
    bgAccent: 'bg-violet-600',
    textAccent: 'text-violet-700',
    border: 'border-violet-200',
    dot: 'bg-violet-500',
  },
  sky: {
    color: 'sky',
    label: 'Biru Langit',
    bgBadge: 'bg-sky-100',
    textBadge: 'text-sky-800',
    bgAccent: 'bg-sky-600',
    textAccent: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
  },
  rose: {
    color: 'rose',
    label: 'Merah Mawar',
    bgBadge: 'bg-rose-100',
    textBadge: 'text-rose-800',
    bgAccent: 'bg-rose-600',
    textAccent: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  amber: {
    color: 'amber',
    label: 'Kuning Amber',
    bgBadge: 'bg-amber-100',
    textBadge: 'text-amber-800',
    bgAccent: 'bg-amber-600',
    textAccent: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
};
