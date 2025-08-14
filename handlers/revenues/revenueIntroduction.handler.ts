import { UrbanProjectCustomCreationStep } from "../../../urban-project/creationSteps";
import { BaseStepHandler, StepContext } from "../step.handler";

export class RevenueIntroductionHandler extends BaseStepHandler {
  protected override readonly stepId: UrbanProjectCustomCreationStep =
    "URBAN_PROJECT_REVENUE_INTRODUCTION";

  previous(context: StepContext): void {
    const livingAndActivitySpacesDistribution = BaseStepHandler.getStepAnswers(
      context,
      "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
    )?.livingAndActivitySpacesDistribution;

    const buildingsResalePlannedAfterDevelopment = BaseStepHandler.getStepAnswers(
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
    this.navigateTo(context, "URBAN_PROJECT_EXPENSES_INSTALLATION");
  }

  next(context: StepContext): void {
    const siteResalePlannedAfterDevelopment = BaseStepHandler.getStepAnswers(
      context,
      "URBAN_PROJECT_SITE_RESALE_SELECTION",
    )?.siteResalePlannedAfterDevelopment;

    if (siteResalePlannedAfterDevelopment) {
      this.navigateTo(context, "URBAN_PROJECT_REVENUE_EXPECTED_SITE_RESALE");
      return;
    }

    const livingAndActivitySpacesDistribution = BaseStepHandler.getStepAnswers(
      context,
      "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
    )?.livingAndActivitySpacesDistribution;

    if (
      livingAndActivitySpacesDistribution?.BUILDINGS &&
      livingAndActivitySpacesDistribution.BUILDINGS > 0
    ) {
      const buildingsResalePlannedAfterDevelopment = BaseStepHandler.getStepAnswers(
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

    this.navigateTo(context, "URBAN_PROJECT_REVENUE_FINANCIAL_ASSISTANCE");
  }
}
