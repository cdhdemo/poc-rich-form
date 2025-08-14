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

  override complete(
    context: StepContext,
    answers: StepAnswers["URBAN_PROJECT_SPACES_CATEGORIES_SELECTION"],
  ): void {
    this.updateAnswers(context, answers);

    // Invalider les calculs de coûts qui dépendent des surfaces
    this.invalidateDependentSteps(context, [
      "URBAN_PROJECT_EXPENSES_INSTALLATION",
      "URBAN_PROJECT_EXPENSES_PROJECTED_BUILDINGS_OPERATING_EXPENSES",
    ]);

    this.next(context);
  }
}
