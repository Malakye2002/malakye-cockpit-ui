// app/github/page.js
import { getGithubStats } from "../../lib/github";

async function getRepos() {
  const username = "Malakye2002"; // pulls your real repos
  const res = await fetch(`https://api.github.com/users/${username}/repos`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch repositories");
  }

  return res.json();
}

export default async function GithubPage() {
  const repos = await getRepos();
  const github = await getGithubStats();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">GitHub Repositories</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm"
          >
            <h2 className="font-medium text-lg mb-1">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {repo.name}
              </a>
            </h2>
            <p className="text-sm text-slate-500 mb-2">{repo.description}</p>
            <div className="text-xs text-slate-600 flex justify-between">
              <span>⭐ {repo.stargazers_count} stars</span>
              <span>
                Last push: {new Date(repo.pushed_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-sm text-slate-500">
        Total repositories: {github.count}
      </div>
    </div>
  );
}
