// src/app/api/data.ts

// ─────────────────────────────────────────────────────────────
// 1. User
// ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  profileImage: string;
  provider: string;
  oauthId: string;
  createdAt: string;
  updatedAt: string;
}
export const users: User[] = [];

// ─────────────────────────────────────────────────────────────
// 2. Workout Category
// ─────────────────────────────────────────────────────────────
export interface WorkoutCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}
export const workoutCategories: WorkoutCategory[] = [];

// ─────────────────────────────────────────────────────────────
// 3. Workout Type
// ─────────────────────────────────────────────────────────────
export interface WorkoutType {
  id: string;
  name: string;
  unitPrimary: string;
  unitSecondary: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
export const workoutTypes: WorkoutType[] = [];

// ─────────────────────────────────────────────────────────────
// 4. Workout
// ─────────────────────────────────────────────────────────────
export interface Workout {
  id: string;
  name: string;
  description: string;
  categoryId: string; // FK → WorkoutCategory.id
  typeId: string; // FK → WorkoutType.id
  createdBy: string; // FK → User.id
  createdAt: string;
  updatedAt: string;
}
export const workouts: Workout[] = [];

// ─────────────────────────────────────────────────────────────
// 5. Routine
// ─────────────────────────────────────────────────────────────
export interface Routine {
  id: string;
  name: string;
  description: string;
  createdBy: string; // FK → User.id
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}
export const routines: Routine[] = [];

// ─────────────────────────────────────────────────────────────
// 6. Routine Item
// ─────────────────────────────────────────────────────────────
export interface RoutineItem {
  id: string;
  routineId: string; // FK → Routine.id
  workoutId: string; // FK → Workout.id
  order: number;
  setCount: number;
  repCount: number;
  duration: number;
  distance: number;
  weight: number;
  note: string;
}
export const routineItems: RoutineItem[] = [];

// ─────────────────────────────────────────────────────────────
// 7. Record
// ─────────────────────────────────────────────────────────────
export interface Record {
  id: string;
  userId: string; // FK → User.id
  date: string; // ISO date string, ex. "2025-07-18"
  startTime: string; // ex. "08:00"
  endTime: string; // ex. "09:00"
  memo: string;
  createdAt: string;
  updatedAt: string;
}
export const records: Record[] = [];

// ─────────────────────────────────────────────────────────────
// 8. Record Item
// ─────────────────────────────────────────────────────────────
export interface RecordItem {
  id: string;
  recordId: string; // FK → Record.id
  workoutId: string; // FK → Workout.id
  order: number;
  setCount: number;
  repCount: number;
  duration: number;
  distance: number;
  weight: number;
  memo: string;
  createdAt: string;
  updatedAt: string;
}
export const recordItems: RecordItem[] = [];

// ─────────────────────────────────────────────────────────────
// 9. Favorite
// ─────────────────────────────────────────────────────────────
export interface Favorite {
  id: string;
  userId: string; // FK → User.id
  workoutId: string; // FK → Workout.id
  routineId: string; // FK → Routine.id
  createdAt: string;
  updatedAt: string;
}
export let favorites: Favorite[];
