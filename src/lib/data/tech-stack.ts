import packageJson from "../../../package.json";

export type TechStackItem = {
  packageName: string;
  name: string;
  version: string;
};

const DISPLAY_NAMES: Record<string, string> = {
  next: "Next.js",
  react: "React",
  typescript: "TypeScript",
  tailwindcss: "Tailwind CSS",
  "@supabase/supabase-js": "Supabase",
  zod: "Zod",
  "framer-motion": "Framer Motion",
};

const CURATED_PACKAGES = [
  "next",
  "react",
  "typescript",
  "tailwindcss",
  "@supabase/supabase-js",
  "zod",
  "framer-motion",
] as const;

function cleanVersion(version: string) {
  return version.replace(/^[~^]/, "");
}

export function readTechStack(): TechStackItem[] {
  const dependencies = packageJson.dependencies as Record<string, string>;
  const devDependencies = packageJson.devDependencies as Record<string, string>;

  return CURATED_PACKAGES.flatMap((packageName) => {
    const version = dependencies[packageName] ?? devDependencies[packageName];
    if (!version) return [];

    return [
      {
        packageName,
        name: DISPLAY_NAMES[packageName],
        version: cleanVersion(version),
      },
    ];
  });
}
