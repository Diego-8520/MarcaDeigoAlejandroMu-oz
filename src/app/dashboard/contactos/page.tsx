import Link from "next/link";
import { ContactsList } from "@/components/contacts/contacts-list";
import {
  CONTACT_STATUSES,
  getContactsAdmin,
} from "@/lib/data/contacts-queries";

export const dynamic = "force-dynamic";

export default async function ContactosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = CONTACT_STATUSES.includes(
    params.status as (typeof CONTACT_STATUSES)[number],
  )
    ? params.status
    : undefined;
  const contacts = await getContactsAdmin(status);

  return (
    <div>
      <p className="font-mono text-xs text-ink-muted">dashboard / contactos</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Contactos / Leads
      </h1>
      <p className="mt-2 font-body text-sm text-ink-muted">
        Seguimiento de las conversaciones recibidas desde el sitio.
      </p>
      <nav
        className="mt-8 flex flex-wrap gap-2 border-b border-line pb-4 font-mono text-xs"
        aria-label="Filtrar contactos"
      >
        <Link
          href="/dashboard/contactos"
          className={
            !status
              ? "bg-ink px-3 py-1.5 text-paper"
              : "px-3 py-1.5 text-ink-muted hover:text-signal"
          }
        >
          todos
        </Link>
        {CONTACT_STATUSES.map((item) => (
          <Link
            key={item}
            href={`/dashboard/contactos?status=${item}`}
            className={
              status === item
                ? "bg-ink px-3 py-1.5 text-paper"
                : "px-3 py-1.5 text-ink-muted hover:text-signal"
            }
          >
            {item}
          </Link>
        ))}
      </nav>
      <ContactsList
        key={`${status ?? "todos"}:${contacts.map((contact) => contact.id).join(":")}`}
        initialContacts={contacts}
      />
    </div>
  );
}
