import { UrbanSpaceCategory } from "shared";

import { StepAnswers } from "../../steps.types";
import { BaseAnswerStepHandler } from "../answerStep.handler";
import { StepContext } from "../step.handler";

export class UrbanProjectSpacesCategoriesSelectionHandler extends BaseAnswerStepHandler {
  protected override stepId: keyof StepAnswers = "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION";

  setDefaultAnswers(): void {}

  previous(context: StepContext): void {
    this.navigateTo(context, "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION");
  }

  next(context: StepContext): void {
    this.navigateTo(context, "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA");
  }

  override complete(
    context: StepContext,
    answers: StepAnswers["URBAN_PROJECT_SPACES_CATEGORIES_SELECTION"],
  ): void {
    // Enregistrer la réponse
    this.updateAnswers(context, answers);

    if (answers.spacesCategories?.length === 1 && answers.spacesCategories[0]) {
      this.handleSingleCategoryShortcut(context, answers.spacesCategories[0]);
      return;
    }

    this.next(context);
  }

  private handleSingleCategoryShortcut(
    context: StepContext,
    spaceCategory: UrbanSpaceCategory,
  ): void {
    BaseAnswerStepHandler.addAnswerEvent(
      context,
      "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA",
      {
        spacesCategoriesDistribution: {
          [spaceCategory]: context.siteData?.surfaceArea,
        },
      },
      "system",
    );
    this.navigateTo(context, "URBAN_PROJECT_SPACES_DEVELOPMENT_PLAN_INTRODUCTION");
  }
}
