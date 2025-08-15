import { computeDefaultInstallationExpensesFromSiteSurfaceArea } from "shared";

import { BaseAnswerStepHandler } from "../answerStep.handler";
import { StepContext } from "../step.handler";

export class UrbanProjectInstallationExpensesHandler extends BaseAnswerStepHandler {
  protected readonly stepId = "URBAN_PROJECT_EXPENSES_INSTALLATION";

  setDefaultAnswers(context: StepContext): void {
    if (!context.siteData?.surfaceArea) return;

    const { technicalStudies, other, developmentWorks } =
      computeDefaultInstallationExpensesFromSiteSurfaceArea(context.siteData.surfaceArea);

    this.updateAnswers(
      context,
      {
        installationExpenses: [
          { purpose: "development_works", amount: developmentWorks },
          { purpose: "technical_studies", amount: technicalStudies },
          { purpose: "other", amount: other },
        ],
      },
      "system",
    );
  }

  previous(context: StepContext): void {
    if (context.siteData?.nature === "FRICHE") {
      this.navigateTo(context, "URBAN_PROJECT_EXPENSES_REINSTATEMENT");
      return;
    }
    this.navigateTo(context, "URBAN_PROJECT_EXPENSES_SITE_PURCHASE_AMOUNTS");
  }

  next(context: StepContext): void {
    const livingAndActivitySpacesDistribution = BaseAnswerStepHandler.getStepAnswers(
      context,
      "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
    )?.livingAndActivitySpacesDistribution;

    const buildingsResalePlannedAfterDevelopment = BaseAnswerStepHandler.getStepAnswers(
      context,
      "URBAN_PROJECT_BUILDINGS_RESALE_SELECTION",
    )?.buildingsResalePlannedAfterDevelopment;

    if (
      livingAndActivitySpacesDistribution?.BUILDINGS &&
      livingAndActivitySpacesDistribution.BUILDINGS > 0 &&
      !buildingsResalePlannedAfterDevelopment
    ) {
      this.navigateTo(context, "URBAN_PROJECT_EXPENSES_PROJECTED_BUILDINGS_OPERATING_EXPENSES");
      return;
    }
    this.navigateTo(context, "URBAN_PROJECT_REVENUE_INTRODUCTION");
  }
}
