"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useMemo } from "react";
import { Genre, POPULAR_COUNTRIES } from "@/lib/tmdb";
import CustomDropdown, { DropdownOption } from "@/components/CustomDropdown";

interface Props {
  genres: Genre[];
  activeGenre?: string;
  activeYear?: string;
  activeType?: string;
  activeCountry?: string;
  activeSort?: string;
  showTypeFilter?: boolean;
  showCountryFilter?: boolean;
  showSortFilter?: boolean;
  basePath: string;
}

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

export default function FilterBar({
  genres,
  activeGenre,
  activeYear,
  activeType,
  activeCountry,
  activeSort,
  showTypeFilter = false,
  showCountryFilter = true,
  showSortFilter = true,
  basePath,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${basePath}?${params.toString()}`);
      });
    },
    [router, searchParams, basePath]
  );

  const typeOptions: DropdownOption[] = useMemo(
    () => [
      { value: "", label: "All Types" },
      { value: "movie", label: "Movies" },
      { value: "tv", label: "TV Series" },
    ],
    []
  );

  const genreOptions: DropdownOption[] = useMemo(
    () => [
      { value: "", label: "All Genres" },
      ...genres.map((g) => ({ value: String(g.id), label: g.name })),
    ],
    [genres]
  );

  const yearOptions: DropdownOption[] = useMemo(
    () => [
      { value: "", label: "All Years" },
      ...YEARS.map((y) => ({ value: y, label: y })),
    ],
    []
  );

  const countryOptions: DropdownOption[] = useMemo(
    () => [
      { value: "", label: "All Countries" },
      ...POPULAR_COUNTRIES.map((c) => ({ value: c.code, label: c.name })),
    ],
    []
  );

  const sortOptions: DropdownOption[] = useMemo(
    () => [
      { value: "", label: "Most Popular" },
      { value: "latest", label: "Latest Release" },
      { value: "top_rated", label: "Top Rated" },
    ],
    []
  );

  return (
    <div
      className="flex flex-wrap gap-2.5 sm:gap-3 items-center p-3 sm:p-4 rounded-2xl mb-8 bg-[#0a0c12]/90 border border-white/[0.08] backdrop-blur-xl shadow-lg relative z-20"
      role="group"
      aria-label="Filter catalog"
    >
      <div className="flex items-center gap-1.5 mr-1 text-zinc-400 shrink-0">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-500"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Filter:</span>
      </div>

      {showTypeFilter && (
        <CustomDropdown
          id="filter-type"
          value={activeType ?? ""}
          options={typeOptions}
          onChange={(val) => updateFilter("type", val)}
          disabled={isPending}
        />
      )}

      <CustomDropdown
        id="filter-genre"
        value={activeGenre ?? ""}
        options={genreOptions}
        onChange={(val) => updateFilter("genre", val)}
        disabled={isPending}
        searchPlaceholder="Cari genre..."
      />

      <CustomDropdown
        id="filter-year"
        value={activeYear ?? ""}
        options={yearOptions}
        onChange={(val) => updateFilter("year", val)}
        disabled={isPending}
        searchPlaceholder="Cari tahun..."
      />

      {showCountryFilter && (
        <CustomDropdown
          id="filter-country"
          value={activeCountry ?? ""}
          options={countryOptions}
          onChange={(val) => updateFilter("country", val)}
          disabled={isPending}
          searchPlaceholder="Cari negara..."
        />
      )}

      {showSortFilter && (
        <CustomDropdown
          id="filter-sort"
          value={activeSort ?? ""}
          options={sortOptions}
          onChange={(val) => updateFilter("sort", val)}
          disabled={isPending}
        />
      )}

      {(activeGenre || activeYear || activeType || activeCountry || activeSort) && (
        <button
          type="button"
          onClick={() => {
            startTransition(() => router.push(basePath));
          }}
          className="text-xs font-semibold px-3 py-2 sm:py-2.5 rounded-xl text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 transition-colors cursor-pointer"
          disabled={isPending}
        >
          Reset Filter
        </button>
      )}

      {isPending && (
        <div
          className="w-4 h-4 border-2 border-transparent border-t-red-600 rounded-full animate-spin ml-auto"
          aria-label="Loading..."
          role="status"
        />
      )}
    </div>
  );
}
