export async function getGithubStats() {
  const user = "Malakye2002";
  const org = "Malakye2002-org";

  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  };

  const allRepos = [];

  // 1️⃣ Fetch user repos
  const userRes = await fetch(`https://api.github.com/users/${user}/repos`, {
    headers,
    cache: "no-store",
  });
  if (userRes.ok) {
    const repos = await userRes.json();
    allRepos.push(...repos);
  }

  // 2️⃣ Fetch org repos
  const orgRes = await fetch(`https://api.github.com/orgs/${org}/repos`, {
    headers,
    cache: "no-store",
  });
  if (orgRes.ok) {
    const repos = await orgRes.json();
    allRepos.push(...repos);
  }

  // 3️⃣ Sort and summarize
  allRepos.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

  return {
    count: allRepos.length,
    latestRepo: allRepos[0]?.name || "None",
    latestPush: allRepos[0]?.pushed_at || "N/A",
    repos: allRepos.map((r) => r.name),
  };
}
