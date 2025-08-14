import { StepAnswers } from "../../steps.types";
import { BaseAnswerStepHandler } from "../answerStep.handler";
import { StepContext } from "../step.handler";

export class RevenueFinancialAssistanceHandler extends BaseAnswerStepHandler {
  protected override stepId: keyof StepAnswers = "URBAN_PROJECT_REVENUE_FINANCIAL_ASSISTANCE";

  setDefaultAnswers(): void {}

  previous(context: StepContext): void {
    const livingAndActivitySpacesDistribution = BaseAnswerStepHandler.getStepAnswers(
      context,
      "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
    )?.livingAndActivitySpacesDistribution;

    if (
      livingAndActivitySpacesDistribution?.BUILDINGS &&
      livingAndActivitySpacesDistribution.BUILDINGS > 0
    ) {
      const buildingsResalePlannedAfterDevelopment = BaseAnswerStepHandler.getStepAnswers(
        context,
        "URBAN_PROJECT_BUILDINGS_RESALE_SELECTION",
      )?.buildingsResalePlannedAfterDevelopment;

      if (buildingsResalePlannedAfterDevelopment) {
        this.navigateTo(context, "URBAN_PROJECT_REVENUE_BUILDINGS_RESALE");
        return;
      }
      this.navigateTo(context, "URBAN_PROJECT_REVENUE_BUILDINGS_OPERATIONS_YEARLY_REVENUES");
      return;
    }

    const siteResalePlannedAfterDevelopment = BaseAnswerStepHandler.getStepAnswers(
      context,
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
