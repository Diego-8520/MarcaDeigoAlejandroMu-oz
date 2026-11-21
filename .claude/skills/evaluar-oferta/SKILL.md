---
name: evaluar-oferta
description: Evalúa en detalle si a Diego le conviene postularse a una vacante guardada en el buscador del panel (/dashboard/empleo): encaje real, brechas, riesgos y preguntas para la entrevista. Guarda la evaluación para verla en el panel. Úsala cuando pida evaluar, revisar o decidir sobre una oferta (con su id).
argument-hint: <id de la vacante>
---

# Evaluar una oferta

Objetivo: una evaluación honesta y accionable de la vacante `$ARGUMENTS` frente a la HV real de Diego.

## Pasos

1. Si no hay id, ejecuta `npm run empleo:contexto` y pide a Diego que elija una vacante.
2. Ejecuta `npm run empleo:contexto -- <id>` y lee la vacante, la HV y el `analisisPorReglas`.
3. Evalúa. El puntaje por reglas es una referencia; matízalo con criterio:
   - ¿Los requisitos que faltan son excluyentes o se pueden compensar con experiencia relacionada?
   - ¿El nivel (junior/senior), los años y el tipo de rol encajan con la trayectoria real?
   - Riesgos de la oferta: salario ausente o bajo para el rol, demasiadas responsabilidades para el nivel, señales de alerta (pagos por adelantado, datos personales excesivos, descripción vaga), modalidad o ubicación.
4. Escribe la evaluación en un archivo temporal con este formato exacto:

```json
{
  "verdict": "postular | postular_con_ajustes | no_recomendado",
  "fitSummary": "2–4 frases: por qué sí o por qué no.",
  "strengths": ["Fortalezas reales de la HV para esta vacante"],
  "gaps": [{ "item": "Excel avanzado", "severity": "alta | media | baja", "mitigation": "Cómo compensarlo honestamente" }],
  "risks": ["Riesgos o dudas de la oferta"],
  "questionsToAsk": ["Preguntas para hacer en la entrevista"],
  "recommendedActions": ["Pasos concretos: ajustar HV, curso, contactar a alguien…"]
}
```

5. Guarda con `npm run empleo:guardar -- <id> evaluacion <archivo>` y corrige si hay errores de formato.
6. Resume a Diego el veredicto y las 2–3 acciones más importantes. Si el veredicto es `postular` o `postular_con_ajustes`, ofrece ejecutar `/adaptar-hv <id>`.

## Reglas

- Sé directo y honesto: si no conviene, dilo y explica por qué.
- No supongas experiencia que no está en la HV; si algo es dudoso, pregúntale a Diego.
- Las mitigaciones nunca implican mentir en la HV.
