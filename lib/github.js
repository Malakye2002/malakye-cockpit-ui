// lib/github.js
export async function getGithubStats() {
  const username = "Malakye2002";

  // Fetch the user's public repos
  const repoRes = await fetch(`https://api.github.com/users/${username}/repos`, {
    next: { revalidate: 60 }, // Cache for 60 seconds on Vercel Edge
  });

  if (!repoRes.ok) {
    throw new Error("Failed to fetch GitHub data");
  }

  const repos = await repoRes.json();

  // Sort by most recent push
  repos.sort(
    (a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
  );

  return {
    count: repos.length,
    latestRepo: repos[0]?.name,
    latestPush: repos[0]?.pushed_at,
  };
}
