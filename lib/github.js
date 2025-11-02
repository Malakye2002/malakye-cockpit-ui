export async function getGithubStats() {
  // You can set either your org name or username here:
  const org = "Malakye2002-org";
  const usernameFallback = "Malakye2002";

  // Prefer org repos; fall back to user repos if org fetch fails
  const url = `https://api.github.com/orgs/${org}/repos`;
  const fallbackUrl = `https://api.github.com/users/${usernameFallback}/repos`;

  // Try org first, then fallback
  let repoRes = await fetch(url, {
    headers: {
      // ✅ Uses your real GitHub token from environment variables
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
    next: { revalidate: 60 },
  });

  if (!repoRes.ok) {
    console.warn(`Org fetch failed (${repoRes.status}), trying user repos...`);
    repoRes = await fetch(fallbackUrl, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      next: { revalidate: 60 },
    });
  }

  if (!repoRes.ok) {
    console.error("GitHub API error:", repoRes.status, repoRes.statusText);
    throw new Error("Failed to fetch GitHub data");
  }

  const repos = await repoRes.json();

  repos.sort(
    (a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
  );

  return {
    count: repos.length,
    latestRepo: repos[0]?.name || "None",
    latestPush: repos[0]?.pushed_at || null,
  };
}
