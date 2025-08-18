import { AnswerDeletionEvent } from "../form-events/AnswerDeletionEvent";
import { AnswerSetEvent } from "../form-events/AnswerSetEvent";
import { FormEvent } from "../form-events/events.type";
import { FormState } from "../form-state/formState";
import { StepAnswers } from "../steps.types";
import { BaseStepHandler, StepContext } from "./step.handler";

export interface AnswerStepHandler<TAnswers> {
  load(context: StepContext): void;
  previous(context: StepContext): void;
  next(context: StepContext): void;
  complete(context: StepContext, answers: TAnswers): void;
  getAnswers(context: StepContext): TAnswers | undefined;
}

export abstract class BaseAnswerStepHandler<T extends keyof StepAnswers = keyof StepAnswers>
  extends BaseStepHandler
  implements AnswerStepHandler<StepAnswers[T]>
{
  protected abstract override readonly stepId: T;

  abstract setDefaultAnswers(context: StepContext): void;
  abstract handleUpdateSideEffects(
    context: StepContext,
    previous: StepAnswers[T],
    newAnswers: StepAnswers[T],
  ): void;

  protected addAnswerEvent(
    context: StepContext,
    payload: StepAnswers[T],
    source: "user" | "system" = "user",
  ): void {
    context.pocUrbanProject.events.push(
      AnswerSetEvent.new(this.stepId, payload, source) as FormEvent,
    );
  }

  getAnswers(context: StepContext): StepAnswers[T] | undefined {
    return FormState.getStepAnswers<T>(context.pocUrbanProject.events, this.stepId);
  }

  load(context: StepContext) {
    const answerEvent = this.getAnswers(context);

    // Ne pas recalculer si des réponses existent déjà
    if (answerEvent) return;

    this.setDefaultAnswers(context);
  }

  updateAnswers(
    context: StepContext,
    answers: StepAnswers[T],
    source: "user" | "system" = "user",
  ): void {
    BaseAnswerStepHandler.addAnswerEvent<T>(context, this.stepId, answers, source);
  }

  isSameAnswers(base: StepAnswers[T], other: StepAnswers[T]) {
    return (
      JSON.stringify(Object.entries(base).sort()) === JSON.stringify(Object.entries(other).sort())
    );
  }

  complete(context: StepContext, answers: StepAnswers[T]): void {
    const previousAnswers = this.getAnswers(context);

    const hasChanged = !previousAnswers || !this.isSameAnswers(previousAnswers, answers);

    if (hasChanged) {
      this.updateAnswers(context, answers);

      if (previousAnswers) {
        this.handleUpdateSideEffects(context, previousAnswers, answers);
      }
    }

    this.next(context);
  }

  static addAnswerEvent<K extends keyof StepAnswers>(
    context: StepContext,
    stepId: K,
    answers: StepAnswers[K],
    source: "user" | "system" = "user",
  ) {
    context.pocUrbanProject.events.push(AnswerSetEvent.new(stepId, answers, source) as FormEvent);
  }

  static addAnswerDeletionEvent(
    context: StepContext,
    stepId: keyof StepAnswers,
    source: "user" | "system" = "user",
  ) {
    context.pocUrbanProject.events.push(AnswerDeletionEvent.new(stepId, source) as FormEvent);
  }
}
