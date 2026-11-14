"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

export interface DropdownOption {
  value: string;
  label: string;
  badge?: string;
}

interface CustomDropdownProps {
  id?: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  defaultLabel?: string;
  disabled?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  className?: string;
  align?: "left" | "right" | "auto";
}

export default function CustomDropdown({
  id,
  value,
  options,
  onChange,
  defaultLabel,
  disabled = false,
  showSearch,
  searchPlaceholder = "Search...",
  className = "",
  align = "auto",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Active option label
  const activeOption = useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  const displayLabel = activeOption ? activeOption.label : defaultLabel || options[0]?.label || "Select";
  const isFiltered = value !== "" && value !== undefined;

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, searchQuery]);

  // Determine if search input should be visible
  const enableSearch = showSearch !== undefined ? showSearch : options.length > 8;

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && enableSearch && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [isOpen, enableSearch]);

  const handleSelect = useCallback(
    (optValue: string) => {
      onChange(optValue);
      setIsOpen(false);
    },
    [onChange]
  );

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block text-left select-none ${isOpen ? "z-40" : "z-10"} ${className}`}
    >
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex items-center justify-between gap-2.5 px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer outline-none border active:scale-[0.98] ${
          disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        } ${
          isFiltered
            ? "bg-red-600/15 border-red-500/60 text-white shadow-sm shadow-red-950/30 hover:border-red-500 hover:bg-red-600/20"
            : isOpen
            ? "bg-white/[0.1] border-white/30 text-white shadow-lg"
            : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.1] hover:border-white/20 text-zinc-200"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate max-w-[130px] sm:max-w-[170px] text-left">
          {displayLabel}
        </span>

        {/* Status dot if filtered */}
        {isFiltered && (
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
        )}

        {/* Chevron Icon */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-red-500" : isFiltered ? "text-red-400" : "text-zinc-400 group-hover:text-zinc-200"
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          className={`absolute mt-2 z-[100] min-w-[200px] max-w-[280px] rounded-2xl bg-[#10121a]/95 border border-white/[0.15] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-1.5 text-zinc-200 animate-in fade-in-0 zoom-in-95 duration-150 ${
            align === "right" ? "right-0" : align === "left" ? "left-0" : "left-0 sm:left-auto sm:right-auto"
          }`}
          role="listbox"
        >
          {/* Search Header for long option lists */}
          {enableSearch && (
            <div className="p-1 mb-1 border-b border-white/[0.08]">
              <div className="relative flex items-center">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="absolute left-2.5 text-zinc-400 pointer-events-none"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-7 py-1.5 bg-white/[0.05] focus:bg-white/[0.08] border border-white/[0.08] focus:border-red-500/50 rounded-lg text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 text-zinc-400 hover:text-white"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options Scroll List */}
          <div className="max-h-60 overflow-y-auto overscroll-contain py-0.5 space-y-0.5 scrollbar-thin scrollbar-thumb-zinc-700">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-zinc-500">
                Tidak ada hasil ditemukan
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-red-600/20 text-white border-l-2 border-red-500 shadow-sm"
                        : "text-zinc-300 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    <span className="truncate pr-2">{opt.label}</span>
                    {isSelected && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-red-500 shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
