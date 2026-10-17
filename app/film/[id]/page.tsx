import { getMovieDetail } from "@/lib/tmdb";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ startAt?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await getMovieDetail(id);
    return {
      title: movie.title ?? "Movie",
      description: movie.overview?.slice(0, 160),
    };
  } catch {
    return { title: "Movie" };
  }
}

export default async function FilmDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const startAt = sp.startAt ? `&startAt=${encodeURIComponent(sp.startAt)}` : "";
  redirect(`/?movie=${encodeURIComponent(id)}&play=1${startAt}`);
}
