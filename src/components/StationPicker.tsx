import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import type { Station } from '../types/station';
import { useTranslation } from '../i18n/useTranslation';

interface StationPickerProps {
  label: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  stations: Station[];
  placeholder: string;
  id: string;
}

export const StationPicker: React.FC<StationPickerProps> = ({
  label,
  selectedId,
  onSelect,
  stations,
  placeholder,
  id
}) => {
  const { language, isRtl, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Find currently selected station
  const selectedStation = useMemo(() => {
    return stations.find(s => s.id === selectedId) || null;
  }, [selectedId, stations]);

  // Filter stations based on search query (EN and AR names)
  const filteredStations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return stations;
    return stations.filter(s =>
      s.nameEn.toLowerCase().includes(query) ||
      s.nameAr.includes(query)
    );
  }, [searchQuery, stations]);

  // Get displayed text in input
  const displayedValue = useMemo(() => {
    if (isOpen) return searchQuery;
    if (selectedStation) {
      return language === 'ar' ? selectedStation.nameAr : selectedStation.nameEn;
    }
    return '';
  }, [isOpen, selectedStation, searchQuery, language]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset focused index when filtered list changes or dropdown closes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [filteredStations, isOpen]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const listItems = listRef.current.children;
      const focusedItem = listItems[focusedIndex] as HTMLElement;
      if (focusedItem && typeof focusedItem.scrollIntoView === 'function') {
        focusedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        setFocusedIndex(prev => (prev + 1 < filteredStations.length ? prev + 1 : 0));
        e.preventDefault();
        break;
      case 'ArrowUp':
        setFocusedIndex(prev => (prev - 1 >= 0 ? prev - 1 : filteredStations.length - 1));
        e.preventDefault();
        break;
      case 'Enter':
        if (focusedIndex >= 0 && focusedIndex < filteredStations.length) {
          selectStation(filteredStations[focusedIndex]);
        } else if (filteredStations.length > 0) {
          selectStation(filteredStations[0]); // Select first match if nothing focused specifically
        }
        e.preventDefault();
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        e.preventDefault();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const selectStation = (station: Station) => {
    onSelect(station.id);
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col w-full relative" ref={containerRef}>
      <label
        htmlFor={`${id}-input`}
        className="text-sm font-medium text-text mb-1 flex justify-between items-center"
      >
        <span>{label}</span>
      </label>

      <div
        className={`relative flex items-center rounded-lg border border-border bg-surface transition-all duration-200 focus-within:ring-2 focus-within:ring-brand-red/20 focus-within:border-brand-red`}
      >
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
          <Search size={18} />
        </span>

        <input
          id={`${id}-input`}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-describedby={`${id}-keyboard-instructions`}
          placeholder={selectedStation ? (language === 'ar' ? selectedStation.nameAr : selectedStation.nameEn) : placeholder}
          value={displayedValue}
          onChange={(e) => {
            if (!isOpen) setIsOpen(true);
            setSearchQuery(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={`w-full py-2.5 pl-10 pr-10 text-sm bg-transparent border-0 outline-none rounded-lg text-text placeholder-text-muted ${
            isRtl ? 'text-right pr-10 pl-10' : 'text-left'
          }`}
        />

        {selectedStation && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={`Clear selection for ${selectedStation.nameEn}`}
            className={`absolute inset-y-0 flex items-center text-text-muted hover:text-text ${
              isRtl ? 'left-8' : 'right-8'
            }`}
          >
            <X size={16} />
          </button>
        )}

        <button
          type="button"
          tabIndex={-1}
          aria-label={isOpen ? "Close list" : "Open list"}
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute inset-y-0 flex items-center text-text-muted hover:text-text ${
            isRtl ? 'left-3' : 'right-3'
          }`}
        >
          <ChevronDown
            size={18}
            className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Hidden screen-reader instruction for keyboard users */}
      <span id={`${id}-keyboard-instructions`} className="sr-only">
        {t.keyboardInstructions}
      </span>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul
          id={`${id}-listbox`}
          ref={listRef}
          role="listbox"
          className="absolute z-50 w-full mt-1.5 max-h-60 overflow-y-auto bg-surface border border-border/50 rounded-lg shadow-xl shadow-black/5 dark:shadow-none focus:outline-none py-1 scroll-smooth"
        >
          {filteredStations.length === 0 ? (
            <li className="px-4 py-3 text-sm text-text-muted text-center">
              {t.noRouteFound}
            </li>
          ) : (
            filteredStations.map((station, index) => {
              const isSelected = station.id === selectedId;
              const isFocused = index === focusedIndex;
              const displayName = language === 'ar' ? station.nameAr : station.nameEn;

              return (
                <li
                  key={station.id}
                  id={`${id}-option-${station.id}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectStation(station)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150 flex items-center justify-between ${
                    isRtl ? 'text-right' : 'text-left'
                  } ${
                    isSelected
                      ? 'bg-brand-red/10 text-brand-red font-medium'
                      : isFocused
                      ? 'bg-surface-2 text-text'
                      : 'text-text'
                  }`}
                >
                  <span>{displayName}</span>
                  {language === 'ar' && station.nameEn !== station.nameAr && (
                    <span className="text-xs text-text-muted font-normal">
                      {station.nameEn}
                    </span>
                  )}
                  {language === 'en' && station.nameAr !== station.nameEn && (
                    <span className="text-xs text-text-muted font-normal">
                      {station.nameAr}
                    </span>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};
