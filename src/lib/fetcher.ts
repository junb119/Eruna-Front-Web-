export const API_BASE = "http://localhost:4000";

export const fetcher = (path: string) =>
  fetch(`${API_BASE}${path}`).then((res) => {
    if (!res.ok) {
      console.error("[FETCH ERROR]", res.status, res.statusText);
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  });

export const poster = async (url: string, { arg }: { arg: any }) => {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${res.status}: ${res.statusText}`
    );
  }
  return res.json();
};

export const deleter = async (url: string) => {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${res.status}: ${res.statusText}`
    );
  }

  // 204 No Content 응답은 body가 없으므로, 성공적으로 undefined를 반환합니다.
  if (res.status === 204) {
    return;
  }

  // 다른 성공 응답(e.g. 200 OK)의 경우, JSON을 파싱합니다.
  return res.json();
};
// c:\Users\Jun\Desktop\forJob\myPortfolio\Eruna\web_frontend\src\lib\fetcher.ts 에 추가

export const putter = async (url: string, { arg }: { arg: any }) => {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${res.status}: ${res.statusText}`
    );
  }
  return res.json();
};
