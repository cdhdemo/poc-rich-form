import { getFutureOperator } from "../../../stakeholders";
import { FormState } from "../../form-state/formState";
import { StepAnswers } from "../../steps.types";
import { BaseAnswerStepHandler } from "../answerStep.handler";
import { StepContext } from "../step.handler";

export class BuildingsResaleSelectionHandler extends BaseAnswerStepHandler {
  protected override stepId: keyof StepAnswers = "URBAN_PROJECT_BUILDINGS_RESALE_SELECTION";

  setDefaultAnswers(): void {}

  previous(context: StepContext): void {
    this.navigateTo(context, "URBAN_PROJECT_SITE_RESALE_SELECTION");
  }

  next(context: StepContext): void {
    this.navigateTo(context, "URBAN_PROJECT_EXPENSES_INTRODUCTION");
  }

  override updateAnswers(
    context: StepContext,
    answers: StepAnswers["URBAN_PROJECT_BUILDINGS_RESALE_SELECTION"],
    source?: "user" | "system",
  ): void {
    const { buildingsResalePlannedAfterDevelopment } = answers;

    const projectDeveloper = FormState.getStepAnswers(
      context.pocUrbanProject.events,
      "URBAN_PROJECT_STAKEHOLDERS_PROJECT_DEVELOPER",
    )?.projectDeveloper;

    BaseAnswerStepHandler.addAnswerEvent<"URBAN_PROJECT_BUILDINGS_RESALE_SELECTION">(
      context,
      "URBAN_PROJECT_BUILDINGS_RESALE_SELECTION",
      {
        buildingsResalePlannedAfterDevelopment,
        futureOperator: buildingsResalePlannedAfterDevelopment
          ? getFutureOperator(buildingsResalePlannedAfterDevelopment, projectDeveloper)
          : undefined,
      },
      source,
    );
  }
}
