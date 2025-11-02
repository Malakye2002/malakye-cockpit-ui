export const dynamic = "force-dynamic";

export const metadata = {
  title: "GitHub Repositories",
};

async function getRepos() {
  const res = await fetch("https://api.github.com/users/Malakye2002/repos", {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch repos");
  }
  return res.json();
}

export default async function GitHubPage() {
  const repos = await getRepos();
  return (
    <main style={{ padding: "2rem" }}>
      <h1>GitHub Repositories</h1>
      <ul>
        {repos.map((repo) => (
          <li key={repo.id}>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              {repo.name}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
