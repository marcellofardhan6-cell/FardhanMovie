import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ season?: string; episode?: string; startAt?: string }>;
}

export default async function SeriesDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const season = sp?.season ?? "1";
  const episode = sp?.episode ?? "1";
  const startAt = sp?.startAt ? `&startAt=${encodeURIComponent(sp.startAt)}` : "";
  redirect(`/?series=${encodeURIComponent(id)}&season=${encodeURIComponent(season)}&episode=${encodeURIComponent(episode)}${startAt}`);
}
