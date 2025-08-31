# 이러나(Erona) — 시스템 설계·구조·진행 요약서

*최신 기준: 2025-08-28 (KST)*

> 목적: **AI 코파일럿/신규 합류자**가 프로젝트를 **5분 안에 맥락 파악**하고,
> 로컬 실행·디버깅·확장까지 바로 이어갈 수 있게 하는 실전 안내서.

---

## 0) TL;DR

* **서비스**: 모바일 우선 웹 운동 기록(루틴·기록·히스토리·사진). 이후 **앱/워치 확장** 고려.
* **게스트 우선**: 로그인 없이 전 기능 사용 가능.

  * 비로그인: **로컬 저장소(localStorage/IndexedDB)** 기반.
  * 로그인: **DB 영구 저장(포스트그레SQL)**.
* **핵심 스택**

  * FE: Next.js(App Router) + TypeScript + Tailwind + SWR + Zustand
  * BE: Node.js + **Express 5.1.0** + PostgreSQL(**raw SQL/pg**) + JWT
  * Infra: AWS (RDS/S3/EC2/CloudFront or Amplify), GitHub Actions
* **프론트 UX 핵심**: App Router **Parallel Routes**로 \*\*오버레이(패널)\*\*만 교체 → 폼 깜빡임 최소화.
* **개발 메모**: Mock 단계는 `json-server@0.17.x` 추천(일부 버전의 `_expand/_embed` 결함 회피).

---

## 1) 제품 개요 & 철학

* **문제의식**: 기존 운동앱의 복잡한 UI/반복 UX/시각화 부족.
* **기획 방향**: “내가 매일 쓰는” 빠른 기록·루틴 관리·시각화 중심.
* **확장성**: 웹→React Native(Expo)·워치앱. **API 공용 설계**로 전개 비용 축소.
* **실무 흐름 체험**: 기획→ERD→백엔드→프론트→테스트→CI/CD→배포까지 **엔드투엔드**.

---

## 2) 아키텍처 한눈에 보기

```
[Client] Next.js(App Router, SWR, Zustand)
   ├─ 선택 인증 호출(Bearer JWT) 또는 게스트 모드(guest_id + 로컬저장)
   └─ Overlay(Parallel Routes) 기반 부분 전환 UX

[API] Express 5.1.x (Node.js)
   ├─ Auth: /api/users, /api/login (JWT)
   ├─ Core: /api/workouts, /api/routines, /api/records ...
   ├─ optionalAuthMiddleware (게스트/로그인 공존)
   └─ pg (raw SQL) → PostgreSQL

[Storage]
   ├─ PostgreSQL (AWS RDS)
   ├─ Images: AWS S3 (multer-s3)
   └─ 로컬 모드: localStorage/IndexedDB (게스트용)

[Delivery]
   ├─ FE: Amplify 또는 S3+CloudFront
   └─ BE: EC2+Docker (+GitHub Actions)
```

---

## 3) 데이터 모델(ERD) 개요

> 상세 DDL은 저장소의 **`/docs/ErunaERD.sql`** 또는 제공된 `ErunaERD.sql` 파일 참조.

### 3.1 주요 테이블

* **users**: id(uuid), email(unique), password\_hash, created\_at …
* **workout\_category**: id, name, order …
* **workout\_type**: id, name …
* **workout**: id, name, category\_id(FK), type\_id(FK), default\_unit(kg/reps/time) …
* **routine**: id, user\_id(FK nullable; 게스트는 null), name, note …
* **routine\_item**: id, routine\_id(FK), workout\_id(FK), sets, reps, weight, order …
* **record**: id, user\_id(FK nullable), date, note …
* **record\_item**: id, record\_id(FK), workout\_id(FK), set\_no, reps, weight, time …
* **favorite**: id, user\_id(FK), workout\_id(FK), created\_at …
* **user\_settings**: id, user\_id(FK), unit\_preference(kg/lb), theme, …
* (이미지) **photo**: id, user\_id(FK), url(s3), taken\_at, memo …

### 3.2 관계 하이라이트

* `workout.category_id → workout_category.id` (N:1)
* `workout.type_id → workout_type.id` (N:1)
* `routine_item.routine_id → routine.id` (N:1)
* `routine_item.workout_id → workout.id` (N:1)
* `record_item.record_id → record.id` (N:1)
* `record_item.workout_id → workout.id` (N:1)

> 삭제 정책은 실제 서비스 기준 **CASCADE/RESTRICT** 혼합. 예: 루틴 삭제 시 `routine_item`은 CASCADE 권장.

---

## 4) 인증·권한 설계

* **로그인 사용자**

  * 로그인 → **JWT** 발급 → Authorization 헤더로 호출
  * 서버에서 `req.user.id`를 근거로 소유 리소스 접근/수정 권한 검증
* **게스트**

  * 클라이언트 최초 진입 시 **guest\_id** 생성(예: uuid v4) → 로컬에 저장
  * API 호출 시 `x-guest-id` 헤더로 전송(서버는 **optionalAuth**로 분기)
  * 서버 DB에 저장하지 않고 **읽기 전용 데이터** 또는 **에코용 스키마**로 대응
    (프론트에서는 로컬 DB(localStorage/IndexedDB) 동기화)

> 포인트: **같은 UX** 제공 + **동기화 범위의 차이**만 둬서 로그인 유도(다른 기기 연동 필요 시).

---

## 5) 백엔드 (Express 5.1.0 + pg)

### 5.1 폴더 스케치

```
backend/
  src/
    index.ts            # 서버부팅, 미들웨어(helmet/cors/json) 등록
    db.ts               # pg Pool 연결
    middlewares/
      authRequired.ts
      authOptional.ts
    modules/
      auth/             # signup/login
      workouts/         # CRUD
      routines/         # CRUD + routine_items
      records/          # CRUD + record_items
      upload/           # multer-s3 (이미지)
    utils/
      jwt.ts            # sign/verify
      errors.ts         # 에러 핸들링
```

### 5.2 개발 스크립트 & .env 예시

```bash
# 1) 의존성
npm i express pg dotenv helmet cors jsonwebtoken bcrypt
npm i -D nodemon typescript ts-node @types/node @types/express

# 2) 개발 실행
npm run dev
# └─ nodemon이 src/index.ts를 감시하여 재시작

# 3) 프로덕션 빌드
npm run build && npm start
```

```ini
# .env
PORT=4001
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME
JWT_SECRET=super-secret-key
S3_BUCKET=erona-prod
S3_REGION=ap-northeast-2
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

### 5.3 미들웨어 개념

* `authRequired`: JWT 없으면 401
* `authOptional`: JWT 있으면 `req.user` 채우고, 없으면 게스트로 통과
  → **게스트·로그인 공존 엔드포인트**에서 사용

### 5.4 대표 엔드포인트 표

| 영역          | 메서드/경로                               | 인증  | 설명                   |
| ----------- | ------------------------------------ | --- | -------------------- |
| Auth        | `POST /api/users`                    | 불필요 | 회원가입(중복체크→bcrypt→저장) |
| Auth        | `POST /api/login`                    | 불필요 | 로그인(JWT 발급)          |
| Workout     | `GET /api/workouts`                  | 선택  | 목록(카테고리/타입 조인)       |
| Workout     | `POST /api/workouts`                 | 선택  | 생성                   |
| Workout     | `PATCH /api/workouts/:id`            | 선택  | 수정                   |
| Workout     | `DELETE /api/workouts/:id`           | 선택  | 삭제                   |
| Routine     | `GET /api/routines`                  | 선택  | 내 루틴 목록              |
| Routine     | `POST /api/routines`                 | 선택  | 생성(게스트 허용)           |
| Routine     | `GET /api/routines/:id`              | 선택  | 상세                   |
| Routine     | `PATCH /api/routines/:id`            | 선택  | 수정                   |
| Routine     | `DELETE /api/routines/:id`           | 선택  | 삭제(+items 처리)        |
| RoutineItem | `POST /api/routine-items/:routineId` | 선택  | 추가                   |
| RoutineItem | `PATCH /api/routine-items/:id`       | 선택  | 수정                   |
| RoutineItem | `DELETE /api/routine-items/:id`      | 선택  | 삭제                   |
| Record      | `GET /api/records?date=YYYY-MM-DD`   | 선택  | 날짜별 조회               |
| Record      | `POST /api/records`                  | 선택  | 저장(게스트 허용)           |
| Record      | `PATCH /api/records/:id`             | 선택  | 수정                   |
| Record      | `DELETE /api/records/:id`            | 선택  | 삭제                   |
| Upload      | `POST /api/photos`                   | 필요  | S3 업로드(multer-s3)    |

> 권장: 소유자 검증(로그인 시), 게스트는 헤더의 `x-guest-id`와 로컬데이터 동기 정책 사용.

---

## 6) 프론트엔드 (Next.js App Router)

### 6.1 폴더 스케치

```
frontend/
  app/
    layout.tsx
    page.tsx
    add-routine/
      layout.tsx            # ({ children, overlay }) 병렬 라우트
      page.tsx              # 메인 폼(고정)
      @overlay/
        default.tsx
        select/page.tsx     # 운동 선택(리스트/검색/필터)
        setup/[workoutId]/page.tsx  # 운동 세부 설정(세트/횟수/중량)
    workouts/
      page.tsx              # 목록
      [id]/page.tsx         # 상세
  components/
    AnimatedWrapper.tsx     # 페이지 전환 모션(오버레이 경로 제외)
    AddRoutineForm.tsx
    SelectedWorkout.tsx
  hooks/
    workout/
      useGetWorkoutList.ts  # SWR 훅
      useGetWorkout.ts      # 의존형 SWR (id 기반)
  store/
    routineDraft.ts         # Zustand: 루틴 초안(오버레이 왕복에도 유지)
  lib/
    fetcher.ts              # SWR fetcher
  styles/
    globals.css
```

### 6.2 핵심 UX 패턴: Parallel Routes 오버레이

* 메인 폼은 **고정**, 오른쪽 **오버레이 패널만 교체**
  → 폼 깜빡임/리셋 방지, **Zustand**로 초안 상태 유지
* 경로 예

  * `/add-routine` → `/add-routine/select` → `/add-routine/setup/[workoutId]`

### 6.3 데이터 패칭 전략

* **SWR** 기본 + **의존형 SWR**(A 결과로 B 요청)
* json-server를 쓴다면 `_expand/_embed` 의존 대신 **FK로 병렬 fetch** 후 합치기(버전 의존성 제거)

### 6.4 상태관리

* 전역 최소화, **폼 초안/선택 리스트**만 Zustand 보관
* 서버 데이터는 **SWR 캐시**가 단일 진실원(Single Source of Truth)

---

## 7) 로컬 개발 가이드

### 7.1 프론트 실행

```bash
# 1) 의존성 설치
npm install

# 2) 개발 서버 실행
npm run dev
# => http://localhost:3000
```

* `lib/fetcher.ts`의 `API_BASE`를 **Mock 또는 실제 API**로 맞추세요.

### 7.2 Mock API(json-server)

```bash
# 권장 버전으로 실행(일부 β 버전은 _expand/_embed 결함)
npx json-server@0.17.1 --watch db.json --port 4000
```

* 관계 확장이 필요하면 FK로 **별도 fetch → 합치기**가 안정적.

### 7.3 백엔드 실행(실DB)

```bash
# 1) 의존성 설치
npm install

# 2) .env 채우기 (DATABASE_URL/JWT_SECRET 등)

# 3) 개발 서버
npm run dev  # nodemon
```

> **터미널 명령어 이해 포인트**
> `--watch` : 파일 변경 감시 → 자동 반영
> `nodemon` : 코드 변경 시 서버 **자동 재시작**
> `dotenv` : `.env` 값을 `process.env`로 주입
> `pg` : PostgreSQL 연결/쿼리 수행 드라이버

---

## 8) 테스트·품질·배포

* **테스트**

  * FE: Jest + Testing Library(단위) / Playwright(E2E)
  * BE: Jest + Supertest(라우트 테스트), 샘플 시드 데이터
* **품질**

  * ESLint + Prettier, 타입강화(Strict), Lighthouse/Profiler
  * 로딩 지연 문제 → **SWR 캐시, Lazy fetch, Suspense 활용**
* **배포**

  * FE: Amplify 또는 S3+CloudFront
  * BE: EC2(Docker) + Nginx(리버스 프록시) + GitHub Actions
  * DB: RDS(PostgreSQL) / 이미지: S3

---

## 9) 진행 타임라인(발췌)

* **07/10\~11**: ERD 설계, Express 초기세팅, 회원가입 API, Git 초기화
* **07/12\~13**: 로그인/JWT, 선택 인증(게스트 공존), 루틴/운동 CRUD, 루틴아이템 CRUD
* **07/14**: 백엔드 MVP 범위/권한/게스트 정책 문서화
* **07/19**: 프론트 환경 세팅, json-server, fetcher, 목록/폼 CRUD 흐름
* **08/01**: Workout 상세 페이지 SWR 조건 가드/CSR 전환 디버깅
* **08/07**: json-server `β` 확장 결함 파악 → **0.17.x**로 회귀
* **08/20**: App Router **Parallel Routes** 오버레이 UX 안정화, 의존형 SWR 정리

---

## 10) 코파일럿용 힌트(프롬프트 가이드)

* **게스트/로그인 동시 처리**:
  “토큰 있으면 `req.user.id`, 없으면 `x-guest-id`로 분기, 게스트는 로컬 저장”으로 답해.
* **루틴 편집 UX**:
  “메인 폼은 `/add-routine` 고정, `/select`, `/setup/[workoutId]`는 **오버레이**로 전환. **Zustand**에 초안 저장.”
* **데이터 결합**:
  “관계형 확장은 `_expand`에 의존하지 말고 FK로 병렬 fetch 후 병합.”

---

## 11) 개발 체크리스트

* [ ] `.env` 채웠는가? (`DATABASE_URL`, `JWT_SECRET`, S3 키 등)
* [ ] **optionalAuth** 적용 라우트에서 게스트 정책 누락 없음
* [ ] 루틴 삭제 시 `routine_item` 정리(CASCADE or 서비스 레벨)
* [ ] SWR 키 정합성(파라미터/쿼리 혼선 없음)
* [ ] 이미지 업로드는 S3 프리픽스 규칙 문서화(예: `users/{id}/photos/{uuid}.jpg`)
* [ ] 배포 브랜치 보호/CI 설정

---

## 12) 부록 — 자주 하는 실수 & 해결법

* **SWR 키 불일치**: `useParams()` 값과 쿼리스트링 혼용으로 캐시 충돌 → 키 생성 함수를 통일.
* **오버레이에서 폼 리셋**: 상태를 로컬 useState로만 두면 전환 시 초기화 → **Zustand 초안**으로 승격.
* **json-server 확장 실패**: 버전 이슈 → 0.17.x 사용 또는 FK 병렬 fetch.
* **게스트/로그인 혼합 버그**: 백엔드에서 항상 `req.user` 가정 → **optionalAuth** 사용, 분기 명확화.

---

## 13) 용어 간단 사전

* **Parallel Routes**: Next.js App Router의 병렬 슬롯 렌더링. 한 레이아웃에서 여러 영역을 **동시에** 구성.
* **의존형 SWR**: 선행 데이터 로드 후, 그 결과(id 등)를 이용해 **다음 요청을 조건부 실행**하는 패턴.
* **CASCADE**: 부모 레코드 삭제 시 자식 레코드 자동 삭제(DB 제약).

---

## 14) 파일·문서 위치 제안

```
/docs
  ├─ ERONA_OVERVIEW.md        # ← 본 문서
  ├─ ErunaERD.sql             # DDL 스키마(제공본 반영)
  ├─ API_SPEC.md              # 엔드포인트 상세/에러코드/예시
  ├─ FRONTEND_GUIDE.md        # App Router/Overlay/상태전략
  └─ BACKEND_GUIDE.md         # 미들웨어/쿼리패턴/시드/테스트
```

---

## 15) 다음 단계 로드맵

* [ ] 기록(Record) 통계 API(주/월 집계, 부위/종목별 그래프)
* [ ] JWT 만료·재발급·리프레시 전략
* [ ] 이미지 최적화(썸네일 파이프라인)
* [ ] E2E 시나리오(루틴 생성→기록→히스토리 시각화) 자동화
* [ ] RN(Expo) 베타: 로그인/루틴/기록 뷰만 우선 구현

---

*끝. 이 파일을 `docs/ERONA_OVERVIEW.md`로 저장해 사용하십시오.*
