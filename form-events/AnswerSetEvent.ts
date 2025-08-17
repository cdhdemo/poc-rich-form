import { StepAnswers } from "../steps.types";
import { BaseFormEvent } from "./BaseAnswerEvent";

type StepPayload<T extends keyof StepAnswers> = StepAnswers[T];

export class AnswerSetEvent<T extends keyof StepAnswers = keyof StepAnswers> extends BaseFormEvent<
  "ANSWER_SET",
  StepPayload<T>
> {
  protected override readonly type = "ANSWER_SET" as const;

  static new<K extends keyof StepAnswers>(
    stepId: K,
    payload: StepAnswers[K],
    source?: "user" | "system",
  ) {
    return new AnswerSetEvent<K>({
      stepId,
      payload,
      source,
    }).get();
  }
}
