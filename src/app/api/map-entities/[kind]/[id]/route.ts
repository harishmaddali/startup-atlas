import { getMapEntity } from "@/lib/ecosystem-repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ kind: string; id: string }> }
) {
  const { kind, id } = await context.params;
  const entity = getMapEntity(kind, id);

  if (!entity) {
    return Response.json({ error: "Map entity not found" }, { status: 404 });
  }

  return Response.json(entity, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
