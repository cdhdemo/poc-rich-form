import { filterObject, LEGACY_SpacesDistribution } from "shared";

import {
  getUrbanProjectSoilsDistributionFromSpaces,
  UrbanSpacesByCategory,
} from "../../urban-project/urbanProjectSoils";
import { FormEvent, SerializedAnswerEvent } from "../form-events/events.type";
import { StepAnswers } from "../steps.types";

export class FormStateHandler {
  protected events: FormEvent[];

  constructor(events: FormEvent[]) {
    this.events = events.slice().sort((x, y) => y.timestamp - x.timestamp);
  }

  getStepAnswers<K extends keyof StepAnswers>(stepId: K) {
    const event = this.events.find(
      (e): e is SerializedAnswerEvent<typeof stepId> =>
        e.stepId === stepId && e.type === "ANSWER_SET",
    );

    return event?.payload;
  }

  getProjectSoilDistribution = () => {
    const spacesCategoriesDistribution = this.getStepAnswers(
      "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA",
    )?.spacesCategoriesDistribution;
    const publicSpacesDistribution = this.getStepAnswers(
      "URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION",
    )?.publicSpacesDistribution;
    const greenSpacesDistribution = this.getStepAnswers(
      "URBAN_PROJECT_GREEN_SPACES_SURFACE_AREA_DISTRIBUTION",
    )?.greenSpacesDistribution;
    const livingAndActivitySpacesDistribution = this.getStepAnswers(
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
  };

  getSpacesDistribution() {
    const publicSpacesDistribution = this.getStepAnswers(
      "URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION",
    )?.publicSpacesDistribution;
    const greenSpacesDistribution = this.getStepAnswers(
      "URBAN_PROJECT_GREEN_SPACES_SURFACE_AREA_DISTRIBUTION",
    )?.greenSpacesDistribution;
    const livingAndActivitySpacesDistribution = this.getStepAnswers(
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
  }

  getProjectData() {
    const schedules = this.getStepAnswers("URBAN_PROJECT_SCHEDULE_PROJECTION");
    const { name, description } = this.getStepAnswers("URBAN_PROJECT_NAMING") ?? {};
    const { sitePurchasePropertyTransferDuties, sitePurchaseSellingPrice } =
      this.getStepAnswers("URBAN_PROJECT_EXPENSES_SITE_PURCHASE_AMOUNTS") ?? {};
    const { siteResaleExpectedPropertyTransferDuties, siteResaleExpectedSellingPrice } =
      this.getStepAnswers("URBAN_PROJECT_REVENUE_EXPECTED_SITE_RESALE") ?? {};

    const { futureSiteOwner } = this.getStepAnswers("URBAN_PROJECT_SITE_RESALE_SELECTION") ?? {};
    const { futureOperator } =
      this.getStepAnswers("URBAN_PROJECT_BUILDINGS_RESALE_SELECTION") ?? {};

    const mappedProjectData = {
      name,
      description: description,
      reinstatementContractOwner: this.getStepAnswers(
        "URBAN_PROJECT_STAKEHOLDERS_REINSTATEMENT_CONTRACT_OWNER",
      )?.reinstatementContractOwner,
      reinstatementCosts: this.getStepAnswers("URBAN_PROJECT_EXPENSES_REINSTATEMENT")?.reinstatementExpenses,
      sitePurchaseSellingPrice,
      sitePurchasePropertyTransferDuties,
      siteResaleExpectedSellingPrice: siteResaleExpectedSellingPrice,
      siteResaleExpectedPropertyTransferDuties: siteResaleExpectedPropertyTransferDuties,
      financialAssistanceRevenues: this.getStepAnswers("URBAN_PROJECT_REVENUE_FINANCIAL_ASSISTANCE")
        ?.financialAssistanceRevenues,
      yearlyProjectedCosts:
        this.getStepAnswers("URBAN_PROJECT_EXPENSES_PROJECTED_BUILDINGS_OPERATING_EXPENSES")
          ?.yearlyProjectedBuildingsOperationsExpenses ?? [],
      yearlyProjectedRevenues:
        this.getStepAnswers("URBAN_PROJECT_REVENUE_BUILDINGS_OPERATIONS_YEARLY_REVENUES")
          ?.yearlyProjectedRevenues ?? [],
      soilsDistribution: this.getProjectSoilDistribution(),
      reinstatementSchedule: schedules?.reinstatementSchedule,
      operationsFirstYear: schedules?.firstYearOfOperation,
      futureOperator,
      futureSiteOwner,
      developmentPlan: {
        type: "URBAN_PROJECT",
        developer: this.getStepAnswers("URBAN_PROJECT_STAKEHOLDERS_PROJECT_DEVELOPER")
          ?.projectDeveloper,
        costs: this.getStepAnswers("URBAN_PROJECT_EXPENSES_INSTALLATION")?.installationExpenses,
        installationSchedule: schedules?.installationSchedule,
        features: {
          spacesDistribution: this.getSpacesDistribution(),
          buildingsFloorAreaDistribution:
            this.getStepAnswers("URBAN_PROJECT_BUILDINGS_USE_SURFACE_AREA_DISTRIBUTION")
              ?.buildingsUsesDistribution ?? {},
        },
      },
      projectPhase: this.getStepAnswers("URBAN_PROJECT_PROJECT_PHASE")?.projectPhase,
      decontaminatedSoilSurface: this.getStepAnswers(
        "URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA",
      )?.decontaminatedSurfaceArea,
    };

    return mappedProjectData;
  }

  getFormAnswers() {   
    return {
      ...this.getStepAnswers("URBAN_PROJECT_NAMING"),
      ...this.getStepAnswers(
        "URBAN_PROJECT_STAKEHOLDERS_REINSTATEMENT_CONTRACT_OWNER",
      ),
      ...this.getStepAnswers("URBAN_PROJECT_EXPENSES_REINSTATEMENT"),
      ...this.getStepAnswers("URBAN_PROJECT_REVENUE_FINANCIAL_ASSISTANCE"),
      ...this.getStepAnswers("URBAN_PROJECT_EXPENSES_PROJECTED_BUILDINGS_OPERATING_EXPENSES"),
      ...this.getStepAnswers("URBAN_PROJECT_REVENUE_BUILDINGS_OPERATIONS_YEARLY_REVENUES"),
      ...this.getStepAnswers("URBAN_PROJECT_SCHEDULE_PROJECTION"),
      ...this.getStepAnswers("URBAN_PROJECT_SITE_RESALE_SELECTION"),
      ...this.getStepAnswers("URBAN_PROJECT_BUILDINGS_RESALE_SELECTION"),
      ...this.getStepAnswers("URBAN_PROJECT_REVENUE_EXPECTED_SITE_RESALE"),
      ...this.getStepAnswers("URBAN_PROJECT_EXPENSES_SITE_PURCHASE_AMOUNTS"),
      ...this.getStepAnswers("URBAN_PROJECT_STAKEHOLDERS_PROJECT_DEVELOPER"),
      ...this.getStepAnswers("URBAN_PROJECT_EXPENSES_INSTALLATION"),
      ...this.getStepAnswers("URBAN_PROJECT_BUILDINGS_USE_SURFACE_AREA_DISTRIBUTION"),
      ...this.getStepAnswers("URBAN_PROJECT_SPACES_CATEGORIES_SELECTION"),
      ...this.getStepAnswers(
        "URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA",
      ),
      ...this.getStepAnswers(
        "URBAN_PROJECT_BUILDINGS_FLOOR_SURFACE_AREA",
      ),
      ...this.getStepAnswers("URBAN_PROJECT_PROJECT_PHASE"),
      ...this.getStepAnswers(
        "URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA",
      ),
      ...this.getStepAnswers("URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION"),
      ...this.getStepAnswers("URBAN_PROJECT_GREEN_SPACES_SURFACE_AREA_DISTRIBUTION"),
      ...this.getStepAnswers("URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION"),
      ...this.getStepAnswers(
        "URBAN_PROJECT_REVENUE_BUILDINGS_RESALE",
      ),
      ...this.getStepAnswers("URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION")
    };
  }

  static new(events: FormEvent[]) {
    return new FormStateHandler(events);
  }
}
