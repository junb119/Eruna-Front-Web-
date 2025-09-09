"use client";
import useSWRMutation from "swr/mutation";
import { poster } from "@/lib/fetcher";

type CreateRecordPayload = {
  routineId: string;
  startAt: string;
  endAt: string;
  status: "completed" | "aborted" | "active";
};
 
export function useCommitSession() {
  const { trigger, isMutating, error } = useSWRMutation("/records", poster);

  async function commit(payload: CreateRecordPayload) {
    return trigger(payload);
  }

  return { commit, isCommitting: isMutating, commitError: error };
}

