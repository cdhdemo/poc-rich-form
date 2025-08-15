import { getFutureSiteOwner } from "../../../stakeholders";
import { FormState } from "../../form-state/formState";
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

    if (FormState.hasBuildings(context.pocUrbanProject.events)) {
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
