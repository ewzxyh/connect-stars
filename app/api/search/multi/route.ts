import { NextResponse } from "next/server";
import { multiSearch } from "@/services/tmdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const data = await multiSearch(query);
    const filteredResults = data.results
      .filter(
        (item) =>
          (item.media_type === "person" &&
            item.popularity > 5 &&
            item.profile_path) ||
          (item.media_type === "movie" &&
            item.popularity > 10 &&
            item.poster_path),
      )
      .sort((a, b) => b.popularity - a.popularity);

    return NextResponse.json({ results: filteredResults });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch data from TMDB" },
      { status: 500 },
    );
  }
}
