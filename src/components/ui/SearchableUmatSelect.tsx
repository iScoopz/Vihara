'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check, User, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Profile } from '@/types/database';

export interface SearchableUmatSelectProps {
  profiles: Profile[];
  value: string;
  onChange: (selectedId: string, profile?: Profile) => void;
  disabledIds?: string[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
}

export const SearchableUmatSelect: React.FC<SearchableUmatSelectProps> = ({
  profiles,
  value,
  onChange,
  disabledIds = [],
  placeholder = '-- Cari & Pilih Nama Umat --',
  className = '',
  required = false,
  disabled = false,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedProfile = profiles.find(p => p.id === value || p.full_name === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredProfiles = profiles.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.full_name || '').toLowerCase().includes(q) ||
      (p.bagian || '').toLowerCase().includes(q) ||
      (p.phone || '').toLowerCase().includes(q) ||
      (p.cetya || '').toLowerCase().includes(q) ||
      (p.sentra || '').toLowerCase().includes(q)
    );
  });

  const handleSelect = (profile: Profile) => {
    if (disabledIds.includes(profile.id)) return;
    onChange(profile.id, profile);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 dark:bg-purple-950/80 border ${
          isOpen ? 'border-purple-600 ring-2 ring-purple-600/20' : 'border-purple-100 dark:border-purple-900/60'
        } rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between cursor-pointer transition-all duration-150 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/70 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-[10px] shrink-0">
            {selectedProfile ? (selectedProfile.full_name[0] || 'U') : <User size={12} />}
          </div>
          <span className={`truncate ${!selectedProfile ? 'text-slate-400 dark:text-slate-500 font-normal' : 'font-extrabold'}`}>
            {selectedProfile ? (
              <span>
                {selectedProfile.full_name}{' '}
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal">
                  ({selectedProfile.bagian || selectedProfile.cetya || 'Sentra Makassar'})
                </span>
              </span>
            ) : (
              placeholder
            )}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedProfile && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-200 dark:hover:bg-purple-900 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X size={12} />
            </button>
          )}
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Hidden input for HTML form validation */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          className="opacity-0 absolute inset-0 pointer-events-none -z-10"
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Box Header */}
          <div className="p-2 border-b border-purple-100 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/50 flex items-center gap-2">
            <Search size={14} className="text-purple-500 shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama / bagian / no HP..."
              className="w-full bg-transparent border-none text-xs font-semibold text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* List Items */}
          <div className="max-h-60 overflow-y-auto divide-y divide-purple-50 dark:divide-purple-950/40 p-1">
            {filteredProfiles.length > 0 ? (
              filteredProfiles.map((profile) => {
                const isSelected = profile.id === value || profile.full_name === value;
                const isDisabled = disabledIds.includes(profile.id);

                return (
                  <div
                    key={profile.id}
                    onClick={() => handleSelect(profile)}
                    className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                      isDisabled
                        ? 'opacity-50 bg-slate-50 dark:bg-slate-900/40 cursor-not-allowed text-slate-400'
                        : isSelected
                        ? 'bg-purple-100 dark:bg-purple-900/70 text-purple-950 dark:text-purple-100 font-bold cursor-pointer'
                        : 'hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-800 dark:text-slate-200 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${
                        isDisabled ? 'bg-slate-400' : 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                      }`}>
                        {profile.full_name[0] || 'U'}
                      </div>
                      <div className="truncate">
                        <p className="font-extrabold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                          <span>{profile.full_name}</span>
                          {isDisabled && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[9px] flex items-center gap-1">
                              <CheckCircle2 size={10} /> Sudah Terdaftar
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-purple-100/70 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold text-[9px]">
                            {profile.bagian || 'Umat'}
                          </span>
                          {profile.phone && <span>• {profile.phone}</span>}
                          {profile.cetya && <span>• {profile.cetya}</span>}
                        </p>
                      </div>
                    </div>

                    {isSelected && !isDisabled && <Check size={14} className="text-purple-600 shrink-0 ml-2" />}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                Umat &quot;{searchQuery}&quot; tidak ditemukan.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
