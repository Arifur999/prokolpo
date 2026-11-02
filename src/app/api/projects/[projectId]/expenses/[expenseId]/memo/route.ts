import { cookies } from "next/headers";
import { getEnv } from "@/env";
import { ACCESS_TOKEN_COOKIE } from "@/lib/tokenUtils";

const SAFE_IMAGE = /^image\/(jpeg|png|webp)\b/;

// Streams a memo photo from the API with the reader's token, so an <img> or a new tab can
// show it. The API checks that the reader is a member of the project.
export async function GET(_request: Request, { params }: RouteContext<"/api/projects/[projectId]/expenses/[expenseId]/memo">) {
  const { projectId, expenseId } = await params;
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return new Response(null, { status: 401 });

  const upstream = await fetch(`${getEnv().API_BASE_URL}/projects/${encodeURIComponent(projectId)}/expenses/${encodeURIComponent(expenseId)}/memo`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!upstream.ok || !upstream.body) return new Response(null, { status: upstream.status === 404 ? 404 : 502 });
  // Served from our own origin, so only a photo goes out: never HTML or SVG that could run script.
  const type = upstream.headers.get("Content-Type") ?? "";
  if (!SAFE_IMAGE.test(type)) return new Response(null, { status: 502 });
  return new Response(upstream.body, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
