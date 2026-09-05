"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createProfileLink,
  deleteProfileLink,
  reorderProfileLinks,
  updateProfileLink,
} from "@/actions/profile-links";
import type { ProfileActionState } from "@/actions/profile";
import type { ProfileLink } from "@/lib/data/profile-queries";
import {
  PROFILE_ICON_OPTIONS,
  ProfileLinkIcon,
} from "@/components/profile/profile-link-icon";

const initialState: ProfileActionState = { status: "idle" };
const inputClassName =
  "mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal";

function IconSelect({ defaultValue }: { defaultValue?: string | null }) {
  return (
    <select
      name="icon"
      defaultValue={defaultValue ?? "Link2"}
      className={inputClassName}
    >
      {PROFILE_ICON_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function LinkRow({ link }: { link: ProfileLink }) {
  const router = useRouter();
  const action = updateProfileLink.bind(null, link.id);
  const [state, formAction, isSaving] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <form action={formAction} className="border border-line p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <ProfileLinkIcon name={link.icon} size={16} className="text-signal" />
          <p className="truncate font-mono text-xs text-ink-muted">
            {link.label}
          </p>
        </div>
        <input type="hidden" name="sort_order" value={link.sortOrder} />
        <button
          type="submit"
          disabled={isSaving}
          className="font-mono text-xs text-signal hover:underline disabled:opacity-50"
        >
          {isSaving ? "guardando..." : "guardar"}
        </button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1.5fr_140px]">
        <div>
          <label
            htmlFor={`label-${link.id}`}
            className="font-mono text-xs text-ink-muted"
          >
            etiqueta
          </label>
          <input
            id={`label-${link.id}`}
            name="label"
            defaultValue={link.label}
            className={inputClassName}
          />
        </div>
        <div>
          <label
            htmlFor={`url-${link.id}`}
            className="font-mono text-xs text-ink-muted"
          >
            url
          </label>
          <input
            id={`url-${link.id}`}
            name="url"
            type="url"
            defaultValue={link.url}
            className={inputClassName}
          />
        </div>
        <div>
          <label
            htmlFor={`icon-${link.id}`}
            className="font-mono text-xs text-ink-muted"
          >
            icono
          </label>
          <IconSelect defaultValue={link.icon} />
        </div>
      </div>
      {state.status !== "idle" && (
        <p
          className={`mt-3 font-mono text-xs ${state.status === "success" ? "text-signal" : "text-red-600"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

export function ProfileLinksManager({
  initialLinks,
}: {
  initialLinks: ProfileLink[];
}) {
  const router = useRouter();
  const [links, setLinks] = useState(initialLinks);
  const [state, formAction, isCreating] = useActionState(
    createProfileLink,
    initialState,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  function moveLink(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const nextLinks = [...links];
    [nextLinks[index], nextLinks[targetIndex]] = [
      nextLinks[targetIndex],
      nextLinks[index],
    ];
    setLinks(nextLinks);
    startTransition(async () => {
      const result = await reorderProfileLinks(
        nextLinks.map((link) => link.id),
      );
      setMessage(result.message ?? null);
      router.refresh();
    });
  }

  function removeLink(id: string) {
    if (!window.confirm("¿Eliminar este enlace?")) return;
    startTransition(async () => {
      const result = await deleteProfileLink(id);
      setMessage(result.message ?? null);
      if (result.status === "success")
        setLinks((current) => current.filter((link) => link.id !== id));
      router.refresh();
    });
  }

  return (
    <section className="mt-12 border-t border-line pt-8">
      <div>
        <p className="font-mono text-xs text-ink-muted">enlaces del perfil</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-ink">
          Redes y enlaces
        </h2>
      </div>

      <div className="mt-6 space-y-4">
        {links.map((link, index) => (
          <div key={link.id}>
            <LinkRow link={link} />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => moveLink(index, -1)}
                disabled={index === 0 || isPending}
                className="border border-line px-3 py-1.5 font-mono text-xs text-ink hover:border-signal hover:text-signal disabled:opacity-40"
              >
                subir
              </button>
              <button
                type="button"
                onClick={() => moveLink(index, 1)}
                disabled={index === links.length - 1 || isPending}
                className="border border-line px-3 py-1.5 font-mono text-xs text-ink hover:border-signal hover:text-signal disabled:opacity-40"
              >
                bajar
              </button>
              <button
                type="button"
                onClick={() => removeLink(link.id)}
                disabled={isPending}
                className="border border-red-300 px-3 py-1.5 font-mono text-xs text-red-600 hover:border-red-600 disabled:opacity-40"
              >
                eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <form action={formAction} className="mt-8 border border-line p-4">
        <p className="font-mono text-xs text-ink-muted">añadir enlace</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1.5fr_140px]">
          <div>
            <label
              htmlFor="new-label"
              className="font-mono text-xs text-ink-muted"
            >
              etiqueta
            </label>
            <input
              id="new-label"
              name="label"
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor="new-url"
              className="font-mono text-xs text-ink-muted"
            >
              url
            </label>
            <input
              id="new-url"
              name="url"
              type="url"
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor="new-icon"
              className="font-mono text-xs text-ink-muted"
            >
              icono
            </label>
            <IconSelect defaultValue="Link2" />
          </div>
        </div>
        <input type="hidden" name="sort_order" value={links.length} />
        <button
          type="submit"
          disabled={isCreating}
          className="mt-4 inline-flex bg-ink px-4 py-2 font-mono text-sm text-paper hover:bg-signal disabled:opacity-50"
        >
          {isCreating ? "añadiendo..." : "añadir enlace"}
        </button>
        {state.status !== "idle" && (
          <p
            className={`mt-3 font-mono text-xs ${state.status === "success" ? "text-signal" : "text-red-600"}`}
          >
            {state.message}
          </p>
        )}
      </form>

      {links.length === 0 && (
        <p className="mt-6 font-body text-sm text-ink-muted">
          Todavía no hay enlaces.
        </p>
      )}
      {message && (
        <p className="mt-4 font-mono text-xs text-ink-muted">{message}</p>
      )}
    </section>
  );
}
