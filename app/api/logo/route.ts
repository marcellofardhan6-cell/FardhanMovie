import { NextRequest, NextResponse } from "next/server";
import { getTitleLogo } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") === "tv" ? "tv" : "movie";

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const logoPath = await getTitleLogo(id, type);
    return NextResponse.json(
      { logoPath },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch title logo:", error);
    return NextResponse.json({ logoPath: null });
  }
}
