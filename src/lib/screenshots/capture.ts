import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { assertPublicUrl } from "./url-guard";

/**
 * Captura de las partes relevantes de un sitio con un Chromium propio:
 * hero de escritorio, hasta 4 secciones clave y hero móvil.
 *
 * - Vercel: binario de @sparticuz/chromium.
 * - Local: CHROME_EXECUTABLE_PATH (Chrome/Chromium instalado).
 */

export type ShotKind = "desktop" | "section" | "mobile";

export type Shot = {
  kind: ShotKind;
  bytes: Uint8Array;
  width: number;
  height: number;
  caption: string | null;
};

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2 };
const MAX_SECTIONS = 4;
const MAX_SECTION_HEIGHT = 1100;
const WEBP = { type: "webp", quality: 80 } as const;

// Oculta banners de cookies/consentimiento habituales y la barra de scroll.
const HIDE_OVERLAYS_CSS = `
  [id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i],
  [id*="gdpr" i], [class*="gdpr" i], #onetrust-banner-sdk, .cc-window, .cky-consent-container {
    display: none !important;
  }
  html { scrollbar-width: none !important; }
  ::-webkit-scrollbar { display: none !important; }
`;

async function launchBrowser(): Promise<Browser> {
  const localPath = process.env.CHROME_EXECUTABLE_PATH;
  if (localPath) {
    return puppeteer.launch({
      executablePath: localPath,
      headless: true,
      args: ["--no-sandbox", "--hide-scrollbars"],
    });
  }

  chromium.setGraphicsMode = false;
  return puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
    headless: "shell",
  });
}

/** Bloquea navegaciones del frame principal hacia hosts privados (redirecciones). */
async function guardNavigation(page: Page) {
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.isInterceptResolutionHandled()) return;
    const url = request.url();
    if (!/^https?:|^data:|^blob:/i.test(url)) {
      void request.abort("blockedbyclient");
      return;
    }
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      assertPublicUrl(url)
        .then(() => request.continue())
        .catch(() => request.abort("blockedbyclient"));
      return;
    }
    void request.continue();
  });
}

async function load(page: Page, url: string) {
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 25_000 });
  } catch (error) {
    // Sitios con conexiones abiertas (analytics, websockets) nunca llegan a
    // networkidle: si el documento cargó, seguimos con lo que hay.
    const hasBody = await page.evaluate(() => document.body?.innerText.length ?? 0).catch(() => 0);
    if (!hasBody) throw error;
  }
  await page.addStyleTag({ content: HIDE_OVERLAYS_CSS }).catch(() => undefined);
  await sleep(800);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Recorre la página para disparar imágenes lazy y revelados al hacer scroll. */
async function warmUpScroll(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    const limit = Math.min(document.documentElement.scrollHeight, 20_000);
    for (let y = 0; y < limit; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await sleep(400);
}

type SectionBox = { top: number; height: number; caption: string | null };

/** Elige las secciones más relevantes: con título, medios y tamaño razonable. */
async function findSections(page: Page): Promise<SectionBox[]> {
  return page.evaluate(
    ({ max, maxHeight, heroHeight }) => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(
          "main section, section, main > div[id], main > article, [role='region']",
        ),
      );
      const seen = new Set<HTMLElement>();
      const candidates: Array<{ el: HTMLElement; top: number; height: number; score: number; caption: string | null }> = [];

      for (const el of nodes) {
        if (seen.has(el)) continue;
        seen.add(el);
        if (el.closest("header, footer, nav, dialog, [aria-hidden='true']")) continue;

        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const height = rect.height;
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        if (height < 320 || height > 2400 || rect.width < 600) continue;
        // El hero ya lo cubre la captura de escritorio.
        if (top < heroHeight * 0.6) continue;
        // Evita contenedores que envuelven a otras secciones candidatas.
        if (el.querySelector("section section") || el.querySelectorAll("section").length > 2) continue;

        const heading = el.querySelector("h1, h2, h3");
        const caption = heading?.textContent?.replace(/\s+/g, " ").trim().slice(0, 80) || null;
        const media = el.querySelectorAll("img, video, canvas, picture, svg[width], iframe").length;
        const text = el.innerText.length;

        let score = 0;
        if (heading) score += 4;
        score += Math.min(media, 4) * 1.5;
        if (text > 120) score += 1;
        if (text > 2500) score -= 1; // bloques de texto puro lucen peor
        score += Math.min(height, maxHeight) / 600;

        candidates.push({ el, top, height, score, caption });
      }

      // Quita candidatos anidados dentro de otro candidato mejor puntuado.
      const filtered = candidates.filter(
        (c) => !candidates.some((o) => o !== c && o.el.contains(c.el) && o.score >= c.score),
      );

      return filtered
        .sort((a, b) => b.score - a.score)
        .slice(0, max)
        .sort((a, b) => a.top - b.top)
        .map(({ top, height, caption }) => ({ top: Math.round(top), height: Math.round(height), caption }));
    },
    { max: MAX_SECTIONS, maxHeight: MAX_SECTION_HEIGHT, heroHeight: DESKTOP.height },
  );
}

export async function captureSite(rawUrl: string): Promise<Shot[]> {
  const url = (await assertPublicUrl(rawUrl)).toString();
  const browser = await launchBrowser();
  const shots: Shot[] = [];

  try {
    const page = await browser.newPage();
    await guardNavigation(page);
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);

    // 1. Hero de escritorio
    await page.setViewport({ ...DESKTOP, deviceScaleFactor: 1 });
    await load(page, url);
    shots.push({
      kind: "desktop",
      bytes: await page.screenshot({ ...WEBP }),
      width: DESKTOP.width,
      height: DESKTOP.height,
      caption: null,
    });

    // 2. Secciones relevantes
    await warmUpScroll(page);
    const sections = await findSections(page);
    // Headers/barras fijas taparían el borde superior de cada sección.
    await page.evaluate(() => {
      for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
        const { position } = getComputedStyle(el);
        if (position === "fixed" || position === "sticky") el.style.setProperty("visibility", "hidden", "important");
      }
    });
    for (const section of sections) {
      const height = Math.min(section.height, MAX_SECTION_HEIGHT);
      await page.evaluate((y) => window.scrollTo(0, y), section.top);
      await sleep(600);
      shots.push({
        kind: "section",
        bytes: await page.screenshot({
          ...WEBP,
          clip: { x: 0, y: section.top, width: DESKTOP.width, height },
          captureBeyondViewport: true,
        }),
        width: DESKTOP.width,
        height,
        caption: section.caption,
      });
    }

    // 3. Hero móvil
    await page.setViewport({ width: MOBILE.width, height: MOBILE.height, deviceScaleFactor: MOBILE.deviceScaleFactor, isMobile: true, hasTouch: true });
    await load(page, url);
    shots.push({
      kind: "mobile",
      bytes: await page.screenshot({ ...WEBP }),
      width: MOBILE.width * MOBILE.deviceScaleFactor,
      height: MOBILE.height * MOBILE.deviceScaleFactor,
      caption: null,
    });

    return shots;
  } finally {
    await browser.close().catch(() => undefined);
  }
}
