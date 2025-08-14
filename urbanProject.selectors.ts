import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "@/shared/core/store-config/store";

import { FormEvent } from "./form-events/events.type";
import { FormStateHandler } from "./handlers/formState.handler";
import { isInformationalStep } from "./steps";
import { StepAnswers } from "./steps.types";

const selectEvents = (state: RootState) => state.projectCreation.pocUrbanProject.events;

export const selectProjectSoilDistribution = createSelector(selectEvents, (events: FormEvent[]) =>
  FormStateHandler.new(events).getProjectSoilDistribution(),
);

export const selectStepAnswers = <T extends keyof StepAnswers>(stepId: T) =>
  createSelector([selectEvents], (events) => {
    if (isInformationalStep(stepId)) {
      return undefined;
    }
    return FormStateHandler.new(events).getStepAnswers(stepId);
  });

export const selectProjectData = createSelector([selectEvents], (events) =>
  FormStateHandler.new(events).getProjectData(),
);

export const selectProjectSpaces = createSelector([selectEvents], (events) =>
  FormStateHandler.new(events).getSpacesDistribution(),
);

export const selectFormAnswers = createSelector([selectEvents], (events) =>
  FormStateHandler.new(events).getFormAnswers(),
);

export const selectCurrentStep = createSelector(
  [selectEvents],
  (events) =>
    events
      .slice()
      .sort((x, y) => y.timestamp - x.timestamp)
      .find((event) => event.type === "STEP_NAVIGATED")?.stepId ??
    "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION",
);
