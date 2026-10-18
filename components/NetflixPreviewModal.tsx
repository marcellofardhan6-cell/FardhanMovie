"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { usePreviewModal } from "@/context/PreviewModalContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useWatchHistory } from "@/context/WatchHistoryContext";
import { img, displayTitle, displayYear, isTV, Genre, Movie } from "@/lib/tmdb";

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface EpisodeItem {
  id: number;
  episode_number: number;
  name: string;
  overview: string | null;
  still_path: string | null;
  runtime: number | null;
  air_date: string | null;
}

interface DetailApiResponse {
  id: number;
  title: string;
  tagline: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  runtime: string | null;
  year: string;
  genres: Genre[];
  overview: string | null;
  isAnime: boolean;
  seasons: { id: number; name: string; season_number: number; episode_count: number; poster_path?: string | null }[];
  episodes?: EpisodeItem[];
  recommendations: Movie[];
  cast: CastMember[];
}

function UrlPreviewListener() {
  const searchParams = useSearchParams();
  const { openPreview, isOpen } = usePreviewModal();

  useEffect(() => {
    const movieId = searchParams.get("movie");
    const seriesId = searchParams.get("series");
    const playParam = searchParams.get("play");
    const seasonParam = searchParams.get("season");
    const episodeParam = searchParams.get("episode");

    if ((movieId || seriesId) && !isOpen) {
      const id = movieId || seriesId;
      const type = seriesId ? "tv" : "movie";
      const season = seasonParam ? parseInt(seasonParam, 10) : 1;
      const episode = episodeParam ? parseInt(episodeParam, 10) : 1;
      const shouldPlay = playParam === "1";

      fetch(`/api/detail?id=${id}&type=${type}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            const movieItem: Movie = {
              id: data.id,
              title: data.title || data.name || "Movie",
              name: data.name || data.title,
              poster_path: data.poster_path ?? null,
              backdrop_path: data.backdrop_path ?? null,
              media_type: type,
              vote_average: data.vote_average ?? 0,
              vote_count: data.vote_count ?? 0,
              overview: data.overview || "",
              release_date: data.year ?? "",
              first_air_date: data.year ?? "",
            };
            openPreview(movieItem, shouldPlay, season, episode);

            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.delete("movie");
              url.searchParams.delete("series");
              url.searchParams.delete("play");
              url.searchParams.delete("season");
              url.searchParams.delete("episode");
              url.searchParams.delete("startAt");
              window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
            }
          }
        })
        .catch(() => {});
    }
  }, [searchParams, isOpen, openPreview]);

  return null;
}

export default function NetflixPreviewModal() {
  const {
    isOpen,
    activeItem,
    autoPlay,
    initialSeason,
    initialEpisode,
    closePreview,
    openPreview,
  } = usePreviewModal();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addHistory, updateProgress, getHistoryItem } = useWatchHistory();

  const [detailData, setDetailData] = useState<DetailApiResponse | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isTheaterOpen, setIsTheaterOpen] = useState(false);
  const [activeServer, setActiveServer] = useState<"cinesrc" | "vidlink" | "vidsrcwiki">("cinesrc");
  const [controlsVisible, setControlsVisible] = useState(true);
  const [serverDropdownOpen, setServerDropdownOpen] = useState(false);
  const [serverHintVisible, setServerHintVisible] = useState(false);
  const [isForcedLandscape, setIsForcedLandscape] = useState(false);
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const serverDropdownRef = useRef<HTMLDivElement | null>(null);
  const serverHintTimerRef = useRef<NodeJS.Timeout | null>(null);
  const theaterContainerRef = useRef<HTMLDivElement | null>(null);
  const currentTimeRef = useRef<number>(0);
  const theaterPushedRef = useRef<boolean>(false);

  // Detect mobile portrait orientation
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== "undefined") {
        setIsMobilePortrait(window.innerWidth < 768 && window.innerHeight > window.innerWidth);
      }
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  // Close server dropdown when clicking outside
  useEffect(() => {
    if (!serverDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (serverDropdownRef.current && !serverDropdownRef.current.contains(e.target as Node)) {
        setServerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [serverDropdownOpen]);

  const lockLandscape = async () => {
    try {
      if (typeof screen !== "undefined" && screen.orientation && typeof (screen.orientation as any).lock === "function") {
        await (screen.orientation as any).lock("landscape");
        return true;
      } else if (typeof screen !== "undefined" && (screen as any).lockOrientation) {
        return (screen as any).lockOrientation("landscape");
      }
    } catch {}
    return false;
  };

  const unlockOrientation = () => {
    try {
      if (typeof screen !== "undefined" && screen.orientation && typeof (screen.orientation as any).unlock === "function") {
        (screen.orientation as any).unlock();
      } else if (typeof screen !== "undefined" && (screen as any).unlockOrientation) {
        (screen as any).unlockOrientation();
      }
    } catch {}
  };

  const resolvedType = activeItem
    ? activeItem.media_type === "tv" || isTV(activeItem)
      ? "tv"
      : "movie"
    : "movie";

  const fav = activeItem ? isFavorite(activeItem.id) : false;

  const [seasonEpisodesMap, setSeasonEpisodesMap] = useState<Record<number, EpisodeItem[]>>({});
  const [loadingSeasonEpisodes, setLoadingSeasonEpisodes] = useState(false);

  // Fetch full details when modal opens
  const fetchDetail = useCallback(async (id: number, type: "movie" | "tv", season: number = 1) => {
    try {
      const res = await fetch(`/api/detail?id=${id}&type=${type}&season=${season}`);
      if (!res.ok) return;
      const data: DetailApiResponse = await res.json();
      setDetailData(data);
      if (data.episodes && data.episodes.length > 0) {
        setSeasonEpisodesMap((prev) => ({ ...prev, [season]: data.episodes! }));
      }
      if (data.seasons && data.seasons.length > 0) {
        const validSeason = data.seasons.find((s) => s.season_number > 0);
        if (validSeason && season === 1 && validSeason.season_number !== 1) {
          setSelectedSeason(validSeason.season_number);
        }
      }
    } catch {}
  }, []);

  const handleSeasonChange = useCallback(
    async (newSeason: number) => {
      setSelectedSeason(newSeason);
      setSelectedEpisode(1);
      if (!seasonEpisodesMap[newSeason] && activeItem) {
        setLoadingSeasonEpisodes(true);
        try {
          const res = await fetch(`/api/episodes?id=${activeItem.id}&season=${newSeason}`);
          if (res.ok) {
            const json = await res.json();
            if (json.episodes && json.episodes.length > 0) {
              setSeasonEpisodesMap((prev) => ({ ...prev, [newSeason]: json.episodes }));
            }
          }
        } catch (err) {
          console.error("Failed to load season episodes:", err);
        } finally {
          setLoadingSeasonEpisodes(false);
        }
      }
    },
    [seasonEpisodesMap, activeItem]
  );

  // Request browser fullscreen synchronously on user click and auto lock landscape
  const handleStartPlay = useCallback(
    async (seasonNum?: number, episodeNum?: number) => {
      const sNum = seasonNum !== undefined ? seasonNum : selectedSeason;
      const eNum = episodeNum !== undefined ? episodeNum : selectedEpisode;
      if (seasonNum !== undefined) setSelectedSeason(seasonNum);
      if (episodeNum !== undefined) setSelectedEpisode(episodeNum);
      setIsTheaterOpen(true);
      setControlsVisible(true);
      setServerDropdownOpen(false);
      setServerHintVisible(true);
      if (serverHintTimerRef.current) clearTimeout(serverHintTimerRef.current);
      serverHintTimerRef.current = setTimeout(() => {
        setServerHintVisible(false);
      }, 4500);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3200);

      // Record to Watch History immediately so Continue Watching reflects the new watch
      if (activeItem) {
        const itemTitle = detailData?.title || displayTitle(activeItem);
        const estDuration =
          detailData?.runtime && detailData.runtime.includes("j")
            ? 7200
            : resolvedType === "tv"
            ? 2700
            : 7200;

        const existing = getHistoryItem(activeItem.id, resolvedType, sNum, eNum);
        const startingTime = existing?.currentTime && existing.currentTime > 15 ? existing.currentTime : 10;
        currentTimeRef.current = startingTime;

        addHistory({
          id: activeItem.id,
          type: resolvedType,
          title: itemTitle,
          poster_path: activeItem.poster_path,
          backdrop_path: detailData?.backdrop_path || activeItem.backdrop_path || null,
          vote_average: activeItem.vote_average || detailData?.vote_average || 0,
          season: resolvedType === "tv" ? sNum : undefined,
          episode: resolvedType === "tv" ? eNum : undefined,
          currentTime: startingTime,
          duration: estDuration,
          progress: existing?.progress || 5,
        });
      }

      const isMobile = typeof window !== "undefined" && window.innerWidth < 768 && window.innerHeight > window.innerWidth;

      try {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen().catch(() => {});
        } else if ((docEl as any).webkitRequestFullscreen) {
          (docEl as any).webkitRequestFullscreen();
        }
      } catch {}

      const locked = await lockLandscape();
      if (!locked && isMobile) {
        setIsForcedLandscape(true);
      }

      try {
        if (typeof window !== "undefined") {
          window.history.pushState({ fardTvTheater: true }, "");
          theaterPushedRef.current = true;
        }
      } catch {}
    },
    [activeItem, detailData, resolvedType, selectedSeason, selectedEpisode, addHistory, getHistoryItem]
  );

  const handleExitTheater = useCallback(
    (fromPopState: boolean = false) => {
      if (activeItem && currentTimeRef.current > 0) {
        const itemTitle = detailData?.title || displayTitle(activeItem);
        const estDuration =
          detailData?.runtime && detailData.runtime.includes("j")
            ? 7200
            : resolvedType === "tv"
            ? 2700
            : 7200;

        updateProgress(
          activeItem.id,
          resolvedType,
          currentTimeRef.current,
          estDuration,
          {
            title: itemTitle,
            poster_path: activeItem.poster_path,
            backdrop_path: detailData?.backdrop_path || activeItem.backdrop_path || null,
            season: resolvedType === "tv" ? selectedSeason : undefined,
            episode: resolvedType === "tv" ? selectedEpisode : undefined,
          }
        );
      }
      setIsTheaterOpen(false);
      setIsForcedLandscape(false);
      setServerDropdownOpen(false);
      setServerHintVisible(false);
      if (serverHintTimerRef.current) clearTimeout(serverHintTimerRef.current);
      unlockOrientation();
      try {
        if (document.fullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
          }
        }
      } catch {}

      if (!fromPopState && theaterPushedRef.current) {
        theaterPushedRef.current = false;
        try {
          if (typeof window !== "undefined" && window.history.state?.fardTvTheater) {
            window.history.back();
          }
        } catch {}
      } else {
        theaterPushedRef.current = false;
      }
    },
    [activeItem, detailData, resolvedType, selectedSeason, selectedEpisode, updateProgress]
  );

  // Active watch progress tracking in theater mode
  useEffect(() => {
    if (!isTheaterOpen || !activeItem) return;

    const itemTitle = detailData?.title || displayTitle(activeItem);
    const estDuration =
      detailData?.runtime && detailData.runtime.includes("j")
        ? 7200
        : resolvedType === "tv"
        ? 2700
        : 7200;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        if (!data) return;

        // VidLink / cinesrc PLAYER_EVENT
        if (data.type === "PLAYER_EVENT" && data.data) {
          const { currentTime, duration } = data.data;
          if (typeof currentTime === "number" && currentTime > 0) {
            currentTimeRef.current = Math.round(currentTime);
            updateProgress(
              activeItem.id,
              resolvedType,
              currentTimeRef.current,
              typeof duration === "number" && duration > 0 ? duration : estDuration,
              {
                title: itemTitle,
                poster_path: activeItem.poster_path,
                backdrop_path: detailData?.backdrop_path || activeItem.backdrop_path || null,
                season: resolvedType === "tv" ? selectedSeason : undefined,
                episode: resolvedType === "tv" ? selectedEpisode : undefined,
              }
            );
          }
        }

        // Generic timeupdate
        if (data.event === "timeupdate" || data.type === "timeupdate") {
          const time = Number(data.currentTime ?? data.time ?? data.data?.currentTime);
          const dur = Number(data.duration ?? data.data?.duration ?? estDuration);
          if (!isNaN(time) && time > 0) {
            currentTimeRef.current = Math.round(time);
            updateProgress(
              activeItem.id,
              resolvedType,
              currentTimeRef.current,
              dur,
              {
                title: itemTitle,
                poster_path: activeItem.poster_path,
                backdrop_path: detailData?.backdrop_path || activeItem.backdrop_path || null,
                season: resolvedType === "tv" ? selectedSeason : undefined,
                episode: resolvedType === "tv" ? selectedEpisode : undefined,
              }
            );
          }
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      currentTimeRef.current += 10;
      updateProgress(
        activeItem.id,
        resolvedType,
        currentTimeRef.current,
        estDuration,
        {
          title: itemTitle,
          poster_path: activeItem.poster_path,
          backdrop_path: detailData?.backdrop_path || activeItem.backdrop_path || null,
          season: resolvedType === "tv" ? selectedSeason : undefined,
          episode: resolvedType === "tv" ? selectedEpisode : undefined,
        }
      );
    }, 10000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(interval);
    };
  }, [isTheaterOpen, activeItem, resolvedType, selectedSeason, selectedEpisode, detailData, updateProgress]);

  // Sync native fullscreen state without terminating theater mode when fullscreen drops
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsNativeFullscreen(Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
    };
  }, []);

  // Handle mobile / browser back button or swipe gesture safely
  useEffect(() => {
    if (!isTheaterOpen) return;

    const onPopState = () => {
      handleExitTheater(true);
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [isTheaterOpen, handleExitTheater]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen().catch(() => {});
        } else if ((docEl as any).webkitRequestFullscreen) {
          (docEl as any).webkitRequestFullscreen();
        }
        const locked = await lockLandscape();
        if (!locked && isMobilePortrait) {
          setIsForcedLandscape(true);
        }
      } else {
        setIsForcedLandscape(false);
        unlockOrientation();
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch {}
  }, [isMobilePortrait]);

  // Show / hide floating controls on mouse movement or touch in theater mode
  const handleUserActivity = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3200);
  }, []);

  // Listen for window-level mouse movement & touches when theater is open
  useEffect(() => {
    if (!isTheaterOpen) return;

    const onActivity = () => {
      setControlsVisible(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3200);
    };

    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("touchstart", onActivity);
    };
  }, [isTheaterOpen]);

  // Lock both html and body scrolling and hide scrollbars completely in theater mode
  useEffect(() => {
    if (isTheaterOpen) {
      document.documentElement.classList.add("theater-active");
      document.body.classList.add("theater-active");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.classList.remove("theater-active");
      document.body.classList.remove("theater-active");
      if (isOpen) {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
      } else {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
    }

    return () => {
      document.documentElement.classList.remove("theater-active");
      document.body.classList.remove("theater-active");
    };
  }, [isTheaterOpen, isOpen]);

  const handleStartPlayRef = useRef(handleStartPlay);
  useEffect(() => {
    handleStartPlayRef.current = handleStartPlay;
  }, [handleStartPlay]);

  const lastProcessedIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && activeItem) {
      if (lastProcessedIdRef.current !== activeItem.id) {
        lastProcessedIdRef.current = activeItem.id;
        setDetailData(null);
        setSeasonEpisodesMap({});
        setSelectedSeason(initialSeason || 1);
        setSelectedEpisode(initialEpisode || 1);
        setIsTheaterOpen(false);
        setActiveServer("cinesrc");
        fetchDetail(activeItem.id, resolvedType, initialSeason || 1);

        if (autoPlay) {
          handleStartPlayRef.current(initialSeason || 1, initialEpisode || 1);
        }
      }
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else if (!isOpen) {
      lastProcessedIdRef.current = null;
      setDetailData(null);
      setSeasonEpisodesMap({});
      setIsTheaterOpen(false);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (serverHintTimerRef.current) clearTimeout(serverHintTimerRef.current);
    };
  }, [isOpen, activeItem?.id, resolvedType, autoPlay, initialSeason, initialEpisode, fetchDetail]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        if (serverDropdownOpen) {
          setServerDropdownOpen(false);
          return;
        }
        if (isTheaterOpen) {
          handleExitTheater();
        } else {
          closePreview();
        }
      }
      if (e.key === "Backspace" && (isTheaterOpen || isOpen)) {
        const target = e.target as HTMLElement | null;
        const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
        if (!isInput) {
          e.preventDefault();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isTheaterOpen, closePreview, handleExitTheater]);

  if (!isOpen || !activeItem) {
    return (
      <Suspense fallback={null}>
        <UrlPreviewListener />
      </Suspense>
    );
  }

  const title = detailData?.title || displayTitle(activeItem);
  const year = detailData?.year || displayYear(activeItem);
  const rating = detailData?.vote_average ?? activeItem.vote_average;
  const overview = detailData?.overview || activeItem.overview;
  const genres = detailData?.genres || [];
  const backdropUrl = detailData?.backdrop_path || activeItem.backdrop_path;
  const validSeasons = (detailData?.seasons || []).filter((s) => s.season_number > 0);
  const currentSeasonObj = validSeasons.find((s) => s.season_number === selectedSeason) || validSeasons[0];
  const episodeCount = currentSeasonObj?.episode_count || 10;
  const seasonEpisodes = seasonEpisodesMap[selectedSeason] || [];
  const matchPercent = Math.min(99, Math.max(85, Math.round((rating || 7.5) * 10) + 12));

  // Build stream URL for active servers (CineSrc as primary, VidLink as server 2)
  const idStr = String(activeItem.id);
  const streamUrl =
    activeServer === "cinesrc"
      ? resolvedType === "tv"
        ? `https://cinesrc.st/embed/tv/${idStr}?s=${selectedSeason}&e=${selectedEpisode}`
        : `https://cinesrc.st/embed/movie/${idStr}`
      : activeServer === "vidlink"
      ? resolvedType === "tv"
        ? `https://vidlink.pro/tv/${idStr}/${selectedSeason}/${selectedEpisode}?primaryColor=e50914&secondaryColor=12141a&iconColor=e50914`
        : `https://vidlink.pro/movie/${idStr}?primaryColor=e50914&secondaryColor=12141a&iconColor=e50914`
      : resolvedType === "tv"
      ? `https://vidsrc.wiki/embed/tv/${idStr}/${selectedSeason}/${selectedEpisode}`
      : `https://vidsrc.wiki/embed/movie/${idStr}`;

  return (
    <>
      <Suspense fallback={null}>
        <UrlPreviewListener />
      </Suspense>
      {/* 1. TRUE FULLSCREEN THEATER PLAYER OVERLAY */}
      {isTheaterOpen && (
        <div
          ref={theaterContainerRef}
          className="fixed inset-0 w-screen h-screen z-[9999] bg-black overflow-hidden flex flex-col select-none overscroll-none touch-manipulation [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-all duration-300"
          style={
            isForcedLandscape && isMobilePortrait
              ? {
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  width: "100vh",
                  height: "100vw",
                  transform: "translate(-50%, -50%) rotate(90deg)",
                  transformOrigin: "center center",
                  overscrollBehavior: "none",
                }
              : {
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: "100vw",
                  height: "100vh",
                  overscrollBehavior: "none",
                }
          }
          onMouseMove={handleUserActivity}
          onClick={handleUserActivity}
          onTouchStart={handleUserActivity}
        >
          {/* Floating Top Control Bar (Clean, compact, and non-blocking) */}
          <div
            onMouseEnter={handleUserActivity}
            onMouseMove={handleUserActivity}
            onTouchStart={handleUserActivity}
            className={`absolute top-0 inset-x-0 z-40 flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3.5 bg-gradient-to-b from-black/85 via-black/35 to-transparent transition-all duration-300 transform pointer-events-none ${
              controlsVisible || serverDropdownOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-3"
            }`}
          >
            {/* Left: Back Arrow + Movie/Episode Title */}
            <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 pointer-events-auto">
              <button
                type="button"
                onClick={() => handleExitTheater(false)}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md active:scale-95"
                title="Exit player (Esc)"
                aria-label="Back"
              >
                <svg width="16" height="16" className="sm:w-[20px] sm:h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="min-w-0">
                <h2 className="text-xs sm:text-base font-semibold sm:font-bold text-white truncate drop-shadow-md max-w-[130px] sm:max-w-xs md:max-w-md">
                  {title}
                </h2>
                {resolvedType === "tv" && (
                  <p className="text-[10px] sm:text-xs text-zinc-300 font-medium leading-none mt-0.5">
                    S{selectedSeason} • E{selectedEpisode}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Compact Server Dropdown + Fullscreen Toggle */}
            <div className="flex items-center gap-2 shrink-0 pointer-events-auto">
              {/* Compact Server Selector Dropdown */}
              <div className="relative" ref={serverDropdownRef}>
                <button
                  type="button"
                  onClick={() => setServerDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold bg-black/75 hover:bg-black text-white border border-white/15 backdrop-blur-md shadow-lg transition-all cursor-pointer active:scale-95"
                  aria-expanded={serverDropdownOpen}
                  aria-label="Pilih Server Streaming"
                  title="Ganti Server Streaming"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[11px] sm:text-xs">
                    {activeServer === "cinesrc"
                      ? "CineSrc"
                      : activeServer === "vidlink"
                      ? "VidLink"
                      : "VidSrc"}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-zinc-400 transition-transform duration-200 ${
                      serverDropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {serverDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 sm:w-60 py-1.5 rounded-xl bg-zinc-950/95 border border-white/15 shadow-2xl backdrop-blur-xl z-50 animate-fade-in text-left select-none"
                    role="menu"
                  >
                    <div className="px-3 py-1.5 border-b border-white/[0.08] flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Server Streaming
                      </span>
                      <span className="text-[9px] text-zinc-500">
                        Ganti jika buffering
                      </span>
                    </div>

                    <div className="p-1 space-y-1">
                      {/* CineSrc */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveServer("cinesrc");
                          setServerDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                          activeServer === "cinesrc"
                            ? "bg-red-600 text-white font-bold"
                            : "text-zinc-300 hover:text-white hover:bg-white/[0.08]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              activeServer === "cinesrc" ? "bg-white" : "bg-emerald-500"
                            }`}
                          />
                          <span>CineSrc</span>
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                            activeServer === "cinesrc"
                              ? "bg-black/30 text-white"
                              : "bg-white/[0.08] text-zinc-400"
                          }`}
                        >
                          Server 1 (Utama)
                        </span>
                      </button>

                      {/* VidLink */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveServer("vidlink");
                          setServerDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                          activeServer === "vidlink"
                            ? "bg-red-600 text-white font-bold"
                            : "text-zinc-300 hover:text-white hover:bg-white/[0.08]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              activeServer === "vidlink" ? "bg-white" : "bg-amber-400"
                            }`}
                          />
                          <span>VidLink</span>
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                            activeServer === "vidlink"
                              ? "bg-black/30 text-white"
                              : "bg-white/[0.08] text-zinc-400"
                          }`}
                        >
                          Server 2
                        </span>
                      </button>

                      {/* VidSrc */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveServer("vidsrcwiki");
                          setServerDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                          activeServer === "vidsrcwiki"
                            ? "bg-red-600 text-white font-bold"
                            : "text-zinc-300 hover:text-white hover:bg-white/[0.08]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              activeServer === "vidsrcwiki" ? "bg-white" : "bg-zinc-400"
                            }`}
                          />
                          <span>VidSrc Wiki</span>
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                            activeServer === "vidsrcwiki"
                              ? "bg-black/30 text-white"
                              : "bg-white/[0.08] text-zinc-400"
                          }`}
                        >
                          Server 3
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md"
                title={isNativeFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}
                aria-label="Fullscreen"
              >
                <svg width="14" height="14" className="sm:w-[17px] sm:h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Subtle Onboarding Hint: Informs viewers they can switch servers if buffering */}
          {serverHintVisible && (
            <div className="absolute top-14 sm:top-16 right-3 sm:right-6 z-40 pointer-events-none animate-fade-in">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/90 border border-white/20 text-white text-[11px] sm:text-xs font-medium shadow-2xl backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Video macet atau lambat? Klik tombol Server</span>
              </div>
            </div>
          )}

          {/* 100% Screen Video Stream */}
          <div className="absolute inset-0 w-full h-full bg-black overflow-hidden overscroll-none touch-manipulation [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <iframe
              key={`${streamUrl}-${activeServer}`}
              src={streamUrl}
              title={title}
              className="w-full h-full border-0 block"
              scrolling="no"
              referrerPolicy="origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen *"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* 2. AUTHENTIC NETFLIX PREVIEW MODAL */}
      <div
        className={`fixed inset-0 z-[120] items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-netflix-backdrop ${
          isTheaterOpen ? "hidden" : "flex"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={`Netflix Preview: ${title}`}
        onClick={closePreview}
      >
        <div
          className="relative w-full max-w-4xl max-h-[100vh] sm:max-h-[92vh] overflow-y-auto rounded-none sm:rounded-xl my-auto bg-[#181818] text-white shadow-[0_25px_80px_rgba(0,0,0,0.95)] select-none scrollbar-thin scrollbar-thumb-zinc-700 animate-netflix-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Netflix Circular Close Button */}
          <button
            onClick={closePreview}
            className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full flex items-center justify-center bg-[#181818] hover:bg-[#2a2a2a] text-white transition-all cursor-pointer shadow-xl active:scale-95"
            aria-label="Close"
            title="Close (Esc)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Cinematic Backdrop Header (Compact & balanced so content and episodes are visible) */}
          <div className="relative w-full h-[210px] sm:h-[280px] md:h-[320px] overflow-hidden bg-black">
            {backdropUrl ? (
              <Image
                src={`https://image.tmdb.org/t/p/w1280${backdropUrl}`}
                alt={title}
                fill
                priority
                className="object-cover object-top sm:object-center"
                sizes="(max-width: 1024px) 100vw, 900px"
              />
            ) : (
              <div className="w-full h-full bg-[#12141a] flex items-center justify-center text-zinc-500 text-sm">
                No preview available
              </div>
            )}

            {/* Seamless Netflix Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 via-50% to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/80 via-transparent to-transparent pointer-events-none" />

            {/* Bottom Content on Backdrop */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-8 sm:right-8 z-20">
              {/* Title in Clean Modern Sans */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug mb-2.5 drop-shadow-2xl max-w-2xl">
                {title}
              </h1>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {/* Large White Play Button */}
                <button
                  type="button"
                  onClick={() => handleStartPlay()}
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded bg-white hover:bg-white/80 text-black font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-xl active:scale-95"
                  title="Play Fullscreen"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                  <span>Play</span>
                </button>

                {/* Favorite / Love Button */}
                <button
                  type="button"
                  onClick={() => toggleFavorite(activeItem)}
                  className={`inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition-all cursor-pointer shadow-lg active:scale-95 ${
                    fav
                      ? "bg-red-600/20 text-red-500 border-red-500/80 shadow-red-500/30"
                      : "bg-black/60 hover:bg-black/80 text-white hover:text-red-400 border-white/40 hover:border-white"
                  }`}
                  title={fav ? "Remove from Favorites" : "Add to Favorites"}
                  aria-label={fav ? "Remove from Favorites" : "Add to Favorites"}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={fav ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Netflix Two-Column Detail Body */}
          <div className="p-4 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-7">
              {/* Left Column (Metadata & Synopsis) */}
              <div className="md:col-span-2 space-y-3.5">
                {/* Netflix Metadata Row */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold">
                  <span className="text-[#46d369] font-bold">{matchPercent}% Match</span>
                  {year && <span className="text-zinc-300">{year}</span>}
                  <span className="border border-white/40 px-1.5 py-0.2 rounded text-[10px] text-zinc-300 uppercase">
                    16+
                  </span>
                  {detailData?.runtime && (
                    <span className="text-zinc-300">{detailData.runtime}</span>
                  )}
                  <span className="border border-white/40 px-1 py-0.2 rounded text-[9px] text-zinc-300 font-bold uppercase">
                    Ultra HD 4K
                  </span>
                  <span className="border border-white/40 px-1 py-0.2 rounded text-[9px] text-zinc-300 font-bold uppercase">
                    CC
                  </span>
                </div>

                {/* Synopsis Paragraph */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                  {overview || "No synopsis available for this title."}
                </p>
              </div>

              {/* Right Column (Cast & Genres) */}
              <div className="space-y-2.5 text-xs text-zinc-400">
                {detailData?.cast && detailData.cast.length > 0 && (
                  <div>
                    <span className="text-zinc-500 font-normal">Cast: </span>
                    <span className="text-white font-medium">
                      {detailData.cast.slice(0, 4).map((c) => c.name).join(", ")}
                    </span>
                  </div>
                )}

                {genres.length > 0 && (
                  <div>
                    <span className="text-zinc-500 font-normal">Genres: </span>
                    <span className="text-white font-medium">
                      {genres.map((g) => g.name).join(", ")}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-zinc-500 font-normal">This show is: </span>
                  <span className="text-white font-medium">Suspenseful, Exciting, Highly Rated</span>
                </div>
              </div>
            </div>

            {/* TV Series Episodes Section - Authentic Netflix Style */}
            {resolvedType === "tv" && validSeasons.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                {/* Header: Title + Season Selector Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      Episodes
                    </h3>
                    {currentSeasonObj?.name && (
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {currentSeasonObj.name} ({currentSeasonObj.episode_count || seasonEpisodes.length} Episodes)
                      </p>
                    )}
                  </div>

                  {validSeasons.length > 1 && (
                    <div className="relative inline-block">
                      <select
                        value={selectedSeason}
                        onChange={(e) => handleSeasonChange(Number(e.target.value))}
                        className="appearance-none bg-[#242424] hover:bg-[#2e2e2e] border border-white/20 text-white text-xs sm:text-sm font-semibold pl-3.5 pr-8 py-1.5 rounded-lg outline-none cursor-pointer transition-colors shadow-md"
                        aria-label="Select season"
                      >
                        {validSeasons.map((s) => (
                          <option key={s.season_number} value={s.season_number} className="bg-[#1e1e1e] text-white">
                            {s.name || `Season ${s.season_number}`}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Episodes List */}
                {loadingSeasonEpisodes ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] animate-pulse">
                        <div className="w-5 h-5 rounded bg-zinc-800 shrink-0 mt-2" />
                        <div className="w-24 sm:w-28 aspect-video rounded-md bg-zinc-800 shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="w-1/3 h-3.5 bg-zinc-800 rounded" />
                          <div className="w-full h-2.5 bg-zinc-800/60 rounded" />
                          <div className="w-2/3 h-2.5 bg-zinc-800/40 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : seasonEpisodes.length > 0 ? (
                  <div className="flex flex-col gap-2 sm:gap-2.5">
                    {seasonEpisodes.map((ep) => {
                      const isActive = selectedEpisode === ep.episode_number;
                      const thumb = ep.still_path
                        ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                        : backdropUrl
                        ? `https://image.tmdb.org/t/p/w300${backdropUrl}`
                        : null;

                      return (
                        <div
                          key={ep.id || ep.episode_number}
                          onClick={() => handleStartPlay(selectedSeason, ep.episode_number)}
                          className={`group flex items-start gap-3 sm:gap-3.5 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border transition-all cursor-pointer ${
                            isActive
                              ? "bg-white/[0.08] border-red-500/70 shadow-lg shadow-red-950/30"
                              : "bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.06] hover:border-white/[0.16]"
                          }`}
                        >
                          {/* Episode Index */}
                          <span
                            className={`text-sm sm:text-base font-bold shrink-0 w-5 sm:w-7 text-center pt-1.5 sm:pt-2 transition-colors ${
                              isActive ? "text-red-500" : "text-zinc-500 group-hover:text-zinc-300"
                            }`}
                          >
                            {ep.episode_number}
                          </span>

                          {/* 16:9 Thumbnail with Hover Play Button */}
                          <div className="relative w-24 sm:w-32 aspect-video shrink-0 rounded-md sm:rounded-lg overflow-hidden bg-zinc-900 border border-white/10 shadow-sm">
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt={ep.name || `Episode ${ep.episode_number}`}
                                fill
                                sizes="(max-width: 640px) 96px, 128px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500 uppercase font-bold">
                                Episode {ep.episode_number}
                              </div>
                            )}

                            {/* Play Overlay */}
                            <div
                              className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M5 3l14 9-14 9V3z" />
                                </svg>
                              </div>
                            </div>

                            {/* Runtime badge on thumbnail */}
                            {ep.runtime && (
                              <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded text-[9px] font-bold bg-black/85 text-zinc-200">
                                {ep.runtime}m
                              </div>
                            )}
                          </div>

                          {/* Episode Details */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4
                                className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                                  isActive ? "text-red-400" : "text-white group-hover:text-red-300"
                                }`}
                              >
                                {ep.name || `Episode ${ep.episode_number}`}
                              </h4>
                              {ep.air_date && (
                                <span className="text-[10px] text-zinc-500 font-medium shrink-0 hidden sm:inline">
                                  {ep.air_date.split("-")[0]}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                              {ep.overview || "No description available for this episode."}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Fallback to numbered episodes if TMDB season detail was not yet loaded */
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {Array.from({ length: Math.min(episodeCount, 40) }, (_, i) => i + 1).map((ep) => {
                      const isActive = selectedEpisode === ep;
                      return (
                        <button
                          key={ep}
                          type="button"
                          onClick={() => handleStartPlay(selectedSeason, ep)}
                          className={`py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? "bg-red-600 text-white shadow-md scale-105"
                              : "bg-[#282828] hover:bg-[#383838] text-zinc-300 hover:text-white"
                          }`}
                        >
                          EP {ep}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Cast Avatars */}
            {detailData?.cast && detailData.cast.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase mb-4">
                  Cast
                </h3>

                <div className="flex items-start gap-4 sm:gap-5 overflow-x-auto pb-2 scroll-snap-x scrollbar-none" role="list">
                  {detailData.cast.map((actor) => (
                    <div key={actor.id} className="shrink-0 w-20 text-center flex flex-col items-center">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden mb-2 border border-white/15 bg-zinc-800 flex items-center justify-center shadow-md">
                        {actor.profile_path ? (
                          <Image
                            src={img(actor.profile_path, "w185")}
                            alt={actor.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                            unoptimized={!actor.profile_path}
                          />
                        ) : (
                          <span className="text-xs text-zinc-400 font-bold">{actor.name.slice(0, 1)}</span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-white truncate max-w-[80px] block">
                        {actor.name}
                      </span>
                      {actor.character && (
                        <span className="text-[11px] text-zinc-400 truncate max-w-[80px] block mt-0.5">
                          {actor.character}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* More Like This */}
            {detailData?.recommendations && detailData.recommendations.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-base font-bold text-white mb-4">
                  More Like This
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {detailData.recommendations.map((rec) => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => openPreview(rec, false)}
                      className="group relative rounded-md overflow-hidden bg-[#242424] hover:bg-[#2e2e2e] transition-all text-left cursor-pointer active:scale-98"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                        {rec.backdrop_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w500${rec.backdrop_path}`}
                            alt={displayTitle(rec)}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : rec.poster_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w342${rec.poster_path}`}
                            alt={displayTitle(rec)}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#242424] via-transparent to-transparent" />
                        {rec.vote_average > 0 && (
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/80 text-amber-400">
                            ★ {rec.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <span className="text-xs font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                          {displayTitle(rec)}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                          <span className="text-[#46d369] font-bold">95% Match</span>
                          <span>{displayYear(rec) || "Movie"}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
