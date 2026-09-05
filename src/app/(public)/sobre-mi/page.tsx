import type { Metadata } from "next";
import Image from "next/image";
import { ProfileLinkIcon } from "@/components/profile/profile-link-icon";
import { Section, Tag } from "@/components/ui/section";
import { getProfile, getProfileLinks } from "@/lib/data/profile-queries";

export const metadata: Metadata = {
  title: "Sobre mí — Diego Alejandro Muñoz",
};

const HEADLINE_TECH = [
  "TypeScript",
  "Next.js",
  "React",
  "Python",
  "FastAPI",
  "PostgreSQL",
  "AI",
  "n8n",
  "Docker",
  "Vercel",
  "GitHub Actions",
];

export const dynamic = "force-dynamic";

export default async function SobreMiPage() {
  const [profile, links] = await Promise.all([getProfile(), getProfileLinks()]);
  const fullName = profile?.fullName ?? "Diego Alejandro Muñoz";

  return (
    <Section className="pt-16 lg:pt-24">
      <p className="font-mono text-xs text-ink-muted">sobre mí</p>
      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
        {profile?.avatarUrl && (
          <div className="relative h-24 w-24 flex-none overflow-hidden border border-line bg-white/40">
            <Image
              src={profile.avatarUrl}
              alt={`Avatar de ${fullName}`}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        )}
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {fullName}
          </h1>
          {profile?.headline && (
            <p className="mt-3 font-mono text-sm text-signal">
              {profile.headline}
            </p>
          )}
          {profile?.bio && (
            <p className="mt-6 max-w-xl whitespace-pre-line font-body text-base leading-relaxed text-ink-muted">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {links.length > 0 && (
        <nav className="mt-8 flex flex-wrap gap-3" aria-label="Redes y enlaces">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              title={link.label}
              className="inline-flex items-center gap-2 border border-line px-3 py-2 font-mono text-xs text-ink-muted transition-colors hover:border-signal hover:text-signal"
            >
              <ProfileLinkIcon name={link.icon} size={15} />
              <span>{link.label}</span>
            </a>
          ))}
        </nav>
      )}

      <div className="mt-10 border-t border-line pt-8">
        <h2 className="font-display text-base font-semibold text-ink">
          Tecnologías principales
        </h2>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {HEADLINE_TECH.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>
    </Section>
  );
}
