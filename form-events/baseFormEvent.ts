import { UrbanProjectCustomCreationStep } from "../../urban-project/creationSteps";
import { StepAnswers } from "../steps.types";

type StepId<T_Type> = T_Type extends "ANSWER_SET"
  ? keyof StepAnswers
  : UrbanProjectCustomCreationStep;

type Props<TType, T_Payload> = {
  stepId: StepId<TType>;
  source?: "user" | "system";
  payload?: T_Payload;
};

export abstract class BaseFormEvent<T_Type extends "ANSWER_SET", T_Payload> {
  protected abstract readonly type: T_Type;

  protected readonly stepId: T_Type extends "ANSWER_SET"
    ? keyof StepAnswers
    : UrbanProjectCustomCreationStep;

  protected readonly timestamp: number;
  protected readonly source: "user" | "system";
  protected readonly payload?: T_Payload;

  constructor({ stepId, source, payload }: Props<T_Type, T_Payload>) {
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
