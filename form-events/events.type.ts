import { UrbanProjectCustomCreationStep } from "../../urban-project/creationSteps";
import { StepAnswers } from "../steps.types";

type SerializedBaseEvent = {
  timestamp: number;
  source: "user" | "system";
};

export type FormEvent =
  | SerializedNavigateEvent
  | SerializedAnswerEvent<keyof StepAnswers>
  | SerializedInvalidStepEvent;

type SerializedInvalidStepEvent = SerializedBaseEvent & {
  type: "INVALID_STEP";
  stepId: UrbanProjectCustomCreationStep;
};
type SerializedNavigateEvent = SerializedBaseEvent & {
  type: "STEP_NAVIGATED";
  stepId: UrbanProjectCustomCreationStep;
};

export type SerializedAnswerEvent<T extends keyof StepAnswers> = SerializedBaseEvent & {
  type: "ANSWER_SET";
  stepId: T;
  payload: StepAnswers[T];
};
