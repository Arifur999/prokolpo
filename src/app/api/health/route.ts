// Liveness probe for the Docker HEALTHCHECK and the deploy script. Needs no session and no API.
// Outside proxy.ts's matcher on purpose.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok", uptime: process.uptime() });
}
