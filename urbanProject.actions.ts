import { createAction } from "@reduxjs/toolkit";

import { makeProjectCreationActionType } from "../actions/actionsUtils";
import { UrbanProjectCustomCreationStep } from "../urban-project/creationSteps";
import { StepAnswers } from "./steps.types";

const URBAN_PROJECT_CREATION_PREFIX = "pocUrbanProject";

export const makeUrbanProjectCreationActionType = (actionName: string) => {
  return makeProjectCreationActionType(`${URBAN_PROJECT_CREATION_PREFIX}/${actionName}`);
};

const createUrbanProjectCreationAction = <TPayload = void>(actionName: string) =>
  createAction<TPayload>(makeUrbanProjectCreationActionType(actionName));

type StepPayload<K extends keyof StepAnswers = keyof StepAnswers> = {
  [P in K]: {
    stepId: P;
    answers: StepAnswers[P];
  };
}[K];
export const completeStep = createUrbanProjectCreationAction<StepPayload>("completeStep");

export const loadStep = createUrbanProjectCreationAction<{
  stepId: keyof StepAnswers;
}>("loadStep");

export const navigateToPrevious = createUrbanProjectCreationAction<{
  stepId: UrbanProjectCustomCreationStep;
}>("navigateToPrevious");

export const navigateToNext = createUrbanProjectCreationAction<{
  stepId: UrbanProjectCustomCreationStep;
}>("navigateToNext");
