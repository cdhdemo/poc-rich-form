import { AnswerSetEvent } from "../form-events/answerFormEvent";
import { FormEvent } from "../form-events/events.type";
import { InvalidStepEvent } from "../form-events/invalidStepFormEvent";
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

  protected addAnswerEvent(
    context: StepContext,
    payload: StepAnswers[T],
    source: "user" | "system" = "user",
  ): void {
    context.pocUrbanProject.events.push(
      AnswerSetEvent.new(this.stepId, payload, source) as FormEvent,
    );
  }

  protected hasExistingAnswers(context: StepContext): boolean {
    return !!this.getAnswers(context);
  }

  protected invalidateDependentSteps(
    context: StepContext,
    dependentSteps: (keyof StepAnswers)[],
  ): void {
    dependentSteps.forEach((step) => {
      if (BaseAnswerStepHandler.getStepAnswers(context, step)) {
        context.pocUrbanProject.events.push(InvalidStepEvent.new(step));
      }
    });
  }

  getAnswers(context: StepContext): StepAnswers[T] | undefined {
    return BaseAnswerStepHandler.getStepAnswers<T>(context, this.stepId);
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

  complete(context: StepContext, answers: StepAnswers[T]): void {
    this.updateAnswers(context, answers);

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
}
