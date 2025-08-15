import { FormState } from "../../form-state/formState";
import { StepAnswers } from "../../steps.types";
import { BaseAnswerStepHandler } from "../answerStep.handler";
import { StepContext } from "../step.handler";

export class SoilsDecontaminationSelectionHandler extends BaseAnswerStepHandler {
  protected override stepId: keyof StepAnswers = "URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION";

  setDefaultAnswers(): void {}

  previous(context: StepContext): void {
    this.navigateTo(context, "URBAN_PROJECT_SOILS_DECONTAMINATION_INTRODUCTION");
  }

  next(context: StepContext): void {
    this.navigateTo(context, "URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA");
  }

  override complete(
    context: StepContext,
    answers: StepAnswers["URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION"],
  ): void {
    this.updateAnswers(context, answers);

    if (answers.decontaminationPlan === "partial") {
      this.next(context);
      return;
    }

    if (answers.decontaminationPlan === "none") {
      BaseAnswerStepHandler.addAnswerEvent(
        context,
        "URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA",
        { decontaminatedSurfaceArea: 0 },
      );
    }

    if (answers.decontaminationPlan === "unknown") {
      const contaminatedSoilSurface = context.siteData?.contaminatedSoilSurface ?? 0;

      BaseAnswerStepHandler.addAnswerEvent(
        context,
        "URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA",
        { decontaminatedSurfaceArea: contaminatedSoilSurface * 0.25 },
      );
    }

    if (FormState.hasBuildings(context.pocUrbanProject.events)) {
      this.navigateTo(context, "URBAN_PROJECT_BUILDINGS_INTRODUCTION");
      return;
    }

    this.navigateTo(context, "URBAN_PROJECT_STAKEHOLDERS_INTRODUCTION");
  }
}
