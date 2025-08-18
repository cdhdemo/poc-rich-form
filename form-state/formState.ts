import { filterObject } from "shared";

import {
  getUrbanProjectSoilsDistributionFromSpaces,
  UrbanSpacesByCategory,
} from "../../urban-project/urbanProjectSoils";
import {
  FormEvent,
  SerializedAnswerSetEvent,
  SerializedAnswerDeletionEvent,
} from "../form-events/events.type";
import { StepAnswers } from "../steps.types";

export const FormState = {
  getStepAnswers<K extends keyof StepAnswers>(events: FormEvent[], stepId: K) {
    const sortedEvents = events.slice().sort((x, y) => y.timestamp - x.timestamp);
    const event = sortedEvents.find(
      (e): e is SerializedAnswerSetEvent<K> | SerializedAnswerDeletionEvent<K> =>
        e.stepId === stepId,
    );
    if (event && event.type === "ANSWER_SET") {
      return event.payload;
    }
    return undefined;
  },

  hasLastAnswerFromSystem(events: FormEvent[], stepId: keyof StepAnswers) {
    const sortedEvents = events.slice().sort((x, y) => y.timestamp - x.timestamp);
    const event = sortedEvents.find((e) => e.stepId === stepId);
    if (event && event.type === "ANSWER_SET") {
      return event.source === "system";
    }
    return false;
  },

  hasBuildings(events: FormEvent[]) {
    const livingAndActivitySpacesDistribution = FormState.getStepAnswers(
      events,
      "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
    )?.livingAndActivitySpacesDistribution;

    return (
      livingAndActivitySpacesDistribution?.BUILDINGS &&
      livingAndActivitySpacesDistribution.BUILDINGS > 0
    );
  },

  hasBuildingsResalePlannedAfterDevelopment(events: FormEvent[]) {
    const buildingsResalePlannedAfterDevelopment = FormState.getStepAnswers(
      events,
      "URBAN_PROJECT_BUILDINGS_RESALE_SELECTION",
    )?.buildingsResalePlannedAfterDevelopment;
    return buildingsResalePlannedAfterDevelopment;
  },

  getProjectSoilDistribution(events: FormEvent[]) {
    const spacesCategoriesDistribution = FormState.getStepAnswers(
      events,
      "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA",
    )?.spacesCategoriesDistribution;

    const publicSpacesDistribution = FormState.getStepAnswers(
      events,
      "URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION",
    )?.publicSpacesDistribution;

    const greenSpacesDistribution = FormState.getStepAnswers(
      events,
      "URBAN_PROJECT_GREEN_SPACES_SURFACE_AREA_DISTRIBUTION",
    )?.greenSpacesDistribution;

    const livingAndActivitySpacesDistribution = FormState.getStepAnswers(
      events,
      "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
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
  },

  getSpacesDistribution(events: FormEvent[]) {
    const publicSpacesDistribution = FormState.getStepAnswers(
      events,
      "URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION",
    )?.publicSpacesDistribution;

    const greenSpacesDistribution = FormState.getStepAnswers(
      events,
      "URBAN_PROJECT_GREEN_SPACES_SURFACE_AREA_DISTRIBUTION",
    )?.greenSpacesDistribution;

    const livingAndActivitySpacesDistribution = FormState.getStepAnswers(
      events,
      "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
    )?.livingAndActivitySpacesDistribution;

    const publicGreenSpaces =
      (greenSpacesDistribution?.URBAN_POND_OR_LAKE ?? 0) +
      (greenSpacesDistribution?.LAWNS_AND_BUSHES ?? 0) +
      (greenSpacesDistribution?.TREE_FILLED_SPACE ?? 0);

    return filterObject(
      {
        BUILDINGS_FOOTPRINT: livingAndActivitySpacesDistribution?.BUILDINGS,
        PRIVATE_PAVED_ALLEY_OR_PARKING_LOT:
          livingAndActivitySpacesDistribution?.IMPERMEABLE_SURFACE,
        PRIVATE_GRAVEL_ALLEY_OR_PARKING_LOT: livingAndActivitySpacesDistribution?.PERMEABLE_SURFACE,
        PRIVATE_GARDEN_AND_GRASS_ALLEYS: livingAndActivitySpacesDistribution?.PRIVATE_GREEN_SPACES,
        // public spaces
        PUBLIC_GREEN_SPACES: publicGreenSpaces,
        PUBLIC_PAVED_ROAD_OR_SQUARES_OR_SIDEWALKS:
          (publicSpacesDistribution?.IMPERMEABLE_SURFACE ?? 0) +
          (greenSpacesDistribution?.PAVED_ALLEY ?? 0),
        PUBLIC_GRAVEL_ROAD_OR_SQUARES_OR_SIDEWALKS:
          (publicSpacesDistribution?.PERMEABLE_SURFACE ?? 0) +
          (greenSpacesDistribution?.GRAVEL_ALLEY ?? 0),
        PUBLIC_GRASS_ROAD_OR_SQUARES_OR_SIDEWALKS: publicSpacesDistribution?.GRASS_COVERED_SURFACE,
      },
      ([, value]) => !!value && value > 0,
    );
  },

  getProjectData(events: FormEvent[]) {
    const schedules = FormState.getStepAnswers(events, "URBAN_PROJECT_SCHEDULE_PROJECTION");
    const naming = FormState.getStepAnswers(events, "URBAN_PROJECT_NAMING");
    const sitePurchase = FormState.getStepAnswers(
      events,
      "URBAN_PROJECT_EXPENSES_SITE_PURCHASE_AMOUNTS",
    );
    const siteResale = FormState.getStepAnswers(
      events,
      "URBAN_PROJECT_REVENUE_EXPECTED_SITE_RESALE",
    );
    const siteResaleSelection = FormState.getStepAnswers(
      events,
      "URBAN_PROJECT_SITE_RESALE_SELECTION",
    );
    const buildingsResaleSelection = FormState.getStepAnswers(
      events,
      "URBAN_PROJECT_BUILDINGS_RESALE_SELECTION",
    );

    const mappedProjectData = {
      name: naming?.name,
      description: naming?.description,
      reinstatementContractOwner: FormState.getStepAnswers(
        events,
        "URBAN_PROJECT_STAKEHOLDERS_REINSTATEMENT_CONTRACT_OWNER",
      )?.reinstatementContractOwner,
      reinstatementCosts: FormState.getStepAnswers(events, "URBAN_PROJECT_EXPENSES_REINSTATEMENT")
        ?.reinstatementExpenses,
      sitePurchaseSellingPrice: sitePurchase?.sitePurchaseSellingPrice,
      sitePurchasePropertyTransferDuties: sitePurchase?.sitePurchasePropertyTransferDuties,
      siteResaleExpectedSellingPrice: siteResale?.siteResaleExpectedSellingPrice,
      siteResaleExpectedPropertyTransferDuties:
        siteResale?.siteResaleExpectedPropertyTransferDuties,
      financialAssistanceRevenues: FormState.getStepAnswers(
        events,
        "URBAN_PROJECT_REVENUE_FINANCIAL_ASSISTANCE",
      )?.financialAssistanceRevenues,
      yearlyProjectedCosts:
        FormState.getStepAnswers(
          events,
          "URBAN_PROJECT_EXPENSES_PROJECTED_BUILDINGS_OPERATING_EXPENSES",
        )?.yearlyProjectedBuildingsOperationsExpenses ?? [],
      yearlyProjectedRevenues:
        FormState.getStepAnswers(
          events,
          "URBAN_PROJECT_REVENUE_BUILDINGS_OPERATIONS_YEARLY_REVENUES",
        )?.yearlyProjectedRevenues ?? [],
      soilsDistribution: FormState.getProjectSoilDistribution(events),
      reinstatementSchedule: schedules?.reinstatementSchedule,
      operationsFirstYear: schedules?.firstYearOfOperation,
      futureOperator: buildingsResaleSelection?.futureOperator,
      futureSiteOwner: siteResaleSelection?.futureSiteOwner,
      developmentPlan: {
        type: "URBAN_PROJECT",
        developer: FormState.getStepAnswers(events, "URBAN_PROJECT_STAKEHOLDERS_PROJECT_DEVELOPER")
          ?.projectDeveloper,
        costs: FormState.getStepAnswers(events, "URBAN_PROJECT_EXPENSES_INSTALLATION")
          ?.installationExpenses,
        installationSchedule: schedules?.installationSchedule,
        features: {
          spacesDistribution: FormState.getSpacesDistribution(events),
          buildingsFloorAreaDistribution:
            FormState.getStepAnswers(
              events,
              "URBAN_PROJECT_BUILDINGS_USE_SURFACE_AREA_DISTRIBUTION",
            )?.buildingsUsesDistribution ?? {},
        },
      },
      projectPhase: FormState.getStepAnswers(events, "URBAN_PROJECT_PROJECT_PHASE")?.projectPhase,
      decontaminatedSoilSurface: FormState.getStepAnswers(
        events,
        "URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA",
      )?.decontaminatedSurfaceArea,
    };

    return mappedProjectData;
  },

  getFormAnswers(events: FormEvent[]) {
    return {
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_NAMING"),
      ...FormState.getStepAnswers(
        events,
        "URBAN_PROJECT_STAKEHOLDERS_REINSTATEMENT_CONTRACT_OWNER",
      ),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_EXPENSES_REINSTATEMENT"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_REVENUE_FINANCIAL_ASSISTANCE"),
      ...FormState.getStepAnswers(
        events,
        "URBAN_PROJECT_EXPENSES_PROJECTED_BUILDINGS_OPERATING_EXPENSES",
      ),
      ...FormState.getStepAnswers(
        events,
        "URBAN_PROJECT_REVENUE_BUILDINGS_OPERATIONS_YEARLY_REVENUES",
      ),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_SCHEDULE_PROJECTION"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_SITE_RESALE_SELECTION"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_BUILDINGS_RESALE_SELECTION"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_REVENUE_EXPECTED_SITE_RESALE"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_EXPENSES_SITE_PURCHASE_AMOUNTS"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_STAKEHOLDERS_PROJECT_DEVELOPER"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_EXPENSES_INSTALLATION"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_BUILDINGS_USE_SURFACE_AREA_DISTRIBUTION"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_SPACES_CATEGORIES_SELECTION"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_BUILDINGS_FLOOR_SURFACE_AREA"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_PROJECT_PHASE"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_GREEN_SPACES_SURFACE_AREA_DISTRIBUTION"),
      ...FormState.getStepAnswers(
        events,
        "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION",
      ),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_REVENUE_BUILDINGS_RESALE"),
      ...FormState.getStepAnswers(events, "URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION"),
    };
  },
} as const;
