import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "@/shared/core/store-config/store";

import {
  getUrbanProjectSoilsDistributionFromSpaces,
  UrbanSpacesByCategory,
} from "../urban-project/urbanProjectSoils";
import { FormEvent } from "./form-events/events.type";
import { stepHandlerRegistry } from "./stepHandlerRegistry";
import { isInformationalStep } from "./steps";
import { StepAnswers } from "./steps.types";

export const getLastEventOfType = (events: FormEvent[], type: FormEvent["type"]) =>
  events
    .slice()
    .sort((x, y) => y.timestamp - x.timestamp)
    .find((event) => event.type === type);

export const getLastEventForStepId = (events: FormEvent[], stepId: FormEvent["stepId"]) =>
  events
    .slice()
    .sort((x, y) => y.timestamp - x.timestamp)
    .find((e) => e.stepId === stepId);

export const getLastAnswerEventForStep = (events: FormEvent[], stepId: FormEvent["stepId"]) =>
  events
    .slice()
    .sort((x, y) => y.timestamp - x.timestamp)
    .find((e) => e.stepId === stepId && e.type === "ANSWER_SET");

export const getStepLastAnswers = <T extends keyof StepAnswers>(stepId: T, events: FormEvent[]) => {
  const event = getLastAnswerEventForStep(events, stepId);
  if (!event) {
    return undefined;
  }
  return event as StepAnswers[T];
};

const selectEvents = (state: RootState) => state.projectCreation.pocUrbanProject.events;

export const selectSpaceDistribution = createSelector(
  selectEvents,
  (events: FormEvent[]) =>
    getStepLastAnswers("URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA", events)
      ?.spacesCategoriesDistribution,
);

export const getProjectSoilDistribution = (events: FormEvent[]) => {
  const spacesCategoriesDistribution = getStepLastAnswers(
    "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA",
    events,
  )?.spacesCategoriesDistribution;
  const publicSpacesDistribution = getStepLastAnswers(
    "URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION",
    events,
  )?.publicSpacesDistribution;
  const greenSpacesDistribution = getStepLastAnswers(
    "URBAN_PROJECT_GREEN_SPACES_SURFACE_AREA_DISTRIBUTION",
    events,
  )?.greenSpacesDistribution;
  const livingAndActivitySpacesDistribution = getStepLastAnswers(
    "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
    events,
  )?.livingAndActivitySpacesDistribution;

  if (!spacesCategoriesDistribution) return {};

  const urbanSpacesByCategory: UrbanSpacesByCategory = [];
  if (spacesCategoriesDistribution.GREEN_SPACES) {
    urbanSpacesByCategory.push({
      category: "GREEN_SPACES",
      surfaceArea: spacesCategoriesDistribution.GREEN_SPACES,
      spaces: greenSpacesDistribution ?? {},
    });
  }
  if (spacesCategoriesDistribution.LIVING_AND_ACTIVITY_SPACES) {
    urbanSpacesByCategory.push({
      category: "LIVING_AND_ACTIVITY_SPACES",
      surfaceArea: spacesCategoriesDistribution.LIVING_AND_ACTIVITY_SPACES,
      spaces: livingAndActivitySpacesDistribution ?? {},
    });
  }
  if (spacesCategoriesDistribution.PUBLIC_SPACES) {
    urbanSpacesByCategory.push({
      category: "PUBLIC_SPACES",
      surfaceArea: spacesCategoriesDistribution.PUBLIC_SPACES,
      spaces: publicSpacesDistribution ?? {},
    });
  }
  if (spacesCategoriesDistribution.URBAN_POND_OR_LAKE) {
    urbanSpacesByCategory.push({
      category: "URBAN_POND_OR_LAKE",
      surfaceArea: spacesCategoriesDistribution.URBAN_POND_OR_LAKE,
    });
  }

  const soilsDistribution = getUrbanProjectSoilsDistributionFromSpaces(urbanSpacesByCategory);
  return soilsDistribution.toJSON();
};

export const selectProjectSoilDistribution = createSelector(selectEvents, (events: FormEvent[]) =>
  getProjectSoilDistribution(events),
);

export const selectStepAnswers = <T extends keyof StepAnswers>(stepId: T) =>
  createSelector([(state: RootState) => state.projectCreation], (state) => {
    if (isInformationalStep(stepId)) {
      return undefined;
    }
    const handler = stepHandlerRegistry.getAnswerStepHandler(stepId);
    return handler.getAnswers(state) as StepAnswers[T];
  });

export const selectCurrentStep = createSelector(
  [(state: RootState) => state.projectCreation.pocUrbanProject.events],
  (events) =>
    getLastEventOfType(events, "STEP_NAVIGATED")?.stepId ??
    "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION",
);
