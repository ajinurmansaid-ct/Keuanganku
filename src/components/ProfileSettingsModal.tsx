import React, { useState } from 'react';
import {
  X,
  Users,
  User,
  Heart,
  Briefcase,
  Smile,
  Star,
  Crown,
  Check,
  Sparkles,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';
import { PROFILE_COLOR_MAP } from '../data/sampleProfiles';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  onSaveProfiles: (updatedProfiles: UserProfile[]) => void;
}

const AVAILABLE_ICONS = [
  { id: 'User', label: 'Pribadi', icon: User },
  { id: 'Heart', label: 'Pasangan / Cinta', icon: Heart },
  { id: 'Briefcase', label: 'Pekerjaan / Bisnis', icon: Briefcase },
  { id: 'Smile', label: 'Ceria / Harian', icon: Smile },
  { id: 'Star', label: 'Spesial / Prioritas', icon: Star },
  { id: 'Crown', label: 'Utama / Kepala', icon: Crown },
];

const AVAILABLE_COLORS: Array<UserProfile['color']> = [
  'emerald',
  'violet',
  'sky',
  'rose',
  'amber',
];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  profiles,
  onSaveProfiles,
}) => {
  const p1 = profiles.find((p) => p.id === 'user_1') || profiles[0];
  const p2 = profiles.find((p) => p.id === 'user_2') || profiles[1];

  const [name1, setName1] = useState(p1?.name || 'Orang 1');
  const [subtitle1, setSubtitle1] = useState(p1?.subtitle || 'Keuangan Utama');
  const [icon1, setIcon1] = useState(p1?.avatarIcon || 'User');
  const [color1, setColor1] = useState<UserProfile['color']>(p1?.color || 'emerald');

  const [name2, setName2] = useState(p2?.name || 'Orang 2');
  const [subtitle2, setSubtitle2] = useState(p2?.subtitle || 'Keuangan Pasangan');
  const [icon2, setIcon2] = useState(p2?.avatarIcon || 'Heart');
  const [color2, setColor2] = useState<UserProfile['color']>(p2?.color || 'violet');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const config1 = PROFILE_COLOR_MAP[color1] || PROFILE_COLOR_MAP.emerald;
    const config2 = PROFILE_COLOR_MAP[color2] || PROFILE_COLOR_MAP.violet;

    const updated: UserProfile[] = [
      {
        id: 'user_1',
        name: name1.trim() || 'Orang 1',
        subtitle: subtitle1.trim() || 'Keuangan Utama',
        avatarIcon: icon1 as any,
        color: color1,
        badgeBg: config1.bgBadge,
        badgeText: config1.textBadge,
        borderClass: config1.border,
      },
      {
        id: 'user_2',
        name: name2.trim() || 'Orang 2',
        subtitle: subtitle2.trim() || 'Keuangan Pasangan',
        avatarIcon: icon2 as any,
        color: color2,
        badgeBg: config2.bgBadge,
        badgeText: config2.textBadge,
        borderClass: config2.border,
      },
    ];

    onSaveProfiles(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pengaturan Pengguna (2 Orang)
              </h3>
              <p className="text-xs text-slate-500">
                Sesuaikan nama, warna, dan peran masing-masing pengguna
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto">
          {/* Info Notice */}
          <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-2.5 text-xs text-sky-900 leading-relaxed">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              Aplikasi ini memisahkan transaksi, anggaran, tabungan, tagihan, dan hutang untuk masing-masing orang. Anda dapat beralih akun kapan saja melalui tombol di bagian atas.
            </div>
          </div>

          {/* Profile 1 Section */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h4 className="text-sm font-bold text-slate-900">Pengguna Pertama (Orang 1)</h4>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                Akun Utama
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Tampilan
                </label>
                <input
                  type="text"
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  placeholder="Misal: Aji / Suami / Pribadi"
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Peran
                </label>
                <input
                  type="text"
                  value={subtitle1}
                  onChange={(e) => setSubtitle1(e.target.value)}
                  placeholder="Misal: Keuangan Pribadi"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Icon selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Avatar Ikon
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ICONS.map((ic) => {
                  const IconComp = ic.icon;
                  const isSelected = icon1 === ic.id;
                  return (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setIcon1(ic.id as any)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{ic.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Warna Aksen Tema
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_COLORS.map((col) => {
                  const cfg = PROFILE_COLOR_MAP[col];
                  const isSelected = color1 === col;
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor1(col)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? `${cfg.bgBadge} ${cfg.textBadge} ring-2 ring-emerald-600 border-transparent`
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`}></span>
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Profile 2 Section */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-800 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h4 className="text-sm font-bold text-slate-900">Pengguna Kedua (Orang 2)</h4>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-violet-100 text-violet-800 font-semibold">
                Akun Pasangan / Rekan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Tampilan
                </label>
                <input
                  type="text"
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  placeholder="Misal: Pasangan / Istri / Partner"
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Peran
                </label>
                <input
                  type="text"
                  value={subtitle2}
                  onChange={(e) => setSubtitle2(e.target.value)}
                  placeholder="Misal: Keuangan Pasangan"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Icon selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Avatar Ikon
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ICONS.map((ic) => {
                  const IconComp = ic.icon;
                  const isSelected = icon2 === ic.id;
                  return (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setIcon2(ic.id as any)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{ic.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Warna Aksen Tema
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_COLORS.map((col) => {
                  const cfg = PROFILE_COLOR_MAP[col];
                  const isSelected = color2 === col;
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor2(col)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? `${cfg.bgBadge} ${cfg.textBadge} ring-2 ring-violet-600 border-transparent`
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`}></span>
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
