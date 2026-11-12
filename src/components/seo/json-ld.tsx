/**
 * Inserta JSON-LD. `<` se escapa para que ningún texto (p. ej. una
 * descripción editada en el panel) pueda cerrar la etiqueta <script>.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
