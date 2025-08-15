import { StepAnswers } from "../../steps.types";
import { BaseAnswerStepHandler } from "../answerStep.handler";
import { StepContext } from "../step.handler";

export class SoilsDecontaminationSurfaceAreaHandler extends BaseAnswerStepHandler {
  protected override stepId: keyof StepAnswers = "URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA";

  setDefaultAnswers(): void {}

  previous(context: StepContext): void {
    this.navigateTo(context, "URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION");
  }

  next(context: StepContext): void {
    const livingAndActivitySpacesDistribution = BaseAnswerStepHandler.getStepAnswers(
      context,
      "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
    )?.livingAndActivitySpacesDistribution;

    if (
      livingAndActivitySpacesDistribution?.BUILDINGS &&
      livingAndActivitySpacesDistribution.BUILDINGS > 0
    ) {
      this.navigateTo(context, "URBAN_PROJECT_BUILDINGS_INTRODUCTION");
      return;
    }

    this.navigateTo(context, "URBAN_PROJECT_STAKEHOLDERS_INTRODUCTION");
  }
}
