import { StepAnswers } from "../steps.types";
import { BaseFormEvent } from "./BaseAnswerEvent";

export class AnswerDeletionEvent extends BaseFormEvent<"ANSWER_DELETED", undefined> {
  protected override readonly type = "ANSWER_DELETED" as const;

  static new(stepId: keyof StepAnswers, source?: "user" | "system") {
    return new AnswerDeletionEvent({
      stepId,
      source,
    }).get();
  }
}
