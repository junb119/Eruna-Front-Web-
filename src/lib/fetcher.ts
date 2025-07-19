export const API_BASE = "http://localhost:4000";

export const fetcher = (path: string) =>
  fetch(`${API_BASE}${path}`).then((res) => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  });
