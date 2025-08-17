import { SiteNature } from "shared";
import { describe, it, expect } from "vitest";

import { createStore } from "@/shared/core/store-config/store";
import { getTestAppDependencies } from "@/test/testAppDependencies";

import { getInitialState, ProjectCreationState } from "../../createProject.reducer";
import { UrbanProjectCustomCreationStep } from "../../urban-project/creationSteps";
import { initialState as urbanProjectInitialState } from "../../urban-project/urbanProject.reducer";
import { FormEvent } from "../form-events/events.type";
import { completeStep, navigateToNext, navigateToPrevious } from "../urbanProject.actions";
import { initialState as pocInitialState } from "../urbanProject.reducer";
import { mockSiteData } from "./_siteData.mock";

// Données de test pour différents scénarios
const testScenarios = {
  withBuildingsAndContamination: mockSiteData,
  withoutContamination: {
    ...mockSiteData,
    hasContaminatedSoils: false,
  },
  nonFriche: {
    ...mockSiteData,
    nature: "AGRICULTURAL_OPERATION" as SiteNature,
  },
  withoutBuildingsOrContamination: {
    ...mockSiteData,
    hasContaminatedSoils: false,
    nature: "AGRICULTURAL_OPERATION" as SiteNature,
  },
};

// Helper pour créer un état de test
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

// Helper pour créer le store
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

describe("urbanProject.reducer - Navigation Consistency Tests", () => {
  describe("Previous/Next consistency for each step", () => {
    it("should have consistent navigation for URBAN_PROJECT_SPACES_CATEGORIES_SELECTION", () => {
      const store = createTestStore();

      // Aller à l'étape de sélection
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
      );

      // Aller en arrière
      store.dispatch(navigateToPrevious({ stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION",
      );

      // Revenir en avant
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
      );
    });

    it("should have consistent navigation for URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA", () => {
      const store = createTestStore();

      // Aller jusqu'à l'étape de surface
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION" }));
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
          answers: { spacesCategories: ["LIVING_AND_ACTIVITY_SPACES", "PUBLIC_SPACES"] },
        }),
      );

      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA",
      );

      // Aller en arrière
      store.dispatch(
        navigateToPrevious({ stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA" }),
      );
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
      );
    });

    it("should handle conditional navigation for buildings introduction", () => {
      // Test avec bâtiments et contamination
      const storeWithBuildings = createTestStore({
        siteData: testScenarios.withBuildingsAndContamination,
        events: [
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
            payload: { spacesCategories: ["LIVING_AND_ACTIVITY_SPACES"] },
            timestamp: Date.now(),
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA",
            payload: { spacesCategoriesDistribution: { LIVING_AND_ACTIVITY_SPACES: 10000 } },
            timestamp: Date.now(),
            source: "system",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
            payload: { livingAndActivitySpacesDistribution: { BUILDINGS: 2000 } },
            timestamp: Date.now(),
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION",
            payload: { decontaminationPlan: "partial" },
            timestamp: Date.now(),
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA",
            payload: { decontaminatedSurfaceArea: 1500 },
            timestamp: Date.now(),
            source: "user",
          },
        ],
        currentStep: "URBAN_PROJECT_BUILDINGS_INTRODUCTION",
      });

      // Aller en arrière depuis l'introduction des bâtiments
      storeWithBuildings.dispatch(
        navigateToPrevious({ stepId: "URBAN_PROJECT_BUILDINGS_INTRODUCTION" }),
      );
      expect(storeWithBuildings.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA",
      );

      // Test avec bâtiments mais sans contamination
      const storeWithoutContamination = createTestStore({
        siteData: testScenarios.withoutContamination,
        events: [
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
            payload: { livingAndActivitySpacesDistribution: { BUILDINGS: 2000 } },
            timestamp: Date.now(),
            source: "user",
          },
        ],
        currentStep: "URBAN_PROJECT_SOILS_CARBON_SUMMARY",
      });

      storeWithoutContamination.dispatch(
        navigateToNext({ stepId: "URBAN_PROJECT_SOILS_CARBON_SUMMARY" }),
      );
      expect(storeWithoutContamination.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_BUILDINGS_INTRODUCTION",
      );

      storeWithoutContamination.dispatch(
        navigateToPrevious({ stepId: "URBAN_PROJECT_BUILDINGS_INTRODUCTION" }),
      );
      expect(storeWithoutContamination.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SOILS_CARBON_SUMMARY",
      );
    });

    it("should handle stakeholders navigation based on site nature", () => {
      // Test avec site FRICHE
      const storeFriche = createTestStore({
        siteData: testScenarios.withBuildingsAndContamination,
        events: [
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
            payload: { livingAndActivitySpacesDistribution: { BUILDINGS: 2000 } },
            timestamp: Date.now(),
            source: "user",
          },
        ],
        currentStep: "URBAN_PROJECT_STAKEHOLDERS_INTRODUCTION",
      });

      storeFriche.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_STAKEHOLDERS_INTRODUCTION" }));
      expect(storeFriche.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_STAKEHOLDERS_PROJECT_DEVELOPER",
      );

      // Compléter project developer
      storeFriche.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_STAKEHOLDERS_PROJECT_DEVELOPER",
          answers: { projectDeveloper: { name: "Test", structureType: "company" } },
        }),
      );
      expect(storeFriche.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_STAKEHOLDERS_REINSTATEMENT_CONTRACT_OWNER",
      );

      // Aller en arrière
      storeFriche.dispatch(
        navigateToPrevious({ stepId: "URBAN_PROJECT_STAKEHOLDERS_REINSTATEMENT_CONTRACT_OWNER" }),
      );
      expect(storeFriche.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_STAKEHOLDERS_PROJECT_DEVELOPER",
      );

      // Test avec site non-FRICHE
      const storeNonFriche = createTestStore({
        siteData: testScenarios.nonFriche,
        events: [
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
            payload: { livingAndActivitySpacesDistribution: { BUILDINGS: 0 } },
            timestamp: Date.now(),
            source: "user",
          },
        ],
        currentStep: "URBAN_PROJECT_STAKEHOLDERS_INTRODUCTION",
      });

      storeNonFriche.dispatch(
        navigateToNext({ stepId: "URBAN_PROJECT_STAKEHOLDERS_INTRODUCTION" }),
      );
      storeNonFriche.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_STAKEHOLDERS_PROJECT_DEVELOPER",
          answers: { projectDeveloper: { name: "Test", structureType: "company" } },
        }),
      );

      // Pour un site non-FRICHE, on va directement à la revente
      expect(storeNonFriche.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SITE_RESALE_INTRODUCTION",
      );
    });

    it("should handle expenses navigation based on site nature", () => {
      // Test navigation des dépenses avec site FRICHE
      const storeFriche = createTestStore({
        siteData: testScenarios.withBuildingsAndContamination,
        events: [
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_STAKEHOLDERS_PROJECT_DEVELOPER",
            payload: { projectDeveloper: { name: "Test", structureType: "company" } },
            timestamp: Date.now(),
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_STAKEHOLDERS_REINSTATEMENT_CONTRACT_OWNER",
            payload: { reinstatementContractOwner: { name: "Test2", structureType: "company" } },
            timestamp: Date.now(),
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_SITE_RESALE_SELECTION",
            payload: { siteResalePlannedAfterDevelopment: true },
            timestamp: Date.now(),
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_BUILDINGS_RESALE_SELECTION",
            payload: { buildingsResalePlannedAfterDevelopment: false },
            timestamp: Date.now(),
            source: "user",
          },
        ],
        currentStep: "URBAN_PROJECT_EXPENSES_SITE_PURCHASE_AMOUNTS",
      });

      // Compléter l'achat du site
      storeFriche.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_EXPENSES_SITE_PURCHASE_AMOUNTS",
          answers: { sitePurchaseSellingPrice: 500000, sitePurchasePropertyTransferDuties: 50000 },
        }),
      );

      // Pour un site FRICHE, on va à la remise en état
      expect(storeFriche.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_EXPENSES_REINSTATEMENT",
      );

      // Vérification de la navigation inverse
      storeFriche.dispatch(navigateToPrevious({ stepId: "URBAN_PROJECT_EXPENSES_REINSTATEMENT" }));
      expect(storeFriche.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_EXPENSES_SITE_PURCHASE_AMOUNTS",
      );

      // Test avec site non-FRICHE
      const storeNonFriche = createTestStore({
        siteData: testScenarios.nonFriche,
        currentStep: "URBAN_PROJECT_EXPENSES_SITE_PURCHASE_AMOUNTS",
      });

      storeNonFriche.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_EXPENSES_SITE_PURCHASE_AMOUNTS",
          answers: { sitePurchaseSellingPrice: 500000 },
        }),
      );

      // Pour un site non-FRICHE, on va directement à l'installation
      expect(storeNonFriche.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_EXPENSES_INSTALLATION",
      );
    });

    it("should handle revenue navigation based on building and site resale decisions", () => {
      const store = createTestStore({
        events: [
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
            payload: { livingAndActivitySpacesDistribution: { BUILDINGS: 2000 } },
            timestamp: Date.now(),
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_SITE_RESALE_SELECTION",
            payload: { siteResalePlannedAfterDevelopment: true },
            timestamp: Date.now(),
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_BUILDINGS_RESALE_SELECTION",
            payload: { buildingsResalePlannedAfterDevelopment: false },
            timestamp: Date.now(),
            source: "user",
          },
        ],
        currentStep: "URBAN_PROJECT_REVENUE_EXPECTED_SITE_RESALE",
      });

      // Compléter la revente attendue du site
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_REVENUE_EXPECTED_SITE_RESALE",
          answers: { siteResaleExpectedSellingPrice: 1000000 },
        }),
      );

      // Avec bâtiments mais sans revente de bâtiments, on va aux revenus d'opération
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_REVENUE_BUILDINGS_OPERATIONS_YEARLY_REVENUES",
      );

      // Test de navigation inverse
      store.dispatch(
        navigateToPrevious({
          stepId: "URBAN_PROJECT_REVENUE_BUILDINGS_OPERATIONS_YEARLY_REVENUES",
        }),
      );
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_REVENUE_EXPECTED_SITE_RESALE",
      );
    });

    it("should handle complex conditional navigation for green spaces", () => {
      const store = createTestStore({
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
            timestamp: Date.now(),
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
            payload: { livingAndActivitySpacesDistribution: { BUILDINGS: 2000 } },
            timestamp: Date.now(),
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION",
            payload: { publicSpacesDistribution: { IMPERMEABLE_SURFACE: 2000 } },
            timestamp: Date.now(),
            source: "user",
          },
        ],
        currentStep: "URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION",
      });

      // Compléter la distribution des espaces publics
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION",
          answers: {
            publicSpacesDistribution: { IMPERMEABLE_SURFACE: 3000, PERMEABLE_SURFACE: 2000 },
          },
        }),
      );

      // Sans espaces verts, on va directement au résumé des sols
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SPACES_SOILS_SUMMARY",
      );

      // Test de navigation inverse
      store.dispatch(navigateToPrevious({ stepId: "URBAN_PROJECT_SPACES_SOILS_SUMMARY" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION",
      );
    });
  });

  describe("Bidirectional navigation consistency", () => {
    it.each([
      {
        name: "Full workflow with buildings and contamination",
        siteData: testScenarios.withBuildingsAndContamination,
        steps: [
          "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION",
          "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
          "URBAN_PROJECT_SPACES_DEVELOPMENT_PLAN_INTRODUCTION",
          "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_INTRODUCTION",
          "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
          "URBAN_PROJECT_SPACES_SOILS_SUMMARY",
          "URBAN_PROJECT_SOILS_CARBON_SUMMARY",
          "URBAN_PROJECT_SOILS_DECONTAMINATION_INTRODUCTION",
          "URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION",
          "URBAN_PROJECT_BUILDINGS_INTRODUCTION",
          "URBAN_PROJECT_BUILDINGS_FLOOR_SURFACE_AREA",
          "URBAN_PROJECT_BUILDINGS_USE_INTRODUCTION",
          "URBAN_PROJECT_BUILDINGS_USE_SURFACE_AREA_DISTRIBUTION",
          "URBAN_PROJECT_STAKEHOLDERS_INTRODUCTION",
        ] as const,
      },
      {
        name: "Without contamination",
        siteData: testScenarios.withoutContamination,
        steps: [
          "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION",
          "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
          "URBAN_PROJECT_SPACES_DEVELOPMENT_PLAN_INTRODUCTION",
          "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_INTRODUCTION",
          "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
          "URBAN_PROJECT_SPACES_SOILS_SUMMARY",
          "URBAN_PROJECT_SOILS_CARBON_SUMMARY",
          "URBAN_PROJECT_BUILDINGS_INTRODUCTION",
        ] as const,
      },
    ])(
      "should maintain consistency in bidirectional navigation for : $name",
      ({ siteData, steps }) => {
        const store = createTestStore({ siteData });

        steps.forEach((currentStep, index) => {
          const nextStep = steps[index + 1];
          if (!nextStep) {
            return;
          }

          switch (currentStep) {
            case "URBAN_PROJECT_BUILDINGS_INTRODUCTION":
            case "URBAN_PROJECT_SOILS_CARBON_SUMMARY":
            case "URBAN_PROJECT_SPACES_SOILS_SUMMARY":
            case "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION":
            case "URBAN_PROJECT_SPACES_DEVELOPMENT_PLAN_INTRODUCTION":
            case "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_INTRODUCTION":
            case "URBAN_PROJECT_SOILS_DECONTAMINATION_INTRODUCTION":
            case "URBAN_PROJECT_BUILDINGS_USE_INTRODUCTION":
            case "URBAN_PROJECT_STAKEHOLDERS_INTRODUCTION":
              store.dispatch(navigateToNext({ stepId: currentStep }));
              break;
            case "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION":
              store.dispatch(
                completeStep({
                  stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
                  answers: { spacesCategories: ["LIVING_AND_ACTIVITY_SPACES"] },
                }),
              );
              break;
            case "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION":
              store.dispatch(
                completeStep({
                  stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
                  answers: { livingAndActivitySpacesDistribution: { BUILDINGS: 500 } },
                }),
              );
              break;

            case "URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION":
              store.dispatch(
                completeStep({
                  stepId: "URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION",
                  answers: { decontaminationPlan: "none" },
                }),
              );
              break;

            case "URBAN_PROJECT_BUILDINGS_FLOOR_SURFACE_AREA":
              store.dispatch(
                completeStep({
                  stepId: "URBAN_PROJECT_BUILDINGS_FLOOR_SURFACE_AREA",
                  answers: {
                    buildingsFloorSurfaceArea: 1000,
                  },
                }),
              );
              break;
            case "URBAN_PROJECT_BUILDINGS_USE_SURFACE_AREA_DISTRIBUTION":
              store.dispatch(
                completeStep({
                  stepId: "URBAN_PROJECT_BUILDINGS_USE_SURFACE_AREA_DISTRIBUTION",
                  answers: {
                    buildingsUsesDistribution: { RESIDENTIAL: 1000 },
                  },
                }),
              );
          }

          expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(nextStep);
        });

        // Navigation arrière complète
        for (let i = steps.length - 1; i > 0; i--) {
          const currentStep = steps[i] as UrbanProjectCustomCreationStep;
          const previousStep = steps[i - 1] as UrbanProjectCustomCreationStep;

          store.dispatch(navigateToPrevious({ stepId: currentStep }));
          expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(previousStep);
        }
      },
    );

    it("should handle edge cases in navigation consistency", () => {
      // Test du cas où on navigue vers previous depuis une étape sans événements
      const store = createTestStore();

      // Aller à une étape intermédiaire
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION" }));

      // Essayer de revenir en arrière puis en avant
      store.dispatch(navigateToPrevious({ stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION",
      );

      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
      );
    });

    it("should handle navigation with pre-existing events correctly", () => {
      // Test avec des événements pré-existants
      const store = createTestStore({
        events: [
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
            payload: { spacesCategories: ["LIVING_AND_ACTIVITY_SPACES"] },
            timestamp: Date.now(),
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA",
            payload: { spacesCategoriesDistribution: { LIVING_AND_ACTIVITY_SPACES: 10000 } },
            timestamp: Date.now(),
            source: "system",
          },
        ],
        currentStep: "URBAN_PROJECT_SPACES_DEVELOPMENT_PLAN_INTRODUCTION",
      });

      // Navigation avant
      store.dispatch(
        navigateToNext({ stepId: "URBAN_PROJECT_SPACES_DEVELOPMENT_PLAN_INTRODUCTION" }),
      );
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_INTRODUCTION",
      );

      // Navigation arrière
      store.dispatch(
        navigateToPrevious({
          stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_INTRODUCTION",
        }),
      );
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SPACES_DEVELOPMENT_PLAN_INTRODUCTION",
      );

      // Vérifier que les événements pré-existants sont toujours là
      expect(store.getState().projectCreation.pocUrbanProject.events).toHaveLength(2);
    });

    it("should handle decontamination navigation edge cases", () => {
      // Test avec plan de décontamination "none"
      const storeNone = createTestStore({
        siteData: testScenarios.withBuildingsAndContamination,
        events: [
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
            payload: { livingAndActivitySpacesDistribution: { BUILDINGS: 2000 } },
            timestamp: Date.now(),
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION",
            payload: { decontaminationPlan: "none" },
            timestamp: Date.now(),
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA",
            payload: { decontaminatedSurfaceArea: 0 },
            timestamp: Date.now(),
            source: "system",
          },
        ],
        currentStep: "URBAN_PROJECT_BUILDINGS_INTRODUCTION",
      });

      // Navigation arrière depuis buildings introduction
      storeNone.dispatch(navigateToPrevious({ stepId: "URBAN_PROJECT_BUILDINGS_INTRODUCTION" }));
      expect(storeNone.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION",
      );

      // Test avec plan de décontamination "unknown"
      const storeUnknown = createTestStore({
        siteData: testScenarios.withBuildingsAndContamination,
        events: [
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
            payload: { livingAndActivitySpacesDistribution: { BUILDINGS: 2000 } },
            timestamp: Date.now(),
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION",
            payload: { decontaminationPlan: "unknown" },
            timestamp: Date.now(),
            source: "user",
          },
          {
            type: "ANSWER_SET",
            stepId: "URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA",
            payload: { decontaminatedSurfaceArea: 500 },
            timestamp: Date.now(),
            source: "system",
          },
        ],
        currentStep: "URBAN_PROJECT_BUILDINGS_INTRODUCTION",
      });

      storeUnknown.dispatch(navigateToPrevious({ stepId: "URBAN_PROJECT_BUILDINGS_INTRODUCTION" }));
      expect(storeUnknown.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION",
      );
    });
  });
});
