import { UrbanProjectCustomCreationStep } from "../../urban-project/creationSteps";
import { BaseFormEvent } from "./baseFormEvent";

export class InvalidStepEvent extends BaseFormEvent<"INVALID_STEP", undefined> {
  protected override readonly type = "INVALID_STEP" as const;

  static new(stepId: UrbanProjectCustomCreationStep) {
    return new InvalidStepEvent({ stepId }).get();
  }
}
