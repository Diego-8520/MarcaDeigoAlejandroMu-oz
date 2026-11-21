---
name: adaptar-hv
description: Adapta la hoja de vida de Diego a una vacante guardada en el buscador de empleo del panel (/dashboard/empleo), usando solo su experiencia real, y la guarda para verla e imprimirla en el panel. Úsala cuando pida adaptar, ajustar o personalizar la HV/CV para una vacante (con su id).
argument-hint: <id de la vacante>
---

# Adaptar HV a una vacante

Objetivo: una versión de la HV enfocada en la vacante `$ARGUMENTS`, **sin inventar nada**. Puedes reformular, priorizar, recortar y usar los términos de la vacante; no puedes agregar experiencia, cifras, herramientas ni logros que no estén en la HV maestra.

## Pasos

1. Si no hay id, ejecuta `npm run empleo:contexto` y pide a Diego que elija una vacante de la lista.
2. Ejecuta `npm run empleo:contexto -- <id>` y lee el JSON completo:
   - `vacante`: descripción en texto.
   - `hv`: la HV maestra. Cada descripción y logro tiene un `ref` (`exp:<id>:desc`, `exp:<id>:ach:<n>`, `proj:<id>`).
   - `analisisPorReglas`: puntaje, palabras clave (`presente` / `variante` / `falta`) y tips. Úsalo como punto de partida, no como verdad absoluta.
3. Redacta la HV adaptada en un archivo temporal (p. ej. en el scratchpad o `/tmp/hv-<id>.json`) con este formato exacto:

```json
{
  "headline": "Cargo de la vacante | 3 fortalezas reales",
  "summary": "3–4 frases en primera persona implícita, con datos reales.",
  "skills": ["Skills reales, primero las que pide la vacante"],
  "experiences": [
    {
      "id": "<id de la experiencia>",
      "bullets": [{ "text": "Viñeta reformulada", "sourceRef": "exp:<id>:ach:0" }]
    }
  ],
  "projects": [{ "id": "<id>", "bullets": [{ "text": "…", "sourceRef": "proj:<id>" }] }],
  "educationIds": ["<id>"],
  "certificationIds": ["<id>"],
  "changes": ["Qué cambiaste y por qué (para que Diego revise)"],
  "keywordsCovered": ["Términos de la vacante que quedaron en la HV"],
  "keywordsNotAdded": [{ "term": "Kubernetes", "reason": "No aparece en la HV maestra" }]
}
```

4. Guarda con `npm run empleo:guardar -- <id> hv <archivo>`. Si responde con errores, corrígelos (casi siempre son cifras o skills sin fuente) y vuelve a guardar. Atiende también las advertencias.
5. Dile a Diego la URL que imprime el comando y resume en 3–5 líneas los cambios principales y lo que quedó en `keywordsNotAdded`.

## Reglas

- **Empresa, cargo y fechas no se escriben**: se toman de la HV maestra al mostrarla. Solo eliges qué experiencias incluir (por `id`) y en qué orden.
- Cada viñeta debe tener un `sourceRef` de **su misma** experiencia o proyecto. Una viñeta puede reformular, resumir o unir ideas de esa fuente, nada más.
- Cifras (%, $, tiempos, cantidades): solo si están en el texto fuente. En el resumen solo cifras de la HV o los años de experiencia (`aniosExperienciaHv`).
- `skills`: solo las de la HV o términos con estado `presente`/`variante` en el análisis. Lo que falte va a `keywordsNotAdded` con la razón.
- Usa el término exacto de la vacante cuando la HV lo respalde (p. ej. «Power BI» en lugar de «PowerBI»). Para niveles («Excel avanzado») solo si la HV lo sustenta; si no, pregúntale a Diego.
- Prioriza: experiencias con más coincidencias primero dentro de una sección «Experiencia relevante» (el panel conserva el orden que des), 3–5 viñetas en la más relevante, 1–3 en las demás. Omite lo irrelevante.
- Formato ATS: frases cortas que empiezan con verbo en pasado, sin tablas ni emojis. Español neutro.
- Si te falta información para mejorar algo (p. ej. un logro sin cifra), pregúntale a Diego en lugar de suponer.
