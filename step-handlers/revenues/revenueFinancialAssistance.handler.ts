import { FormState } from "../../form-state/formState";
import { StepAnswers } from "../../steps.types";
import { BaseAnswerStepHandler } from "../answerStep.handler";
import { StepContext } from "../step.handler";

export class RevenueFinancialAssistanceHandler extends BaseAnswerStepHandler {
  protected override stepId: keyof StepAnswers = "URBAN_PROJECT_REVENUE_FINANCIAL_ASSISTANCE";

  setDefaultAnswers(): void {}
  handleUpdateSideEffects(): void {}

  previous(context: StepContext): void {
    if (FormState.hasBuildings(context.pocUrbanProject.events)) {
      if (FormState.hasBuildingsResalePlannedAfterDevelopment(context.pocUrbanProject.events)) {
        this.navigateTo(context, "URBAN_PROJECT_REVENUE_BUILDINGS_RESALE");
        return;
      }
      this.navigateTo(context, "URBAN_PROJECT_REVENUE_BUILDINGS_OPERATIONS_YEARLY_REVENUES");
      return;
    }

    const siteResalePlannedAfterDevelopment = FormState.getStepAnswers(
      context.pocUrbanProject.events,
      "URBAN_PROJECT_SITE_RESALE_SELECTION",
    )?.siteResalePlannedAfterDevelopment;

    if (siteResalePlannedAfterDevelopment) {
      this.navigateTo(context, "URBAN_PROJECT_REVENUE_EXPECTED_SITE_RESALE");
      return;
    }

    this.navigateTo(context, "URBAN_PROJECT_REVENUE_INTRODUCTION");
  }

  next(context: StepContext): void {
    this.navigateTo(context, "URBAN_PROJECT_SCHEDULE_INTRODUCTION");
  }
}
