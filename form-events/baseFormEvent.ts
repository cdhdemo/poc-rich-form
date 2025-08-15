import { UrbanProjectCustomCreationStep } from "../../urban-project/creationSteps";
import { StepAnswers } from "../steps.types";

type StepId<TType> = TType extends "ANSWER_SET"
  ? keyof StepAnswers
  : UrbanProjectCustomCreationStep;

type Props<TType, TPayload> = {
  stepId: StepId<TType>;
  source?: "user" | "system";
  payload?: TPayload;
};

export abstract class BaseFormEvent<TType extends "ANSWER_SET" | "STEP_NAVIGATED", TPayload> {
  protected abstract readonly type: TType;

  protected readonly stepId: TType extends "ANSWER_SET"
    ? keyof StepAnswers
    : UrbanProjectCustomCreationStep;

  protected readonly timestamp: number;
  protected readonly source: "user" | "system";
  protected readonly payload?: TPayload;

  constructor({ stepId, source, payload }: Props<TType, TPayload>) {
    this.source = source ?? "user";
    this.stepId = stepId;
    this.payload = payload;
    this.timestamp = Date.now();
  }

  get() {
    return {
      stepId: this.stepId,
      type: this.type,
      timestamp: this.timestamp,
      source: this.source,
      ...(this.payload && { payload: this.payload }),
    } as const;
  }
}
