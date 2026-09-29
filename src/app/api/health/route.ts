// Static health check. The app itself has no server-side dependencies:
// all examination data lives in the visitor's browser (see src/lib/mock-api).
export const dynamic = "force-static";

export function GET() {
  return Response.json({ ok: true, mode: "frontend-only" });
}
