// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-amber-400 mb-6">Erona MVP</h1>

      <nav className="space-x-4 mb-8">
        <Link
          href="/routines"
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-blue-700 transition"
        >
          루틴 관리
        </Link>
        <Link
          href="/records/new"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          기록 추가
        </Link>
      </nav>

      <section>
        <p>
          앱처럼 부드러운 화면 전환과 Mock API 기반 CRUD 테스트를 시작해 보세요.
        </p>
      </section>
    </main>
  );
}
