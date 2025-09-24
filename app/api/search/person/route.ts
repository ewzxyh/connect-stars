import { searchPerson } from "@/services/tmdb";
import { NextResponse } from "next/server";

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
    const data = await searchPerson(query);
    // Filter out people with low popularity or no profile picture for better results
    const filteredResults = data.results
      .filter((person) => person.profile_path)
      .sort((a, b) => b.popularity - a.popularity);

    return NextResponse.json({ results: filteredResults });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data from TMDB" },
      { status: 500 },
    );
  }
}
