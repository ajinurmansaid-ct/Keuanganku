import React from 'react';
import {
  User,
  Heart,
  Briefcase,
  Smile,
  Star,
  Crown,
  Users,
  Settings,
  ArrowRightLeft
} from 'lucide-react';
import { UserProfile, ActiveViewMode, UserProfileId } from '../types';

interface ProfileSwitcherProps {
  profiles: UserProfile[];
  activeViewMode: ActiveViewMode;
  onSelectViewMode: (mode: ActiveViewMode) => void;
  onOpenSettingsModal: () => void;
  className?: string;
}

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({
  profiles,
  activeViewMode,
  onSelectViewMode,
  onOpenSettingsModal,
  className = '',
}) => {
  const profile1 = profiles.find((p) => p.id === 'user_1') || profiles[0];
  const profile2 = profiles.find((p) => p.id === 'user_2') || profiles[1];

  const renderIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'Heart':
        return <Heart className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      case 'Smile':
        return <Smile className={className} />;
      case 'Star':
        return <Star className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      case 'User':
      default:
        return <User className={className} />;
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/90 shadow-2xs ${className}`}>
      {/* Profile 1 Button */}
      {profile1 && (
        <button
          onClick={() => onSelectViewMode('user_1')}
          type="button"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeViewMode === 'user_1'
              ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200 ring-1 ring-emerald-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
          title={`Beralih ke pengelolaan keuangan: ${profile1.name}`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              activeViewMode === 'user_1'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {renderIcon(profile1.avatarIcon, 'w-3 h-3')}
          </div>
          <span className="truncate max-w-[110px] sm:max-w-[140px]">{profile1.name}</span>
          {activeViewMode === 'user_1' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          )}
        </button>
      )}

      {/* Profile 2 Button */}
      {profile2 && (
        <button
          onClick={() => onSelectViewMode('user_2')}
          type="button"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeViewMode === 'user_2'
              ? 'bg-white text-violet-800 shadow-xs border border-violet-200 ring-1 ring-violet-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
          title={`Beralih ke pengelolaan keuangan: ${profile2.name}`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              activeViewMode === 'user_2'
                ? 'bg-violet-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {renderIcon(profile2.avatarIcon, 'w-3 h-3')}
          </div>
          <span className="truncate max-w-[110px] sm:max-w-[140px]">{profile2.name}</span>
          {activeViewMode === 'user_2' && (
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
          )}
        </button>
      )}

      {/* Mode Gabungan / Joint View */}
      <button
        onClick={() => onSelectViewMode('combined')}
        type="button"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
          activeViewMode === 'combined'
            ? 'bg-white text-indigo-800 shadow-xs border border-indigo-200 ring-1 ring-indigo-500/20'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
        title="Lihat ringkasan keuangan gabungan kedua orang secara bersamaan"
      >
        <Users className="w-3.5 h-3.5 text-indigo-600" />
        <span className="hidden xs:inline">Gabungan</span>
        <span className="xs:hidden">2 Org</span>
        {activeViewMode === 'combined' && (
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
        )}
      </button>

      {/* Edit Profile Settings */}
      <button
        onClick={onOpenSettingsModal}
        type="button"
        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition ml-auto cursor-pointer"
        title="Pengaturan Nama & Profil 2 Orang"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
