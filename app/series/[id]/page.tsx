import { getTVDetail } from "@/lib/tmdb";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; episode?: string; startAt?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const show = await getTVDetail(id);
    return {
      title: show.name ?? "Series",
      description: show.overview?.slice(0, 160),
    };
  } catch {
    return { title: "Series" };
  }
}

export default async function SeriesDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const season = sp.season ?? "1";
  const episode = sp.episode ?? "1";
  const startAt = sp.startAt ? `&startAt=${encodeURIComponent(sp.startAt)}` : "";
  redirect(`/?series=${encodeURIComponent(id)}&season=${encodeURIComponent(season)}&episode=${encodeURIComponent(episode)}&play=1${startAt}`);
}
