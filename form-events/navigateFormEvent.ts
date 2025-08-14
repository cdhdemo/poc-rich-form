import { UrbanProjectCustomCreationStep } from "../../urban-project/creationSteps";
import { BaseFormEvent } from "./baseFormEvent";

export class NavigationEvent extends BaseFormEvent<"STEP_NAVIGATED", undefined> {
  protected override readonly type = "STEP_NAVIGATED" as const;

  static new(stepId: UrbanProjectCustomCreationStep) {
    return new NavigationEvent({ stepId }).get();
  }
}
