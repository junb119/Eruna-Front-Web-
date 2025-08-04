export const API_BASE = "http://localhost:4000";

export const fetcher = (path: string) =>
  fetch(`${API_BASE}${path}`).then((res) => {
    if (!res.ok) {
      console.error("[FETCH ERROR]", res.status, res.statusText);
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  });
// src/lib/fetcher.ts
// export const fetcher = (path: string) =>
//   fetch(`${API_BASE}${path}`).then((res) => {
//     if (!res.ok) {
//       console.error("[FETCH ERROR]", res.status, res.statusText);
//       throw new Error(`HTTP ${res.status}: ${res.statusText}`);
//     }
//     return res.json().then((data) => {
//       console.log("📦 FETCHER 응답 구조:", data); // ← 여기 반드시 찍기
//       return data;
//     });
//   });
