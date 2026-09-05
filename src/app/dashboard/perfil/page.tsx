import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileLinksManager } from "@/components/profile/profile-links-manager";
import {
  getProfileAdmin,
  getProfileLinksAdmin,
} from "@/lib/data/profile-queries";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const [profile, links] = await Promise.all([
    getProfileAdmin(),
    getProfileLinksAdmin(),
  ]);

  return (
    <div>
      <p className="font-mono text-xs text-ink-muted">dashboard / perfil</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Perfil
      </h1>
      <p className="mt-2 font-body text-sm text-ink-muted">
        Contenido personal visible en la página Sobre mí.
      </p>
      <ProfileForm profile={profile} />
      <ProfileLinksManager
        key={links.map((link) => `${link.id}:${link.sortOrder}`).join(":")}
        initialLinks={links}
      />
    </div>
  );
}
