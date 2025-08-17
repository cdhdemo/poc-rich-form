import { generateUrbanProjectName } from "../../../projectName";
import { StepAnswers } from "../../steps.types";
import { BaseAnswerStepHandler } from "../answerStep.handler";
import { StepContext } from "../step.handler";

export class UrbanProjectNamingHandler extends BaseAnswerStepHandler {
  protected override stepId: keyof StepAnswers = "URBAN_PROJECT_NAMING";
  
  handleUpdateSideEffects(): void { }

  setDefaultAnswers(context: StepContext): void {
    this.updateAnswers(
      context,
      {
        name: generateUrbanProjectName(),
      },
      "system",
    );
  }

  previous(context: StepContext): void {
    this.navigateTo(context, "URBAN_PROJECT_SCHEDULE_PROJECTION");
  }

  next(context: StepContext): void {
    this.navigateTo(context, "URBAN_PROJECT_FINAL_SUMMARY");
  }
}
