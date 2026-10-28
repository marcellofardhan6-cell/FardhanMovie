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

const SERVERS = [
  { id: "cinesrc", name: "Server 1" },
  { id: "vidlink", name: "Server 2" },
  { id: "vidsrcwiki", name: "Server 3" },
  { id: "rivestream", name: "Server 4" },
] as const;

let hasRestoredInitialUrl = false;
let userDismissedId: string | null = null;

function UrlPreviewListener() {
  const searchParams = useSearchParams();
  const { openPreview, isOpen } = usePreviewModal();
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Only execute on initial mount / page reload
    if (hasRestoredInitialUrl) return;

    let movieId = searchParams.get("movie");
    let seriesId = searchParams.get("series");
    let playParam = searchParams.get("play");
    let seasonParam = searchParams.get("season");
    let episodeParam = searchParams.get("episode");

    // Also check window.location.search directly in case searchParams hasn't hydrated/updated yet
    if (typeof window !== "undefined") {
      const rawParams = new URLSearchParams(window.location.search);
      if (!movieId && rawParams.get("movie")) movieId = rawParams.get("movie");
      if (!seriesId && rawParams.get("series")) seriesId = rawParams.get("series");
      if (!playParam && rawParams.get("play")) playParam = rawParams.get("play");
      if (!seasonParam && rawParams.get("season")) seasonParam = rawParams.get("season");
      if (!episodeParam && rawParams.get("episode")) episodeParam = rawParams.get("episode");
    }

    // Check sessionStorage fallback if query params were cleared by mobile pull-to-refresh
    if (!movieId && !seriesId && typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("fardtv_active_session");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.movieId || parsed.seriesId)) {
            movieId = parsed.movieId ? String(parsed.movieId) : null;
            seriesId = parsed.seriesId ? String(parsed.seriesId) : null;
            playParam = parsed.play ? "1" : "0";
            seasonParam = parsed.season ? String(parsed.season) : "1";
            episodeParam = parsed.episode ? String(parsed.episode) : "1";
          }
        }
      } catch {}
    }

    const id = movieId || seriesId;
    if (!id || userDismissedId === id) {
      hasRestoredInitialUrl = true;
      return;
    }

    if (!isOpen && !isFetchingRef.current) {
      hasRestoredInitialUrl = true;
      const type = seriesId ? "tv" : "movie";
      const season = seasonParam ? parseInt(seasonParam, 10) : 1;
      const episode = episodeParam ? parseInt(episodeParam, 10) : 1;
      const shouldPlay = playParam === "1";

      isFetchingRef.current = true;
      fetch(`/api/detail?id=${id}&type=${type}&season=${season}`)
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
          }
        })
        .catch(() => {})
        .finally(() => {
          isFetchingRef.current = false;
        });
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
  const [activeServer, setActiveServer] = useState<"cinesrc" | "vidlink" | "vidsrcwiki" | "rivestream">("cinesrc");
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const theaterContainerRef = useRef<HTMLDivElement | null>(null);
  const currentTimeRef = useRef<number>(0);

  // Track native fullscreen state changes reliably
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsNativeFullscreen(isFs);
    };
    handleFullscreenChange();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

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

  const enterNativeFullscreen = useCallback(async () => {
    try {
      const el = theaterContainerRef.current || document.documentElement;
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        if (el.requestFullscreen) {
          await el.requestFullscreen().catch(() => {});
        } else if ((el as any).webkitRequestFullscreen) {
          (el as any).webkitRequestFullscreen();
        }
      }
      setIsNativeFullscreen(true);
    } catch {
      setIsNativeFullscreen(true);
    }
  }, []);

  const exitNativeFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch {}
    setIsNativeFullscreen(false);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (isNativeFullscreen || document.fullscreenElement || (document as any).webkitFullscreenElement) {
      await exitNativeFullscreen();
    } else {
      await enterNativeFullscreen();
    }
  }, [isNativeFullscreen, enterNativeFullscreen, exitNativeFullscreen]);

  // Start playing in embedded player mode
  const handleStartPlay = useCallback(
    async (seasonNum?: number, episodeNum?: number) => {
      const sNum = seasonNum !== undefined ? seasonNum : selectedSeason;
      const eNum = episodeNum !== undefined ? episodeNum : selectedEpisode;
      if (seasonNum !== undefined) setSelectedSeason(seasonNum);
      if (episodeNum !== undefined) setSelectedEpisode(episodeNum);
      setIsTheaterOpen(true);
      setControlsVisible(true);

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
    },
    [activeItem, detailData, resolvedType, selectedSeason, selectedEpisode, addHistory, getHistoryItem]
  );

  const handleStopPlay = useCallback(() => {
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
    exitNativeFullscreen();
    setIsTheaterOpen(false);
  }, [activeItem, detailData, resolvedType, selectedSeason, selectedEpisode, updateProgress, exitNativeFullscreen]);

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

  // Handle mobile / browser back button or swipe gesture safely
  useEffect(() => {
    if (!isTheaterOpen && !isOpen) return;

    const onPopState = () => {
      if (isNativeFullscreen) {
        exitNativeFullscreen();
      } else if (isTheaterOpen) {
        handleStopPlay();
      }
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [isTheaterOpen, isOpen, isNativeFullscreen, exitNativeFullscreen, handleStopPlay]);

  // Show / hide floating controls on mouse movement or touch in fullscreen mode
  const handleUserActivity = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 4000);
  }, []);

  // Switch server reliably
  const handleSwitchServer = useCallback(
    (serverKey: "cinesrc" | "vidlink" | "vidsrcwiki" | "rivestream") => {
      setActiveServer(serverKey);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("fardtv_active_server", serverKey);
        } catch {}
      }
    },
    []
  );

  // Listen for window-level mouse movement, touches & iframe focus changes when theater is open
  useEffect(() => {
    if (!isTheaterOpen) return;

    const onActivity = () => {
      setControlsVisible(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3800);
    };

    // When the user clicks or taps inside the cross-origin video iframe, the parent window fires a blur event.
    // By listening to window blur, clicking on the player reliably reveals the controls!
    const onWindowBlur = () => {
      setControlsVisible(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 4500);
    };

    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });
    window.addEventListener("blur", onWindowBlur);

    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("blur", onWindowBlur);
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
  const wasOpenRef = useRef<boolean>(false);

  // Synchronize active preview and playback state with URL search params and sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isOpen && activeItem) {
      wasOpenRef.current = true;
      userDismissedId = null;
      const isTv = activeItem.media_type === "tv" || resolvedType === "tv";
      const currentUrl = new URL(window.location.href);

      if (isTv) {
        currentUrl.searchParams.delete("movie");
        currentUrl.searchParams.set("series", String(activeItem.id));
        currentUrl.searchParams.set("season", String(selectedSeason));
        currentUrl.searchParams.set("episode", String(selectedEpisode));
      } else {
        currentUrl.searchParams.delete("series");
        currentUrl.searchParams.delete("season");
        currentUrl.searchParams.delete("episode");
        currentUrl.searchParams.set("movie", String(activeItem.id));
      }

      if (isTheaterOpen) {
        currentUrl.searchParams.set("play", "1");
        currentUrl.searchParams.set("server", activeServer);
      } else {
        currentUrl.searchParams.delete("play");
        currentUrl.searchParams.delete("server");
      }

      window.history.replaceState(
        { ...window.history.state, fardTvModal: true },
        "",
        currentUrl.pathname + (currentUrl.search ? currentUrl.search : "") + currentUrl.hash
      );

      try {
        sessionStorage.setItem(
          "fardtv_active_session",
          JSON.stringify({
            movieId: !isTv ? activeItem.id : null,
            seriesId: isTv ? activeItem.id : null,
            play: isTheaterOpen,
            season: selectedSeason,
            episode: selectedEpisode,
            server: activeServer,
          })
        );
      } catch {}
    } else if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
      const currentUrl = new URL(window.location.href);
      const hadParams =
        currentUrl.searchParams.has("movie") ||
        currentUrl.searchParams.has("series") ||
        currentUrl.searchParams.has("play") ||
        currentUrl.searchParams.has("season") ||
        currentUrl.searchParams.has("episode") ||
        currentUrl.searchParams.has("server");

      if (hadParams) {
        currentUrl.searchParams.delete("movie");
        currentUrl.searchParams.delete("series");
        currentUrl.searchParams.delete("play");
        currentUrl.searchParams.delete("season");
        currentUrl.searchParams.delete("episode");
        currentUrl.searchParams.delete("server");
        currentUrl.searchParams.delete("startAt");
        window.history.replaceState(
          {},
          "",
          currentUrl.pathname + (currentUrl.search ? currentUrl.search : "") + currentUrl.hash
        );
      }

      try {
        sessionStorage.removeItem("fardtv_active_session");
        sessionStorage.removeItem("fardtv_active_server");
      } catch {}
    }
  }, [isOpen, activeItem, resolvedType, isTheaterOpen, selectedSeason, selectedEpisode, activeServer]);

  useEffect(() => {
    if (isOpen && activeItem) {
      if (lastProcessedIdRef.current !== activeItem.id) {
        lastProcessedIdRef.current = activeItem.id;
        setDetailData(null);
        setSeasonEpisodesMap({});
        setSelectedSeason(initialSeason || 1);
        setSelectedEpisode(initialEpisode || 1);
        setIsTheaterOpen(false);

        // Restore server from URL or sessionStorage if previously selected
        const validServers = ["cinesrc", "vidlink", "vidsrcwiki", "rivestream"] as const;
        let chosenServer: typeof validServers[number] = "cinesrc";
        if (typeof window !== "undefined") {
          const urlServer = new URLSearchParams(window.location.search).get("server");
          const sessionServer = sessionStorage.getItem("fardtv_active_server");
          if (urlServer && (validServers as readonly string[]).includes(urlServer)) {
            chosenServer = urlServer as typeof validServers[number];
          } else if (sessionServer && (validServers as readonly string[]).includes(sessionServer)) {
            chosenServer = sessionServer as typeof validServers[number];
          }
        }
        setActiveServer(chosenServer);

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
    };
  }, [isOpen, activeItem?.id, resolvedType, autoPlay, initialSeason, initialEpisode, fetchDetail]);

  const handleModalClose = useCallback(() => {
    if (activeItem) {
      userDismissedId = String(activeItem.id);
    }
    hasRestoredInitialUrl = true;
    exitNativeFullscreen();
    setIsTheaterOpen(false);
    closePreview();
  }, [activeItem, closePreview, exitNativeFullscreen]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        if (isNativeFullscreen) {
          exitNativeFullscreen();
        } else if (isTheaterOpen) {
          handleStopPlay();
        } else {
          handleModalClose();
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
  }, [isOpen, isNativeFullscreen, isTheaterOpen, exitNativeFullscreen, handleStopPlay, handleModalClose]);

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

  // Build stream URL for active servers (CineSrc, VidLink, VidSrc Wiki, RiveStream)
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
      : activeServer === "vidsrcwiki"
      ? resolvedType === "tv"
        ? `https://vidsrc.wiki/embed/tv/${idStr}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.wiki/embed/movie/${idStr}`
      : resolvedType === "tv"
      ? `https://rivestream.ru/embed?type=tv&id=${idStr}&season=${selectedSeason}&episode=${selectedEpisode}`
      : `https://rivestream.ru/embed?type=movie&id=${idStr}`;

  return (
    <>
      <Suspense fallback={null}>
        <UrlPreviewListener />
      </Suspense>
      {/* 1. NATIVE FULLSCREEN PLAYER OVERLAY */}
      {isNativeFullscreen && isTheaterOpen && (
        <div
          ref={theaterContainerRef}
          className="fixed inset-0 z-[9999] w-screen h-screen bg-black overflow-hidden flex flex-col select-none"
          onMouseMove={handleUserActivity}
          onClick={handleUserActivity}
          onTouchStart={handleUserActivity}
        >
          {/* Floating Fullscreen Top Controls */}
          <div
            className={`absolute top-0 inset-x-0 z-50 flex items-center justify-between p-3 sm:px-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
              controlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exitNativeFullscreen}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#12141a]/95 hover:bg-black text-white border border-white/25 shadow-xl backdrop-blur-md cursor-pointer active:scale-95 transition-all shrink-0"
                title="Exit Fullscreen"
                aria-label="Exit Fullscreen"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-white text-xs font-semibold truncate max-w-xs hidden sm:inline">
                {title} {resolvedType === "tv" && `S${selectedSeason} E${selectedEpisode}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#12141a]/95 p-1 rounded-xl border border-white/20 backdrop-blur-md">
                {SERVERS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSwitchServer(s.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeServer === s.id
                        ? "bg-red-600 text-white font-bold"
                        : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={exitNativeFullscreen}
                className="p-2 rounded-xl bg-[#12141a]/95 hover:bg-black text-white border border-white/20 shadow-xl backdrop-blur-md cursor-pointer active:scale-95 transition-all"
                title="Exit Fullscreen"
                aria-label="Exit Fullscreen"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
              </button>
            </div>
          </div>

          <div className="relative w-full h-full bg-black">
            <iframe
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

      {/* 2. AUTHENTIC PREVIEW MODAL */}
      <div
        className={`fixed inset-0 z-[120] items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-netflix-backdrop ${
          isNativeFullscreen ? "hidden" : "flex"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={`Preview: ${title}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleModalClose();
          }
        }}
      >
        <div
          className="relative w-full max-w-4xl max-h-[100vh] sm:max-h-[92vh] overflow-y-auto rounded-none sm:rounded-xl my-auto bg-[#181818] text-white shadow-[0_25px_80px_rgba(0,0,0,0.95)] select-none scrollbar-thin scrollbar-thumb-zinc-700 animate-netflix-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Modal Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleModalClose();
            }}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-[#181818]/90 hover:bg-[#2a2a2a] text-white border border-white/20 transition-all cursor-pointer shadow-2xl active:scale-95"
            aria-label="Close modal"
            title="Close (Esc)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Media Header (Embedded Player or Backdrop) */}
          <div className="relative w-full aspect-video sm:h-[340px] md:h-[420px] bg-black overflow-hidden">
            {isTheaterOpen ? (
              <div className="relative w-full h-full">
                <iframe
                  src={streamUrl}
                  title={title}
                  className="w-full h-full border-0 block"
                  scrolling="no"
                  referrerPolicy="origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen *"
                  allowFullScreen
                />
              </div>
            ) : (
              <>
                {backdropUrl ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/original${backdropUrl}`}
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 via-50% to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-8 sm:right-8 z-20">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug mb-2.5 drop-shadow-2xl max-w-2xl">
                    {title}
                  </h1>

                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => handleStartPlay()}
                      className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded bg-white hover:bg-white/80 text-black font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-xl active:scale-95"
                      title="Play"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 3l14 9-14 9V3z" />
                      </svg>
                      <span>Play</span>
                    </button>

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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Embedded Player Control Toolbar */}
          {isTheaterOpen && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-6 py-2.5 bg-[#141414] border-b border-white/10">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[11px] font-semibold text-zinc-400 mr-1 hidden sm:inline">Server:</span>
                {SERVERS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSwitchServer(s.id)}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                      activeServer === s.id
                        ? "bg-red-600 text-white font-bold shadow-md shadow-red-950/40"
                        : "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={enterNativeFullscreen}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer active:scale-95 shrink-0"
                  title="Fullscreen"
                  aria-label="Fullscreen"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleStopPlay}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium border border-white/10 transition-all cursor-pointer shrink-0"
                  title="Stop Video and View Details"
                >
                  <span>Details</span>
                </button>
              </div>
            </div>
          )}

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
                        ? `https://image.tmdb.org/t/p/original${ep.still_path}`
                        : backdropUrl
                        ? `https://image.tmdb.org/t/p/original${backdropUrl}`
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
                            src={img(actor.profile_path, "h632")}
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
                            src={`https://image.tmdb.org/t/p/w780${rec.backdrop_path}`}
                            alt={displayTitle(rec)}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : rec.poster_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w780${rec.poster_path}`}
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
