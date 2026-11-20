"use client";

import { useRef, ViewTransition } from "react";
import { useMotion } from "@/components/motion/gsap";
import { BrowserFrame, PhoneFrame, type FrameImage } from "./frames";

/**
 * Hero del caso de estudio: la captura de escritorio en un marco de navegador
 * y, superpuesta abajo a la derecha, la vista móvil. Con movimiento activo el
 * teléfono se desplaza a otra velocidad (parallax suave).
 */
export function ProjectHero({
  slug,
  desktop,
  mobile,
  domain,
}: {
  slug: string;
  desktop: FrameImage;
  mobile?: FrameImage | null;
  domain?: string | null;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);

  useMotion(
    ({ gsap }) => {
      if (!phone.current) return;
      gsap.fromTo(
        phone.current,
        { yPercent: 12 },
        {
          yPercent: -10,
          ease: "none",
          scrollTrigger: { trigger: scope.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    },
    [],
    { scope, trigger: scope },
  );

  return (
    <div ref={scope} className={mobile ? "relative sm:pb-[12%]" : "relative"}>
      <ViewTransition name={`project-media-${slug}`} share="project-morph">
        <div className={mobile ? "sm:w-[86%]" : undefined}>
          <BrowserFrame image={desktop} domain={domain} priority sizes="(min-width: 1600px) 1380px, 90vw" />
        </div>
      </ViewTransition>

      {mobile && (
        <div ref={phone} className="absolute bottom-0 right-0 hidden w-[23%] max-w-[300px] sm:block">
          <PhoneFrame image={mobile} sizes="(min-width: 1600px) 300px, 23vw" />
        </div>
      )}
    </div>
  );
}
