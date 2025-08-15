import { StepAnswers } from "../../steps.types";
import { BaseAnswerStepHandler } from "../answerStep.handler";
import { StepContext } from "../step.handler";

export class UrbanProjectSpacesCategoriesSurfaceAreaHandler extends BaseAnswerStepHandler {
  protected readonly stepId: keyof StepAnswers = "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA";

  setDefaultAnswers(): void {}

  previous(context: StepContext): void {
    this.navigateTo(context, "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION");
  }

  next(context: StepContext): void {
    this.navigateTo(context, "URBAN_PROJECT_SPACES_DEVELOPMENT_PLAN_INTRODUCTION");
  }
}
