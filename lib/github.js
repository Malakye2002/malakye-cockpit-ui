export async function getGithubStats() {
  const org = "Malakye2002-org"; // 👈 your org name

  const repoRes = await fetch(`https://api.github.com/orgs/${org}/repos`, {
    next: { revalidate: 60 },
  });

  if (!repoRes.ok) {
    throw new Error("Failed to fetch GitHub data");
  }

  const repos = await repoRes.json();

  repos.sort(
    (a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
  );

  return {
    count: repos.length,
    latestRepo: repos[0]?.name,
    latestPush: repos[0]?.pushed_at,
  };
}
