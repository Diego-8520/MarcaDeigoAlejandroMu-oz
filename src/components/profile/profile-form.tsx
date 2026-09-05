"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, uploadAvatar } from "@/actions/profile";
import type { ProfileActionState } from "@/actions/profile";
import type { Profile } from "@/lib/data/profile-queries";

const initialState: ProfileActionState = { status: "idle" };

const inputClassName =
  "mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal";

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [profileState, profileAction, isSaving] = useActionState(
    updateProfile,
    initialState,
  );
  const [avatarState, avatarAction, isUploading] = useActionState(
    uploadAvatar,
    initialState,
  );
  const [avatarPreview, setAvatarPreview] = useState(
    profile?.avatarUrl ?? null,
  );

  useEffect(() => {
    if (profileState.status === "success" || avatarState.status === "success") {
      router.refresh();
    }
  }, [avatarState.status, profileState.status, router]);

  function selectAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  }

  return (
    <div className="mt-8 max-w-2xl space-y-12">
      <form action={profileAction} className="space-y-5">
        <div>
          <label
            htmlFor="full_name"
            className="font-mono text-xs text-ink-muted"
          >
            nombre completo
          </label>
          <input
            id="full_name"
            name="full_name"
            required
            defaultValue={profile?.fullName ?? ""}
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="headline"
            className="font-mono text-xs text-ink-muted"
          >
            titular profesional
          </label>
          <input
            id="headline"
            name="headline"
            defaultValue={profile?.headline ?? ""}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="bio" className="font-mono text-xs text-ink-muted">
            biografía
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={7}
            defaultValue={profile?.bio ?? ""}
            className={inputClassName}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="font-mono text-xs text-ink-muted">
              email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={profile?.email ?? ""}
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="phone" className="font-mono text-xs text-ink-muted">
              teléfono
            </label>
            <input
              id="phone"
              name="phone"
              defaultValue={profile?.phone ?? ""}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="location"
              className="font-mono text-xs text-ink-muted"
            >
              ubicación
            </label>
            <input
              id="location"
              name="location"
              defaultValue={profile?.location ?? ""}
              className={inputClassName}
            />
          </div>
          <div>
            <label
              htmlFor="website"
              className="font-mono text-xs text-ink-muted"
            >
              sitio web
            </label>
            <input
              id="website"
              name="website"
              type="url"
              defaultValue={profile?.website ?? ""}
              placeholder="https://..."
              className={inputClassName}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex bg-ink px-4 py-2 font-mono text-sm text-paper transition-colors hover:bg-signal disabled:opacity-50"
        >
          {isSaving ? "guardando..." : "guardar perfil"}
        </button>
        {profileState.status !== "idle" && (
          <p
            className={`font-mono text-xs ${
              profileState.status === "success" ? "text-signal" : "text-red-600"
            }`}
          >
            {profileState.message}
          </p>
        )}
      </form>

      <section className="border-t border-line pt-8">
        <div>
          <p className="font-mono text-xs text-ink-muted">imagen de perfil</p>
          <h2 className="mt-2 font-display text-xl font-semibold text-ink">
            Avatar
          </h2>
        </div>
        <form action={avatarAction} className="mt-5 space-y-4">
          {avatarPreview && (
            <div className="relative h-32 w-32 overflow-hidden border border-line bg-white/40">
              <Image
                src={avatarPreview}
                alt="Previsualización del avatar"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}
          <div>
            <label
              htmlFor="avatar"
              className="font-mono text-xs text-ink-muted"
            >
              subir avatar
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={selectAvatar}
              className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none file:mr-4 file:border-0 file:bg-ink file:px-3 file:py-1.5 file:font-mono file:text-xs file:text-paper focus:border-signal"
            />
          </div>
          <button
            type="submit"
            disabled={isUploading}
            className="inline-flex border border-line px-4 py-2 font-mono text-sm text-ink transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
          >
            {isUploading ? "subiendo..." : "guardar avatar"}
          </button>
          {avatarState.status !== "idle" && (
            <p
              className={`font-mono text-xs ${
                avatarState.status === "success"
                  ? "text-signal"
                  : "text-red-600"
              }`}
            >
              {avatarState.message}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
