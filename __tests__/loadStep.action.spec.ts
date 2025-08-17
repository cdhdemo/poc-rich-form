import {
  DevelopmentPlanInstallationExpenses,
  ReinstatementExpense,
  ReinstatementExpensePurpose,
  sumListWithKey,
} from "shared";
import { describe, it, expect, beforeEach } from "vitest";

import { createStore } from "@/shared/core/store-config/store";
import { getTestAppDependencies } from "@/test/testAppDependencies";

import { getInitialState, ProjectCreationState } from "../../createProject.reducer";
import { Schedule } from "../../project.types";
import { UrbanProjectCustomCreationStep } from "../../urban-project/creationSteps";
import { initialState as urbanProjectInitialState } from "../../urban-project/urbanProject.reducer";
import { AnswerSetEvent } from "../form-events/AnswerSetEvent";
import { FormEvent, SerializedAnswerSetEvent } from "../form-events/events.type";
import { completeStep, loadStep } from "../urbanProject.actions";
import { initialState as pocInitialState } from "../urbanProject.reducer";
import { mockSiteData } from "./_siteData.mock";

const createTestState = (
  options: {
    siteData?: ProjectCreationState["siteData"];
    events?: FormEvent[];
    currentStep?: UrbanProjectCustomCreationStep;
  } = {},
): ProjectCreationState => ({
  ...getInitialState(),
  pocUrbanProject: {
    ...pocInitialState,
    events: options.events || [],
    currentStep: options.currentStep || pocInitialState.currentStep,
  },
  siteData: options.siteData || mockSiteData,
  urbanProject: urbanProjectInitialState,
});

const createTestStore = (
  options: {
    siteData?: ProjectCreationState["siteData"];
    events?: FormEvent[];
    currentStep?: UrbanProjectCustomCreationStep;
  } = {},
) => {
  const store = createStore(getTestAppDependencies(), {
    projectCreation: createTestState(options),
  });
  return store;
};

describe("loadStep action", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe("Basic loadStep functionality", () => {
    it("should not add events when loading step without existing answers", () => {
      const initialEvents = store.getState().projectCreation.pocUrbanProject.events;
      expect(initialEvents).toHaveLength(0);

      // Charger une étape qui n'a pas de valeurs par défaut
      store.dispatch(loadStep({ stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION" }));

      const afterLoadEvents = store.getState().projectCreation.pocUrbanProject.events;
      expect(afterLoadEvents).toHaveLength(0);
    });

    it("should generate default answers for steps that have them", () => {
      // Test avec une étape qui génère des valeurs par défaut
      store.dispatch(loadStep({ stepId: "URBAN_PROJECT_NAMING" }));

      const events = store.getState().projectCreation.pocUrbanProject.events;
      expect(events).toHaveLength(1);
      const event = events[0] as SerializedAnswerSetEvent<"URBAN_PROJECT_NAMING">;
      expect(event.stepId).toEqual("URBAN_PROJECT_NAMING");
      expect(event.source).toEqual("system");
      expect(event.type).toEqual("ANSWER_SET");
      expect(event.payload).toEqual({ name: expect.any(String) as string });
    });

    it("should generate default expenses for installation step", () => {
      store.dispatch(loadStep({ stepId: "URBAN_PROJECT_EXPENSES_INSTALLATION" }));

      const events = store.getState().projectCreation.pocUrbanProject.events;
      expect(events).toHaveLength(1);
      const event = events[0] as SerializedAnswerSetEvent<"URBAN_PROJECT_EXPENSES_INSTALLATION">;

      expect(event.stepId).toEqual("URBAN_PROJECT_EXPENSES_INSTALLATION");
      expect(event.source).toEqual("system");
      expect(event.type).toEqual("ANSWER_SET");
      expect(event.payload).toMatchObject({
        installationExpenses: expect.arrayContaining([
          expect.objectContaining({
            purpose: "development_works",
            amount: expect.any(Number) as number,
          }),
          expect.objectContaining({
            purpose: "technical_studies",
            amount: expect.any(Number) as number,
          }),
          expect.objectContaining({
            purpose: "other",
            amount: expect.any(Number) as number,
          }),
        ]) as DevelopmentPlanInstallationExpenses[],
      });
    });

    it("should generate default schedule when loading schedule projection", () => {
      store.dispatch(loadStep({ stepId: "URBAN_PROJECT_SCHEDULE_PROJECTION" }));

      const events = store.getState().projectCreation.pocUrbanProject.events;
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: "ANSWER_SET",
        stepId: "URBAN_PROJECT_SCHEDULE_PROJECTION",
        source: "system",
        payload: {
          installationSchedule: expect.objectContaining({
            startDate: expect.any(String) as string,
            endDate: expect.any(String) as string,
          }) as Schedule,
          firstYearOfOperation: expect.any(Number) as number,
          // reinstatementSchedule devrait être présent car le site est FRICHE
          reinstatementSchedule: expect.objectContaining({
            startDate: expect.any(String) as string,
            endDate: expect.any(String) as string,
          }) as Schedule,
        },
      });
    });

    it("should generate different schedule for non-FRICHE site", () => {
      const storeNonFriche = createTestStore({
        siteData: { ...mockSiteData, nature: "AGRICULTURAL_OPERATION" },
      });

      storeNonFriche.dispatch(loadStep({ stepId: "URBAN_PROJECT_SCHEDULE_PROJECTION" }));

      const events = storeNonFriche.getState().projectCreation.pocUrbanProject.events;
      const event = events[0] as SerializedAnswerSetEvent<"URBAN_PROJECT_SCHEDULE_PROJECTION">;
      expect(event.payload.reinstatementSchedule).toBeUndefined();
      expect(event.payload.installationSchedule).toBeDefined();
    });

    it("should not generate defaults when answers already exist", () => {
      // Pré-remplir avec une réponse existante
      const storeWithExistingAnswer = createTestStore({
        events: [AnswerSetEvent.new("URBAN_PROJECT_NAMING", { name: "Nom existant" }) as FormEvent],
      });

      const initialEvents =
        storeWithExistingAnswer.getState().projectCreation.pocUrbanProject.events;
      expect(initialEvents).toHaveLength(1);

      // Charger l'étape
      storeWithExistingAnswer.dispatch(loadStep({ stepId: "URBAN_PROJECT_NAMING" }));

      // Vérifier qu'aucun nouvel événement n'a été ajouté
      const afterLoadEvents =
        storeWithExistingAnswer.getState().projectCreation.pocUrbanProject.events;
      expect(afterLoadEvents).toHaveLength(1);

      const event = afterLoadEvents[0] as SerializedAnswerSetEvent<"URBAN_PROJECT_NAMING">;
      expect(event.payload.name).toBe("Nom existant");
    });
  });

  describe("Complete step with same default values", () => {
    it("should not add duplicate event when completing with same default values for naming", () => {
      // Charger l'étape pour générer les valeurs par défaut
      store.dispatch(loadStep({ stepId: "URBAN_PROJECT_NAMING" }));

      const afterLoadEvents = store.getState().projectCreation.pocUrbanProject.events;
      expect(afterLoadEvents).toHaveLength(1);
      const event = afterLoadEvents[0] as SerializedAnswerSetEvent<"URBAN_PROJECT_NAMING">;
      const defaultName = event.payload.name;

      // Compléter avec exactement les mêmes valeurs par défaut
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_NAMING",
          answers: { name: defaultName },
        }),
      );

      const afterCompleteEvents = store.getState().projectCreation.pocUrbanProject.events;
      // Un nouvel événement devrait être ajouté car completeStep ajoute toujours un événement
      // (même si les valeurs sont identiques)
      expect(afterCompleteEvents).toHaveLength(1);
      expect(afterCompleteEvents).toBe(afterLoadEvents);
    });

    it("should add event when completing with different values from defaults", () => {
      // Charger l'étape pour générer les valeurs par défaut
      store.dispatch(loadStep({ stepId: "URBAN_PROJECT_NAMING" }));

      const afterLoadEvents = store.getState().projectCreation.pocUrbanProject.events;
      expect(afterLoadEvents).toHaveLength(1);

      // Compléter avec des valeurs différentes
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_NAMING",
          answers: {
            name: "Nom personnalisé",
            description: "Description personnalisée",
          },
        }),
      );

      const afterCompleteEvents = store.getState().projectCreation.pocUrbanProject.events;
      expect(afterCompleteEvents).toHaveLength(2);
      expect(afterCompleteEvents[1]).toMatchObject({
        type: "ANSWER_SET",
        stepId: "URBAN_PROJECT_NAMING",
        source: "user",
        payload: {
          name: "Nom personnalisé",
          description: "Description personnalisée",
        },
      });
    });

    it("should handle complex default values correctly for installation expenses", () => {
      // Charger l'étape pour générer les dépenses par défaut
      store.dispatch(loadStep({ stepId: "URBAN_PROJECT_EXPENSES_INSTALLATION" }));

      const afterLoadEvents = store.getState().projectCreation.pocUrbanProject.events;
      expect(afterLoadEvents).toHaveLength(1);
      const firstEvent =
        afterLoadEvents[0] as SerializedAnswerSetEvent<"URBAN_PROJECT_EXPENSES_INSTALLATION">;
      const defaultExpenses = firstEvent.payload.installationExpenses;

      // Compléter avec les mêmes dépenses par défaut
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_EXPENSES_INSTALLATION",
          answers: { installationExpenses: defaultExpenses },
        }),
      );

      const afterCompleteEvents = store.getState().projectCreation.pocUrbanProject.events;
      expect(afterCompleteEvents).toHaveLength(1);
      expect(afterCompleteEvents).toEqual(afterLoadEvents);
    });

    it("should handle reinstatement expenses with soil distribution context", () => {
      // Pré-remplir les événements nécessaires pour le calcul des dépenses de remise en état
      const storeWithContext = createTestStore({
        events: [
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA",
            payload: {
              spacesCategoriesDistribution: {
                LIVING_AND_ACTIVITY_SPACES: 5000,
                PUBLIC_SPACES: 5000,
              },
            },
            timestamp: Date.now() - 3000,
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
            payload: {
              livingAndActivitySpacesDistribution: {
                BUILDINGS: 2000,
                IMPERMEABLE_SURFACE: 1500,
                PERMEABLE_SURFACE: 1000,
                PRIVATE_GREEN_SPACES: 500,
              },
            },
            timestamp: Date.now() - 2000,
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION",
            payload: {
              publicSpacesDistribution: {
                IMPERMEABLE_SURFACE: 2500,
                PERMEABLE_SURFACE: 1500,
                GRASS_COVERED_SURFACE: 1000,
              },
            },
            timestamp: Date.now() - 1000,
            source: "user",
          },
        ],
      });

      // Charger l'étape de remise en état
      storeWithContext.dispatch(loadStep({ stepId: "URBAN_PROJECT_EXPENSES_REINSTATEMENT" }));

      const afterLoadEvents = storeWithContext.getState().projectCreation.pocUrbanProject.events;
      expect(afterLoadEvents).toHaveLength(4); // 3 pré-existants + 1 nouveau

      const reinstatementEvent =
        afterLoadEvents[3] as SerializedAnswerSetEvent<"URBAN_PROJECT_EXPENSES_REINSTATEMENT">;
      expect(reinstatementEvent).toMatchObject({
        type: "ANSWER_SET",
        stepId: "URBAN_PROJECT_EXPENSES_REINSTATEMENT",
        source: "system",
        payload: {
          reinstatementExpenses: expect.arrayContaining([
            expect.objectContaining({
              purpose: expect.any(String) as ReinstatementExpensePurpose,
              amount: expect.any(Number) as number,
            }),
          ]) as ReinstatementExpense[],
        },
      });
      // Vérifier que les montants sont cohérents (> 0 car il y a des sols à traiter)
      const expenses = reinstatementEvent.payload.reinstatementExpenses ?? [];
      expect(sumListWithKey(expenses, "amount")).toBeGreaterThan(0);
    });
  });

  describe("LoadStep edge cases", () => {
    it("should handle loadStep when siteData is missing", () => {
      const storeWithoutSiteData = createTestStore({
        siteData: { ...mockSiteData, surfaceArea: undefined },
      });

      // Les étapes qui dépendent de siteData ne devraient pas crasher
      expect(() => {
        storeWithoutSiteData.dispatch(loadStep({ stepId: "URBAN_PROJECT_EXPENSES_INSTALLATION" }));
      }).not.toThrow();

      // Mais elles ne devraient pas générer de valeurs par défaut non plus
      const events = storeWithoutSiteData.getState().projectCreation.pocUrbanProject.events;
      expect(events).toHaveLength(0);
    });

    it("should handle loadStep for steps without default logic", () => {
      // Étapes qui n'ont pas de logique de valeurs par défaut
      const stepsWithoutDefaults = [
        "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
        "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
        "URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION",
        "URBAN_PROJECT_PROJECT_PHASE",
      ] as const;

      stepsWithoutDefaults.forEach((stepId) => {
        const testStore = createTestStore();
        testStore.dispatch(loadStep({ stepId: stepId }));

        const events = testStore.getState().projectCreation.pocUrbanProject.events;
        expect(events).toHaveLength(0);
      });
    });

    it("should handle multiple loadStep calls on same step", () => {
      // Premier chargement - génère les valeurs par défaut
      store.dispatch(loadStep({ stepId: "URBAN_PROJECT_NAMING" }));
      expect(store.getState().projectCreation.pocUrbanProject.events).toHaveLength(1);

      // Deuxième chargement - ne devrait pas ajouter d'événement
      store.dispatch(loadStep({ stepId: "URBAN_PROJECT_NAMING" }));
      expect(store.getState().projectCreation.pocUrbanProject.events).toHaveLength(1);

      // Troisième chargement - ne devrait toujours pas ajouter d'événement
      store.dispatch(loadStep({ stepId: "URBAN_PROJECT_NAMING" }));
      expect(store.getState().projectCreation.pocUrbanProject.events).toHaveLength(1);
    });
  });
});
