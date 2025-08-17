import { StepAnswers } from "../steps.types";

type SerializedBaseEvent = {
  timestamp: number;
  source: "user" | "system";
};

export type FormEvent =
  | SerializedAnswerSetEvent<keyof StepAnswers>
  | SerializedAnswerDeletionEvent<keyof StepAnswers>;

export type SerializedAnswerSetEvent<T extends keyof StepAnswers> = SerializedBaseEvent & {
  type: "ANSWER_SET";
  stepId: T;
  payload: StepAnswers[T];
};

export type SerializedAnswerDeletionEvent<T extends keyof StepAnswers> = SerializedBaseEvent & {
  type: "ANSWER_DELETED";
  stepId: T;
};
