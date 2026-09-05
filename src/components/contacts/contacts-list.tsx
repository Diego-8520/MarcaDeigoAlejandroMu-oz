"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateContactNotes, updateContactStatus } from "@/actions/contacts";
import { CONTACT_STATUSES } from "@/lib/data/contacts-queries";
import type { Contact } from "@/lib/data/contacts-queries";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ContactsList({
  initialContacts,
}: {
  initialContacts: Contact[];
}) {
  const router = useRouter();
  const [contacts, setContacts] = useState(initialContacts);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function changeStatus(id: string, status: string) {
    startTransition(async () => {
      const result = await updateContactStatus(id, status);
      setMessage(result.message);
      if (result.status === "success")
        setContacts((current) =>
          current.map((contact) =>
            contact.id === id ? { ...contact, status } : contact,
          ),
        );
      router.refresh();
    });
  }

  function saveNotes(id: string, notes: string) {
    startTransition(async () => {
      const result = await updateContactNotes(id, notes);
      setMessage(result.message);
      if (result.status === "success")
        setContacts((current) =>
          current.map((contact) =>
            contact.id === id
              ? { ...contact, notes: notes.trim() || null }
              : contact,
          ),
        );
    });
  }

  if (contacts.length === 0)
    return (
      <p className="mt-8 font-body text-sm text-ink-muted">
        No hay contactos para este filtro.
      </p>
    );
  return (
    <div className="mt-8 space-y-5">
      {contacts.map((contact) => (
        <article key={contact.id} className="border border-line p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">
                {contact.name}
              </h2>
              <a
                href={`mailto:${contact.email}`}
                className="mt-1 block font-mono text-xs text-signal hover:underline"
              >
                {contact.email}
              </a>
              {contact.company && (
                <p className="mt-1 font-mono text-xs text-ink-muted">
                  {contact.company}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-mono text-[11px] text-ink-muted">
                {formatDate(contact.createdAt)}
              </p>
              <select
                value={contact.status}
                onChange={(event) =>
                  changeStatus(contact.id, event.target.value)
                }
                disabled={isPending}
                className="mt-2 border border-line bg-transparent px-2 py-1 font-mono text-xs text-ink outline-none focus:border-signal"
              >
                {CONTACT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-4 font-mono text-xs text-signal">
            {contact.requestType}
          </p>
          <details className="mt-4 border-t border-line pt-4">
            <summary className="cursor-pointer font-mono text-xs text-ink-muted">
              ver mensaje
            </summary>
            <p className="mt-3 whitespace-pre-line font-body text-sm leading-relaxed text-ink-muted">
              {contact.message}
            </p>
          </details>
          <div className="mt-4 border-t border-line pt-4">
            <label
              htmlFor={`notes-${contact.id}`}
              className="font-mono text-xs text-ink-muted"
            >
              notas internas
            </label>
            <textarea
              id={`notes-${contact.id}`}
              defaultValue={contact.notes ?? ""}
              rows={3}
              className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
            />
            <button
              type="button"
              onClick={(event) => {
                const textarea = event.currentTarget.previousElementSibling;
                if (textarea instanceof HTMLTextAreaElement)
                  saveNotes(contact.id, textarea.value);
              }}
              disabled={isPending}
              className="mt-2 border border-line px-3 py-1.5 font-mono text-xs text-ink hover:border-signal hover:text-signal disabled:opacity-40"
            >
              guardar nota
            </button>
          </div>
        </article>
      ))}
      {message && <p className="font-mono text-xs text-ink-muted">{message}</p>}
    </div>
  );
}
