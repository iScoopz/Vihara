'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { Search, X, Check, User, ChevronDown } from 'lucide-react';
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
  placeholder = 'Cari dan pilih nama umat',
  className = '',
  required = false,
  disabled = false,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const selectedProfile = profiles.find(p => p.id === value || p.full_name === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeIndex < 0) return;
    document.getElementById(`${baseId}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, baseId]);

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

  const toggleOpen = () => {
    setActiveIndex(-1);
    setIsOpen(!isOpen);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredProfiles.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(filteredProfiles.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < filteredProfiles.length) {
      e.preventDefault();
      handleSelect(filteredProfiles[activeIndex]);
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <span id={labelId} className="block text-xs font-medium text-ink-2 mb-1">
          {label} {required && <span className="text-danger" aria-hidden>*</span>}
        </span>
      )}

      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : placeholder}
        aria-required={required || undefined}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && toggleOpen()}
        onKeyDown={(e) => {
          if (disabled || e.target !== e.currentTarget) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleOpen();
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(-1);
            setIsOpen(true);
          }
        }}
        className={`w-full min-h-[44px] sm:min-h-[38px] bg-surface border ${
          isOpen ? 'border-brand' : 'border-line-strong'
        } rounded-lg px-3 py-1.5 text-sm text-ink flex items-center justify-between gap-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-surface-2'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-brand-soft text-brand-ink flex items-center justify-center font-semibold text-[11px] shrink-0" aria-hidden>
            {selectedProfile ? (selectedProfile.full_name[0] || '?') : <User size={12} />}
          </div>
          {selectedProfile ? (
            <span className="truncate font-medium">
              {selectedProfile.full_name}
              {(selectedProfile.bagian || selectedProfile.cetya) && (
                <span className="ml-1 text-xs font-normal text-ink-3">
                  ({selectedProfile.bagian || selectedProfile.cetya})
                </span>
              )}
            </span>
          ) : (
            <span className="truncate text-ink-3">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedProfile && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Kosongkan pilihan"
              className="w-8 h-8 inline-flex items-center justify-center rounded-md text-ink-2 hover:bg-surface-2 hover:text-danger cursor-pointer"
            >
              <X size={14} aria-hidden />
            </button>
          )}
          <ChevronDown size={14} aria-hidden className={`text-ink-3 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Invisible input so the parent form's native `required` validation also covers this field. */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          tabIndex={-1}
          aria-hidden
          className="opacity-0 absolute inset-0 pointer-events-none -z-10"
        />
      )}

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-surface border border-line-strong rounded-lg overflow-hidden">
          <div className="p-2 border-b border-line flex items-center gap-2">
            <Search size={14} className="text-ink-3 shrink-0 ml-1" aria-hidden />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveIndex(-1);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Ketik nama, bagian, atau no HP"
              aria-label="Cari umat"
              aria-controls={listboxId}
              aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
              className="w-full min-h-[36px] bg-transparent border-none text-sm text-ink focus:outline-none placeholder:text-ink-3"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Hapus pencarian"
                className="w-8 h-8 inline-flex items-center justify-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-ink shrink-0 cursor-pointer"
              >
                <X size={14} aria-hidden />
              </button>
            )}
          </div>

          <ul id={listboxId} role="listbox" aria-labelledby={label ? labelId : undefined} className="max-h-60 overflow-y-auto p-1">
            {filteredProfiles.length > 0 ? (
              filteredProfiles.map((profile, index) => {
                const isSelected = profile.id === value || profile.full_name === value;
                const isDisabled = disabledIds.includes(profile.id);
                const isActive = index === activeIndex;
                const meta = [profile.bagian, profile.phone, profile.cetya].filter(Boolean).join(', ');

                return (
                  <li
                    key={profile.id}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isDisabled || undefined}
                    onClick={() => handleSelect(profile)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`px-2.5 py-2 rounded-md flex items-center justify-between gap-2 text-sm ${
                      isDisabled
                        ? 'cursor-not-allowed text-ink-3'
                        : `cursor-pointer text-ink ${isActive || isSelected ? 'bg-surface-2' : ''}`
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        aria-hidden
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${
                          isDisabled ? 'bg-surface-2 text-ink-3' : 'bg-brand-soft text-brand-ink'
                        }`}
                      >
                        {profile.full_name[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className={`truncate ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                          {profile.full_name}
                          {isDisabled && <span className="ml-2 text-xs font-normal text-gold">Sudah terdaftar</span>}
                        </p>
                        {meta && <p className="text-xs text-ink-3 truncate">{meta}</p>}
                      </div>
                    </div>

                    {isSelected && !isDisabled && <Check size={14} className="text-brand shrink-0" aria-hidden />}
                  </li>
                );
              })
            ) : (
              <li role="presentation" className="p-4 text-center text-sm text-ink-3">
                Umat &quot;{searchQuery}&quot; tidak ditemukan.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
