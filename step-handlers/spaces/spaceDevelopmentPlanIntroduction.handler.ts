import { UrbanProjectCustomCreationStep } from "../../../urban-project/creationSteps";
import { BaseStepHandler, StepContext } from "../step.handler";

export class SpaceDevelopmentPlanIntroductionHandler extends BaseStepHandler {
  protected override readonly stepId: UrbanProjectCustomCreationStep =
    "URBAN_PROJECT_SPACES_DEVELOPMENT_PLAN_INTRODUCTION";

  override previous(context: StepContext): void {
    const formState = this.getFormState(context);
    const spaceCategories = formState.getStepAnswers(
      "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
    )?.spacesCategories;
    this.navigateTo(
      context,
      spaceCategories && spaceCategories.length === 1
        ? "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION"
        : "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA",
    );
  }

  override next(context: StepContext): void {
    const formState = this.getFormState(context);

    const spacesCategoriesDistribution = formState.getStepAnswers(
      "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA",
    )?.spacesCategoriesDistribution;

    if (spacesCategoriesDistribution?.LIVING_AND_ACTIVITY_SPACES) {
      this.navigateTo(context, "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_INTRODUCTION");
      return;
    }

    if (spacesCategoriesDistribution?.PUBLIC_SPACES) {
      this.navigateTo(context, "URBAN_PROJECT_PUBLIC_SPACES_INTRODUCTION");
      return;
    }

    if (spacesCategoriesDistribution?.GREEN_SPACES) {
      this.navigateTo(context, "URBAN_PROJECT_GREEN_SPACES_INTRODUCTION");
      return;
    }

    this.navigateTo(context, "URBAN_PROJECT_SPACES_SOILS_SUMMARY");
  }
}
