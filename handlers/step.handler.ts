import { ProjectCreationState } from "../../createProject.reducer";
import { UrbanProjectCustomCreationStep } from "../../urban-project/creationSteps";
import { SerializedAnswerEvent } from "../form-events/events.type";
import { NavigationEvent } from "../form-events/navigateFormEvent";
import { StepAnswers } from "../steps.types";

export type StepContext = ProjectCreationState;

export interface StepHandler {
  previous(context: StepContext): void;
  next(context: StepContext): void;
}

export abstract class BaseStepHandler {
  protected abstract readonly stepId: UrbanProjectCustomCreationStep;

  abstract previous(context: StepContext): void;
  abstract next(context: StepContext): void;

  protected navigateTo(context: StepContext, stepId: UrbanProjectCustomCreationStep): void {
    context.pocUrbanProject.events.push(NavigationEvent.new(stepId));
  }

  static getStepAnswers<K extends keyof StepAnswers>(context: StepContext, stepId: K) {
    const event = context.pocUrbanProject.events
      .slice()
      .sort((x, y) => y.timestamp - x.timestamp)
      .find(
        (e): e is SerializedAnswerEvent<typeof stepId> =>
          e.stepId === stepId && e.type === "ANSWER_SET",
      );

    if (!event) {
      return undefined;
    }
    return event.payload;
  }
}
