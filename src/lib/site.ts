/** Constantes compartidas del sitio público: navegación y canales de contacto. */

export interface NavItem {
  href: string;
  label: string;
  index: string;
  blurb: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", index: "01", blurb: "Posicionamiento, trabajo destacado y trayectoria." },
  { href: "/proyectos", label: "Proyectos", index: "02", blurb: "Casos de estudio con código y demos verificables." },
  { href: "/servicios", label: "Servicios", index: "03", blurb: "Qué construyo para negocios: alcance y entregables." },
  { href: "/experiencia", label: "Trayectoria", index: "04", blurb: "Experiencia laboral, formación y credenciales." },
  { href: "/sobre-mi", label: "Sobre mí", index: "05", blurb: "Historia, principios y stack comprobado." },
  { href: "/cv", label: "CV", index: "06", blurb: "Hoja de vida en PDF y resumen ejecutivo." },
  { href: "/arquitectura", label: "Arquitectura", index: "07", blurb: "Cómo está construido este sitio por dentro." },
  { href: "/contacto", label: "Contacto", index: "08", blurb: "Escríbeme: respuesta en menos de 24 horas." },
];

const WHATSAPP_NUMBER = "573215150904";

export const CONTACT = {
  email: "diego_8520@outlook.com",
  phoneDisplay: "+57 321 515 0904",
  linkedin: "https://www.linkedin.com/in/dalejandromunoz",
  linkedinHandle: "in/dalejandromunoz",
  github: "https://github.com/Diego-8520",
  githubHandle: "Diego-8520",
  location: "Cali, Valle del Cauca, Colombia",
  timezone: "America/Bogota",
  whatsappUrl(text = "Hola Diego, vi tu perfil y me gustaría conversar.") {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  },
} as const;

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
