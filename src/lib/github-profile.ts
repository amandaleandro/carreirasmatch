const GITHUB_API_URL = "https://api.github.com";
const MAX_REPOS = 30;
const REQUEST_TIMEOUT_MS = 10000;

// Nome de usuário do GitHub: alfanumérico e hífen, até 39 caracteres, sem
// hífen no começo/fim e sem hífens consecutivos.
const USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export class GithubProfileError extends Error {}

type GithubUser = {
  login: string;
  name?: string | null;
  bio?: string | null;
  company?: string | null;
  location?: string | null;
  public_repos: number;
  followers: number;
};

type GithubRepo = {
  name: string;
  description?: string | null;
  language?: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  pushed_at?: string | null;
};

/**
 * Aceita tanto o link do perfil (`https://github.com/octocat`, com ou sem
 * `www`/barra final/caminho extra) quanto o nome de usuário puro.
 */
export function parseGithubUsername(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const candidate = trimmed.includes("/") ? extractFromUrl(trimmed) : trimmed;
  if (!candidate) return null;

  return USERNAME_PATTERN.test(candidate) ? candidate : null;
}

function extractFromUrl(raw: string): string | null {
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== "github.com") return null;

  return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
}

// Sem token são 60 requisições/hora por IP — compartilhadas por todos os
// usuários do servidor. Com um token de leitura pública sobe para 5.000/h.
function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
}

async function fetchFromGithub<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${GITHUB_API_URL}${path}`, {
      headers: githubHeaders(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new GithubProfileError(
      "Não foi possível falar com o GitHub agora. Tente de novo em instantes."
    );
  }

  if (response.status === 404) {
    throw new GithubProfileError(
      "Perfil não encontrado no GitHub. Confira o link e se o perfil é público."
    );
  }

  if (response.status === 403 || response.status === 429) {
    throw new GithubProfileError(
      "O limite de consultas ao GitHub foi atingido. Tente de novo em alguns minutos ou cole o conteúdo dos repositórios manualmente."
    );
  }

  if (!response.ok) {
    throw new GithubProfileError(
      `O GitHub retornou um erro (${response.status}). Tente de novo em instantes.`
    );
  }

  return response.json() as Promise<T>;
}

function formatRepo(repo: GithubRepo): string {
  const details = [
    repo.language && `linguagem: ${repo.language}`,
    `${repo.stargazers_count} estrelas`,
    `${repo.forks_count} forks`,
    repo.topics?.length && `tópicos: ${repo.topics.join(", ")}`,
    repo.pushed_at && `último commit: ${repo.pushed_at.slice(0, 10)}`,
    repo.archived && "arquivado",
  ].filter(Boolean);

  return [
    `- ${repo.name}: ${repo.description ?? "(sem descrição)"}`,
    `  (${details.join(" | ")})`,
  ].join("\n");
}

/**
 * Monta, a partir da API pública do GitHub, o mesmo tipo de texto que o
 * usuário colaria à mão — para ser entregue a `analyzeGithub`.
 */
export async function fetchGithubProfileText(username: string): Promise<string> {
  const user = await fetchFromGithub<GithubUser>(`/users/${username}`);
  const repos = await fetchFromGithub<GithubRepo[]>(
    `/users/${username}/repos?sort=pushed&per_page=100`
  );

  const ownRepos = repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, MAX_REPOS);

  const profileLines = [
    `PERFIL: ${user.name ?? user.login} (@${user.login})`,
    `Bio: ${user.bio ?? "(vazia)"}`,
    user.company && `Empresa: ${user.company}`,
    user.location && `Local: ${user.location}`,
    `Repositórios públicos: ${user.public_repos} | Seguidores: ${user.followers}`,
  ].filter(Boolean);

  const reposSection =
    ownRepos.length > 0
      ? `REPOSITÓRIOS PRÓPRIOS (${ownRepos.length} de ${repos.length}, os de mais destaque primeiro; forks omitidos):\n${ownRepos
          .map(formatRepo)
          .join("\n")}`
      : "REPOSITÓRIOS PRÓPRIOS: nenhum repositório público que não seja fork.";

  return `${profileLines.join("\n")}\n\n${reposSection}`;
}
