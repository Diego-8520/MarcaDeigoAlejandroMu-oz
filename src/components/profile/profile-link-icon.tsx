import {
  BriefcaseBusiness,
  Code2,
  Globe2,
  Link2,
  Mail,
  type LucideProps,
} from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

type ProfileIcon = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
>;

const PROFILE_ICONS: Record<string, ProfileIcon> = {
  Github: Code2,
  Linkedin: BriefcaseBusiness,
  Globe: Globe2,
  Mail,
  Link2,
};

export const PROFILE_ICON_OPTIONS = [
  { value: "Github", label: "GitHub" },
  { value: "Linkedin", label: "LinkedIn" },
  { value: "Globe", label: "Web" },
  { value: "Mail", label: "Email" },
  { value: "Link2", label: "Enlace" },
] as const;

export function ProfileLinkIcon({
  name,
  ...props
}: { name?: string | null } & Omit<LucideProps, "name">) {
  const Icon = (name && PROFILE_ICONS[name]) || Link2;
  return <Icon aria-hidden="true" {...props} />;
}
