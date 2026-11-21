import { redirect } from "next/navigation";

/** Recursos externos ahora vive dentro de Integraciones; se conserva la ruta para enlaces guardados. */
export default async function RecursosExternosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }
  const suffix = query.toString();
  redirect(`/dashboard/integraciones${suffix ? `?${suffix}` : ""}`);
}
