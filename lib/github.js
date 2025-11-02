export async function getGithubStats() {
  const username = "Malakye2002";

  const repoRes = await fetch(`https://api.github.com/users/${username}/repos`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      Accept: "application/vnd.github+json",
    },
    next: { revalidate: 60 },
  });

  if (!repoRes.ok) {
    const errorText = await repoRes.text();
    console.error("GitHub API error:", repoRes.status, errorText);
    throw new Error("Failed to fetch GitHub data");
  }

  const repos = await repoRes.json();
  repos.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

  return {
    count: repos.length,
    latestRepo: repos[0]?.name,
    latestPush: repos[0]?.pushed_at,
  };
}
