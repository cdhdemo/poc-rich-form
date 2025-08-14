import { UrbanProjectCustomCreationStep } from "../../urban-project/creationSteps";

type Props<TPayload> = {
  stepId: UrbanProjectCustomCreationStep;
  source?: "user" | "system";
  payload?: TPayload;
};

export abstract class BaseFormEvent<
  TType extends "ANSWER_SET" | "STEP_NAVIGATED" | "INVALID_STEP",
  TPayload,
> {
  protected abstract readonly type: TType;

  protected readonly stepId: UrbanProjectCustomCreationStep =
    "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION";
  protected readonly id: string = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  protected readonly timestamp: number = Date.now();
  protected readonly source: "user" | "system" = "user";
  protected readonly payload?: TPayload;

  constructor({ stepId, source, payload }: Props<TPayload>) {
    this.source = source ?? "user";
    this.stepId = stepId;
    this.payload = payload;
  }

  get() {
    return {
      stepId: this.stepId,
      type: this.type,
      timestamp: this.timestamp,
      source: this.source,
      payload: this.payload,
    };
  }
}
