export async function getGithubStats() {
  const org = "Malakye2002-org";
  const user = "Malakye2002";

  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  };

  // Try org repos first
  const orgRes = await fetch(`https://api.github.com/orgs/${org}/repos`, {
    headers,
    next: { revalidate: 60 },
  });

  if (orgRes.ok) {
    const repos = await orgRes.json();
    repos.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
    return {
      count: repos.length,
      latestRepo: repos[0]?.name,
      latestPush: repos[0]?.pushed_at,
    };
  }

  console.warn("Org fetch failed, trying user repos...");

  // Fallback: user repos
  const userRes = await fetch(`https://api.github.com/users/${user}/repos`, {
    headers,
    next: { revalidate: 60 },
  });

  if (!userRes.ok) {
    console.error("GitHub API error:", userRes.status, userRes.statusText);
    return {
      count: 0,
      latestRepo: "N/A",
      latestPush: "N/A",
    };
  }

  const repos = await userRes.json();
  repos.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

  return {
    count: repos.length,
    latestRepo: repos[0]?.name,
    latestPush: repos[0]?.pushed_at,
  };
}
