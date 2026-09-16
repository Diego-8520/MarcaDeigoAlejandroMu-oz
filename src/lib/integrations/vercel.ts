const VERCEL_API = "https://api.vercel.com";

type VercelProject = {
  id: string;
  name: string;
  framework: string | null;
  link?: {
    type?: string;
    org?: string;
    repo?: string;
    repoId?: string;
    productionBranch?: string;
  };
  targets?: {
    production?: {
      id?: string;
      url?: string;
      readyState?: string;
      createdAt?: number;
    };
  };
};

type VercelDeployment = {
  uid: string;
  name: string;
  url: string | null;
  state: string | null;
  created: number;
  meta?: {
    githubCommitSha?: string;
    githubCommitRef?: string;
    githubRepo?: string;
    githubOrg?: string;
  };
};

function headers() {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) throw new Error("VERCEL_API_TOKEN no está configurada.");
  return { Authorization: `Bearer ${token}` };
}

async function vercelFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${VERCEL_API}${path}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(`Vercel respondió con estado ${response.status}.`);
  return (await response.json()) as T;
}

export async function getVercelResources() {
  const team = process.env.VERCEL_TEAM_ID;
  const teamQuery = team ? `&teamId=${encodeURIComponent(team)}` : "";
  const projects: VercelProject[] = [];
  let next: string | undefined;

  do {
    const cursor = next ? `&until=${encodeURIComponent(next)}` : "";
    const page = await vercelFetch<{
      projects: VercelProject[];
      pagination?: { next?: string };
    }>(`/v9/projects?limit=100${teamQuery}${cursor}`);
    projects.push(...page.projects);
    next = page.pagination?.next;
  } while (next);

  const resources = [];
  for (const project of projects) {
    const deploymentQuery = team ? `&teamId=${encodeURIComponent(team)}` : "";
    const deployments = await vercelFetch<{ deployments: VercelDeployment[] }>(
      `/v6/deployments?projectId=${encodeURIComponent(project.id)}&limit=1${deploymentQuery}`,
    );
    const deployment = deployments.deployments[0] ?? null;
    resources.push({ project, deployment });
  }

  return resources;
}
