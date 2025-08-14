import { getFutureSiteOwner } from "../../../stakeholders";
import { StepAnswers } from "../../steps.types";
import { BaseAnswerStepHandler } from "../answerStep.handler";
import { StepContext } from "../step.handler";

export class SiteResaleSelectionHandler extends BaseAnswerStepHandler {
  protected override stepId: keyof StepAnswers = "URBAN_PROJECT_SITE_RESALE_SELECTION";

  setDefaultAnswers(): void {}

  previous(context: StepContext): void {
    this.navigateTo(context, "URBAN_PROJECT_SITE_RESALE_INTRODUCTION");
  }

  next(context: StepContext): void {
    this.navigateTo(context, "URBAN_PROJECT_BUILDINGS_RESALE_SELECTION");

    const livingAndActivitySpacesDistribution = BaseAnswerStepHandler.getStepAnswers(
      context,
      "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
    )?.livingAndActivitySpacesDistribution;

    if (
      livingAndActivitySpacesDistribution?.BUILDINGS &&
      livingAndActivitySpacesDistribution.BUILDINGS > 0
    ) {
      this.navigateTo(context, "URBAN_PROJECT_BUILDINGS_RESALE_SELECTION");
      return;
    }

    this.navigateTo(context, "URBAN_PROJECT_EXPENSES_INTRODUCTION");
  }

  override updateAnswers(
    context: StepContext,
    answers: StepAnswers["URBAN_PROJECT_SITE_RESALE_SELECTION"],
    source: "user" | "system" = "user",
  ): void {
    const { siteResalePlannedAfterDevelopment } = answers;

    BaseAnswerStepHandler.addAnswerEvent<"URBAN_PROJECT_SITE_RESALE_SELECTION">(
      context,
      "URBAN_PROJECT_SITE_RESALE_SELECTION",
      {
        siteResalePlannedAfterDevelopment,
        futureSiteOwner: siteResalePlannedAfterDevelopment
          ? getFutureSiteOwner(siteResalePlannedAfterDevelopment, context.siteData?.owner)
          : undefined,
      },
      source,
    );
  }
}
