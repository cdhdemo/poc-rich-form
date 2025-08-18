import { describe, it, expect, beforeEach } from "vitest";

import { createStore } from "@/shared/core/store-config/store";
import { getTestAppDependencies } from "@/test/testAppDependencies";

import { getInitialState, ProjectCreationState } from "../../createProject.reducer";
import { initialState as urbanProjectInitialState } from "../../urban-project/urbanProject.reducer";
import { SerializedAnswerSetEvent } from "../form-events/events.type";
import { completeStep, navigateToNext } from "../urbanProject.actions";
import { initialState as pocInitialState } from "../urbanProject.reducer";
import { mockSiteData } from "./_siteData.mock";

// Helper pour créer un état initial de test
const createInitialTestState = (): ProjectCreationState => ({
  ...getInitialState(),
  pocUrbanProject: pocInitialState,
  siteData: mockSiteData,
  urbanProject: urbanProjectInitialState,
});

// Helper pour configurer le store de test
const createTestStore = (initialState?: ProjectCreationState) => {
  const testState = {
    ...createInitialTestState(),
    ...initialState,
  };

  const store = createStore(getTestAppDependencies(), { projectCreation: testState });
  return store;
};

describe("urbanProject.reducer", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe("Complete workflow from start to finish", () => {
    it("should navigate through all steps correctly", () => {
      const state = store.getState().projectCreation;

      // Étape 1: URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION
      expect(state.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION",
      );

      // Navigation vers l'étape suivante
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
      );

      // Étape 2: URBAN_PROJECT_SPACES_CATEGORIES_SELECTION
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
          answers: {
            spacesCategories: ["LIVING_AND_ACTIVITY_SPACES", "PUBLIC_SPACES", "GREEN_SPACES"],
          },
        }),
      );

      let currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.events).toHaveLength(1);
      expect(currentState.pocUrbanProject.events[0]?.type).toBe("ANSWER_SET");
      expect(currentState.pocUrbanProject.events[0]?.stepId).toBe(
        "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
      );
      expect(currentState.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA",
      );

      // Étape 3: URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA",
          answers: {
            spacesCategoriesDistribution: {
              LIVING_AND_ACTIVITY_SPACES: 4000,
              PUBLIC_SPACES: 3000,
              GREEN_SPACES: 3000,
            },
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.events).toHaveLength(2);
      expect(currentState.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SPACES_DEVELOPMENT_PLAN_INTRODUCTION",
      );

      // Navigation vers l'introduction
      store.dispatch(
        navigateToNext({ stepId: "URBAN_PROJECT_SPACES_DEVELOPMENT_PLAN_INTRODUCTION" }),
      );
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_INTRODUCTION",
      );

      // Navigation vers l'introduction des espaces résidentiels
      store.dispatch(
        navigateToNext({ stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_INTRODUCTION" }),
      );
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
      );

      // Étape 4: URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
          answers: {
            livingAndActivitySpacesDistribution: {
              BUILDINGS: 2000,
              IMPERMEABLE_SURFACE: 1000,
              PERMEABLE_SURFACE: 500,
              PRIVATE_GREEN_SPACES: 500,
            },
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.events).toHaveLength(3);
      expect(currentState.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_PUBLIC_SPACES_INTRODUCTION",
      );

      // Navigation vers les espaces publics
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_PUBLIC_SPACES_INTRODUCTION" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION",
      );

      // Étape 5: URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION",
          answers: {
            publicSpacesDistribution: {
              IMPERMEABLE_SURFACE: 1500,
              PERMEABLE_SURFACE: 1000,
              GRASS_COVERED_SURFACE: 500,
            },
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_GREEN_SPACES_INTRODUCTION",
      );

      // Navigation vers les espaces verts
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_GREEN_SPACES_INTRODUCTION" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_GREEN_SPACES_SURFACE_AREA_DISTRIBUTION",
      );

      // Étape 6: URBAN_PROJECT_GREEN_SPACES_SURFACE_AREA_DISTRIBUTION
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_GREEN_SPACES_SURFACE_AREA_DISTRIBUTION",
          answers: {
            greenSpacesDistribution: {
              LAWNS_AND_BUSHES: 1500,
              TREE_FILLED_SPACE: 1000,
              PAVED_ALLEY: 300,
              GRAVEL_ALLEY: 200,
            },
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe("URBAN_PROJECT_SPACES_SOILS_SUMMARY");

      // Navigation vers le résumé des sols
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_SPACES_SOILS_SUMMARY" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SOILS_CARBON_SUMMARY",
      );

      // Navigation vers le résumé carbone
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_SOILS_CARBON_SUMMARY" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SOILS_DECONTAMINATION_INTRODUCTION",
      );

      // Navigation vers l'introduction décontamination
      store.dispatch(
        navigateToNext({ stepId: "URBAN_PROJECT_SOILS_DECONTAMINATION_INTRODUCTION" }),
      );
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION",
      );

      // Étape 7: URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION",
          answers: {
            decontaminationPlan: "partial",
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA",
      );

      // Étape 8: URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA",
          answers: {
            decontaminatedSurfaceArea: 1500,
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe("URBAN_PROJECT_BUILDINGS_INTRODUCTION");

      // Navigation vers l'introduction des bâtiments
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_BUILDINGS_INTRODUCTION" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_BUILDINGS_FLOOR_SURFACE_AREA",
      );

      // Étape 9: URBAN_PROJECT_BUILDINGS_FLOOR_SURFACE_AREA
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_BUILDINGS_FLOOR_SURFACE_AREA",
          answers: {
            buildingsFloorSurfaceArea: 4000,
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_BUILDINGS_USE_INTRODUCTION",
      );

      // Navigation vers l'introduction de l'utilisation des bâtiments
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_BUILDINGS_USE_INTRODUCTION" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_BUILDINGS_USE_SURFACE_AREA_DISTRIBUTION",
      );

      // Étape 10: URBAN_PROJECT_BUILDINGS_USE_SURFACE_AREA_DISTRIBUTION
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_BUILDINGS_USE_SURFACE_AREA_DISTRIBUTION",
          answers: {
            buildingsUsesDistribution: {
              RESIDENTIAL: 2500,
              LOCAL_STORE: 1000,
              OFFICES: 500,
            },
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_STAKEHOLDERS_INTRODUCTION",
      );

      // Navigation vers l'introduction des parties prenantes
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_STAKEHOLDERS_INTRODUCTION" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_STAKEHOLDERS_PROJECT_DEVELOPER",
      );

      // Étape 11: URBAN_PROJECT_STAKEHOLDERS_PROJECT_DEVELOPER
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_STAKEHOLDERS_PROJECT_DEVELOPER",
          answers: {
            projectDeveloper: {
              name: "Promoteur Test",
              structureType: "company",
            },
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_STAKEHOLDERS_REINSTATEMENT_CONTRACT_OWNER",
      );

      // Étape 12: URBAN_PROJECT_STAKEHOLDERS_REINSTATEMENT_CONTRACT_OWNER
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_STAKEHOLDERS_REINSTATEMENT_CONTRACT_OWNER",
          answers: {
            reinstatementContractOwner: {
              name: "Entreprise de Remise en État",
              structureType: "company",
            },
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SITE_RESALE_INTRODUCTION",
      );

      // Navigation vers l'introduction de revente du site
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_SITE_RESALE_INTRODUCTION" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SITE_RESALE_SELECTION",
      );

      // Étape 13: URBAN_PROJECT_SITE_RESALE_SELECTION
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_SITE_RESALE_SELECTION",
          answers: {
            siteResalePlannedAfterDevelopment: true,
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_BUILDINGS_RESALE_SELECTION",
      );

      // Étape 14: URBAN_PROJECT_BUILDINGS_RESALE_SELECTION
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_BUILDINGS_RESALE_SELECTION",
          answers: {
            buildingsResalePlannedAfterDevelopment: true,
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe("URBAN_PROJECT_EXPENSES_INTRODUCTION");

      // Navigation vers l'introduction des dépenses
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_EXPENSES_INTRODUCTION" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_EXPENSES_SITE_PURCHASE_AMOUNTS",
      );

      // Étape 15: URBAN_PROJECT_EXPENSES_SITE_PURCHASE_AMOUNTS
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_EXPENSES_SITE_PURCHASE_AMOUNTS",
          answers: {
            sitePurchaseSellingPrice: 500000,
            sitePurchasePropertyTransferDuties: 50000,
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe("URBAN_PROJECT_EXPENSES_REINSTATEMENT");

      // Étape 16: URBAN_PROJECT_EXPENSES_REINSTATEMENT
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_EXPENSES_REINSTATEMENT",
          answers: {
            reinstatementExpenses: [
              { purpose: "demolition", amount: 100000 },
              { purpose: "remediation", amount: 200000 },
            ],
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe("URBAN_PROJECT_EXPENSES_INSTALLATION");

      // Étape 17: URBAN_PROJECT_EXPENSES_INSTALLATION
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_EXPENSES_INSTALLATION",
          answers: {
            installationExpenses: [
              { purpose: "development_works", amount: 800000 },
              { purpose: "technical_studies", amount: 50000 },
            ],
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe("URBAN_PROJECT_REVENUE_INTRODUCTION");

      // Navigation vers l'introduction des revenus
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_REVENUE_INTRODUCTION" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_REVENUE_EXPECTED_SITE_RESALE",
      );

      // Étape 18: URBAN_PROJECT_REVENUE_EXPECTED_SITE_RESALE
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_REVENUE_EXPECTED_SITE_RESALE",
          answers: {
            siteResaleExpectedSellingPrice: 1000000,
            siteResaleExpectedPropertyTransferDuties: 80000,
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_REVENUE_BUILDINGS_RESALE",
      );

      // Étape 19: URBAN_PROJECT_REVENUE_BUILDINGS_RESALE
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_REVENUE_BUILDINGS_RESALE",
          answers: {
            buildingsResaleSellingPrice: 2000000,
            buildingsResalePropertyTransferDuties: 150000,
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_REVENUE_FINANCIAL_ASSISTANCE",
      );

      // Étape 20: URBAN_PROJECT_REVENUE_FINANCIAL_ASSISTANCE
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_REVENUE_FINANCIAL_ASSISTANCE",
          answers: {
            financialAssistanceRevenues: [{ source: "public_subsidies", amount: 200000 }],
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe("URBAN_PROJECT_SCHEDULE_INTRODUCTION");

      // Navigation vers l'introduction de planification
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_SCHEDULE_INTRODUCTION" }));
      expect(store.getState().projectCreation.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SCHEDULE_PROJECTION",
      );

      // Étape 21: URBAN_PROJECT_SCHEDULE_PROJECTION
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_SCHEDULE_PROJECTION",
          answers: {
            reinstatementSchedule: {
              startDate: "2024-01-01",
              endDate: "2024-06-30",
            },
            installationSchedule: {
              startDate: "2024-07-01",
              endDate: "2025-12-31",
            },
            firstYearOfOperation: 2026,
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe("URBAN_PROJECT_PROJECT_PHASE");

      // Étape 22: URBAN_PROJECT_PROJECT_PHASE
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_PROJECT_PHASE",
          answers: {
            projectPhase: "planning",
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe("URBAN_PROJECT_NAMING");

      // Étape 23: URBAN_PROJECT_NAMING
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_NAMING",
          answers: {
            name: "Projet Urbain Test",
            description: "Description du projet de test",
          },
        }),
      );

      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe("URBAN_PROJECT_FINAL_SUMMARY");

      // Navigation finale vers le résultat
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_FINAL_SUMMARY" }));

      // Vérification finale
      currentState = store.getState().projectCreation;
      expect(currentState.pocUrbanProject.currentStep).toBe("URBAN_PROJECT_CREATION_RESULT");

      // Vérification que tous les événements ont été enregistrés
      expect(currentState.pocUrbanProject.events.length).toBeGreaterThan(20);

      // Vérification que chaque événement a la bonne structure
      currentState.pocUrbanProject.events.forEach((event) => {
        expect(event).toHaveProperty("type", "ANSWER_SET");
        expect(event).toHaveProperty("stepId");
        expect(event).toHaveProperty("timestamp");
        expect(event).toHaveProperty("source");
        expect(event).toHaveProperty("payload");
      });
    });

    it("should handle single category shortcut correctly", () => {
      // Navigation vers la sélection des catégories
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION" }));

      // Sélection d'une seule catégorie pour tester le raccourci
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
          answers: {
            spacesCategories: ["LIVING_AND_ACTIVITY_SPACES"],
          },
        }),
      );

      const currentState = store.getState().projectCreation;

      // Vérification que le raccourci a fonctionné
      expect(currentState.pocUrbanProject.currentStep).toBe(
        "URBAN_PROJECT_SPACES_DEVELOPMENT_PLAN_INTRODUCTION",
      );

      // Vérification que deux événements ont été créés (sélection + surface par défaut)
      expect(currentState.pocUrbanProject.events).toHaveLength(2);
      expect(currentState.pocUrbanProject.events[1]?.stepId).toBe(
        "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA",
      );
    });

    it('should handle decontamination plan "none" correctly', () => {
      // Navigation rapide vers la sélection de décontamination
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION" }));

      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
          answers: { spacesCategories: ["LIVING_AND_ACTIVITY_SPACES"] },
        }),
      );

      // Naviguer jusqu'à la décontamination
      store.dispatch(
        navigateToNext({ stepId: "URBAN_PROJECT_SPACES_DEVELOPMENT_PLAN_INTRODUCTION" }),
      );
      store.dispatch(
        navigateToNext({ stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_INTRODUCTION" }),
      );

      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
          answers: {
            livingAndActivitySpacesDistribution: { BUILDINGS: 2000 },
          },
        }),
      );

      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_SPACES_SOILS_SUMMARY" }));
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_SOILS_CARBON_SUMMARY" }));
      store.dispatch(
        navigateToNext({ stepId: "URBAN_PROJECT_SOILS_DECONTAMINATION_INTRODUCTION" }),
      );

      // Test avec plan de décontamination "none"
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION",
          answers: {
            decontaminationPlan: "none",
          },
        }),
      );

      const currentState = store.getState().projectCreation;

      // Vérification que l'étape suivante est directement les bâtiments
      expect(currentState.pocUrbanProject.currentStep).toBe("URBAN_PROJECT_BUILDINGS_INTRODUCTION");

      // Vérification qu'un événement de surface décontaminée = 0 a été créé automatiquement
      const decontaminationSurfaceEvent = currentState.pocUrbanProject.events.find(
        (
          event,
        ): event is SerializedAnswerSetEvent<"URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA"> =>
          event.stepId === "URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA" &&
          event.type === "ANSWER_SET",
      );
      expect(decontaminationSurfaceEvent).toBeDefined();
      expect(decontaminationSurfaceEvent?.payload.decontaminatedSurfaceArea).toBe(0);
    });
  });

  describe("Edge cases and error handling", () => {
    it("should preserve existing events when adding new ones", () => {
      // Ajouter un premier événement
      store.dispatch(navigateToNext({ stepId: "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION" }));
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION",
          answers: { spacesCategories: ["LIVING_AND_ACTIVITY_SPACES"] },
        }),
      );

      const firstState = store.getState().projectCreation;
      const firstEventTimestamp = firstState.pocUrbanProject.events[0]?.timestamp;

      // Ajouter un deuxième événement
      store.dispatch(
        navigateToNext({ stepId: "URBAN_PROJECT_SPACES_DEVELOPMENT_PLAN_INTRODUCTION" }),
      );
      store.dispatch(
        navigateToNext({ stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_INTRODUCTION" }),
      );
      store.dispatch(
        completeStep({
          stepId: "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
          answers: { livingAndActivitySpacesDistribution: { BUILDINGS: 1000 } },
        }),
      );

      const secondState = store.getState().projectCreation;

      // Vérification que les deux événements sont présents
      expect(secondState.pocUrbanProject.events).toHaveLength(3); // 2 du shortcut + 1 nouveau
      expect(secondState.pocUrbanProject.events[0]?.timestamp).toBe(firstEventTimestamp);
    });
  });
});
