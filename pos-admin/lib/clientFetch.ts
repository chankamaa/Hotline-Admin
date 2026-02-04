export async function clientFetch(input: RequestInfo, init?: RequestInit) {
  let res = await fetch(input, init);

  if (res.status !== 401) return res;

  // try refresh once
  const refresh = await fetch("/api/auth/refresh", { method: "POST" });
  if (!refresh.ok) return res;

  // retry original call
  res = await fetch(input, init);
  return res;
}
