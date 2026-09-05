import { createCertification } from "@/actions/certifications";
import { createEducation } from "@/actions/education";
import { CertificationForm } from "@/components/education/certification-form";
import { CertificationList } from "@/components/education/certification-list";
import { EducationForm } from "@/components/education/education-form";
import { EducationList } from "@/components/education/education-list";
import {
  getCertificationsAdmin,
  getEducationAdmin,
} from "@/lib/data/education-queries";

export const dynamic = "force-dynamic";

export default async function EducacionPage() {
  const [education, certifications] = await Promise.all([
    getEducationAdmin(),
    getCertificationsAdmin(),
  ]);
  return (
    <div>
      <p className="font-mono text-xs text-ink-muted">dashboard / educación</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Educación
      </h1>
      <section className="mt-10 border-t border-line pt-8">
        <h2 className="font-display text-xl font-semibold text-ink">
          Formación académica
        </h2>
        <EducationForm
          action={createEducation}
          submitLabel="añadir formación"
        />
        <EducationList
          key={education.map((item) => item.id).join(":")}
          initialEducation={education}
        />
      </section>
      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-display text-xl font-semibold text-ink">
          Certificaciones
        </h2>
        <CertificationForm
          action={createCertification}
          submitLabel="añadir certificación"
        />
        <CertificationList
          key={certifications.map((item) => item.id).join(":")}
          initialCertifications={certifications}
        />
      </section>
    </div>
  );
}
