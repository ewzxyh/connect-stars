import { getPersonDetails } from "@/services/tmdb";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");
  const idParam = pathSegments[pathSegments.length - 1];
  const id = Number.parseInt(idParam);

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const data = await getPersonDetails(id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data from TMDB" },
      { status: 500 },
    );
  }
}
