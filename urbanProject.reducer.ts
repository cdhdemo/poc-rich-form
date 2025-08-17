// urban-project.reducer.ts
import { createReducer, UnknownAction } from "@reduxjs/toolkit";

// Importez vos actions existantes
import { ProjectCreationState } from "../createProject.reducer";
import { FormEvent } from "./form-events/events.type";
import { stepHandlerRegistry } from "./step-handlers/stepHandlerRegistry";
import { isInformationalStep } from "./steps";
import { StepAnswers } from "./steps.types";
import { loadStep, completeStep, navigateToPrevious, navigateToNext } from "./urbanProject.actions";
import { UrbanProjectCustomCreationStep } from "../../core/urban-project/creationSteps"

export type UrbanProjectState = {
  events: FormEvent[];
  currentStep: UrbanProjectCustomCreationStep;
  saveState: "idle" | "loading" | "success" | "error";
};

export const initialState: UrbanProjectState = {
  events: [],
  currentStep: "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION",
  saveState: "idle",
};

export const urbanProjectReducer = createReducer({} as ProjectCreationState, (builder) => {
  builder.addCase(loadStep, (state, action) => {
    const handler = stepHandlerRegistry.getAnswerStepHandler(action.payload.stepId);
    handler.load(state);
  });

  builder.addCase(completeStep, (state, action) => {
    const stepId = action.payload.stepId;
    const handler = stepHandlerRegistry.getAnswerStepHandler(stepId);

    handler.complete(state, action.payload.answers);
  });

  // Navigation vers l'étape précédente
  builder.addCase(navigateToPrevious, (state, action) => {
    const stepId = action.payload.stepId;

    const handler = isInformationalStep(stepId)
      ? stepHandlerRegistry.getInformationalStepHandler(stepId)
      : stepHandlerRegistry.getAnswerStepHandler(stepId as keyof StepAnswers);

    handler.previous(state);
  });

  // Navigation vers l'étape suivante
  builder.addCase(navigateToNext, (state, action) => {
    const stepId = action.payload.stepId;

    const handler = isInformationalStep(stepId)
      ? stepHandlerRegistry.getInformationalStepHandler(stepId)
      : stepHandlerRegistry.getAnswerStepHandler(stepId as keyof StepAnswers);

    handler.next(state);
  });
});

export default (state: ProjectCreationState, action: UnknownAction): ProjectCreationState => {
  const s = urbanProjectReducer(state, action);
  return {
    ...s,
    urbanProject: {
      ...s.urbanProject,
      // soilsCarbonStorage: soilsCarbonStorageReducer(state.urbanProject.soilsCarbonStorage, action),
    },
  };
};
