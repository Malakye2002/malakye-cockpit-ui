export async function getGithubStats() {
  const username = "Malakye2002";

  let headers = {};
  if (process.env.GITHUB_TOKEN) {
    headers = {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    };
  }

  const res = await fetch(`https://api.github.com/users/${username}/repos`, {
    headers: headers,
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.error("GitHub data fetch failed:", res.status, res.statusText);
    return {
      count: 0,
      latestRepo: null,
      latestPush: null,
    };
  }

  const repos = await res.json();
  repos.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

  return {
    count: repos.length,
    latestRepo: repos[0]?.name,
    latestPush: repos[0]?.pushed_at,
  };
}
