import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "@/shared/core/store-config/store";

import { FormEvent } from "./form-events/events.type";
import { FormState } from "./form-state/formState";
import { isInformationalStep } from "./steps";
import { StepAnswers } from "./steps.types";

const selectEvents = (state: RootState) => state.projectCreation.pocUrbanProject.events;

export const selectProjectSoilDistribution = createSelector(selectEvents, (events: FormEvent[]) =>
  FormState.getProjectSoilDistribution(events),
);

export const selectStepAnswers = <T extends keyof StepAnswers>(stepId: T) =>
  createSelector([selectEvents], (events) => {
    if (isInformationalStep(stepId)) {
      return undefined;
    }
    return FormState.getStepAnswers(events, stepId);
  });

export const selectProjectData = createSelector([selectEvents], (events) =>
  FormState.getProjectData(events),
);

export const selectProjectSpaces = createSelector([selectEvents], (events) =>
  FormState.getSpacesDistribution(events),
);

export const selectFormAnswers = createSelector([selectEvents], (events) =>
  FormState.getFormAnswers(events),
);

export const selectCurrentStep = createSelector(
  [(state: RootState) => state.projectCreation.pocUrbanProject],
  (state) => state.currentStep,
);
