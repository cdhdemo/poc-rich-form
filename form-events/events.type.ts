import { StepAnswers } from "../steps.types";

type SerializedBaseEvent = {
  timestamp: number;
  source: "user" | "system";
};

export type FormEvent = SerializedAnswerEvent<keyof StepAnswers>;

export type SerializedAnswerEvent<T extends keyof StepAnswers> = SerializedBaseEvent & {
  type: "ANSWER_SET";
  stepId: T;
  payload: StepAnswers[T];
};
