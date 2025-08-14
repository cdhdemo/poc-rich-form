import {
  BuildingsUse,
  FinancialAssistanceRevenue,
  RecurringExpense,
  ReinstatementExpense,
  SurfaceAreaDistributionJson,
  UrbanGreenSpace,
  UrbanLivingAndActivitySpace,
  UrbanProjectDevelopmentExpense,
  UrbanProjectPhase,
  UrbanPublicSpace,
  UrbanSpaceCategory,
  YearlyBuildingsOperationsRevenues,
} from "shared";

import { ProjectStakeholder } from "../project.types";

export type StepAnswers = {
  URBAN_PROJECT_SPACES_CATEGORIES_SELECTION: {
    spacesCategories?: UrbanSpaceCategory[];
  };
  URBAN_PROJECT_SPACES_CATEGORIES_SURFACE_AREA: {
    spacesCategoriesDistribution?: Partial<Record<UrbanSpaceCategory, number>>;
  };
  URBAN_PROJECT_GREEN_SPACES_SURFACE_AREA_DISTRIBUTION: {
    greenSpacesDistribution?: Partial<Record<UrbanGreenSpace, number>>;
  };
  URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_DISTRIBUTION: {
    livingAndActivitySpacesDistribution?: Partial<Record<UrbanLivingAndActivitySpace, number>>;
  };
  URBAN_PROJECT_PUBLIC_SPACES_DISTRIBUTION: {
    publicSpacesDistribution?: Partial<Record<UrbanPublicSpace, number>>;
  };
  URBAN_PROJECT_SOILS_DECONTAMINATION_SELECTION: {
    decontaminationPlan?: "partial" | "none" | "unknown";
  };
  URBAN_PROJECT_SOILS_DECONTAMINATION_SURFACE_AREA: {
    decontaminatedSurfaceArea?: number;
  };
  URBAN_PROJECT_BUILDINGS_FLOOR_SURFACE_AREA: {
    buildingsFloorSurfaceArea?: number;
  };
  URBAN_PROJECT_BUILDINGS_USE_SURFACE_AREA_DISTRIBUTION: {
    buildingsUsesDistribution?: SurfaceAreaDistributionJson<BuildingsUse>;
  };
  URBAN_PROJECT_STAKEHOLDERS_PROJECT_DEVELOPER: {
    projectDeveloper?: ProjectStakeholder;
  };
  URBAN_PROJECT_STAKEHOLDERS_REINSTATEMENT_CONTRACT_OWNER: {
    reinstatementContractOwner?: ProjectStakeholder;
  };
  URBAN_PROJECT_SITE_RESALE_SELECTION: {
    siteResalePlannedAfterDevelopment?: boolean;
    futureSiteOwner?: ProjectStakeholder;
  };
  URBAN_PROJECT_BUILDINGS_RESALE_SELECTION: {
    buildingsResalePlannedAfterDevelopment?: boolean;
    futureOperator?: ProjectStakeholder;
  };
  URBAN_PROJECT_EXPENSES_SITE_PURCHASE_AMOUNTS: {
    sitePurchaseSellingPrice?: number;
    sitePurchasePropertyTransferDuties?: number;
  };
  URBAN_PROJECT_EXPENSES_REINSTATEMENT: {
    reinstatementExpenses?: ReinstatementExpense[];
  };
  URBAN_PROJECT_EXPENSES_INSTALLATION: {
    installationExpenses?: UrbanProjectDevelopmentExpense[];
  };
  URBAN_PROJECT_EXPENSES_PROJECTED_BUILDINGS_OPERATING_EXPENSES: {
    yearlyProjectedBuildingsOperationsExpenses?: RecurringExpense[];
  };
  URBAN_PROJECT_REVENUE_EXPECTED_SITE_RESALE: {
    siteResaleExpectedSellingPrice?: number;
    siteResaleExpectedPropertyTransferDuties?: number;
  };
  URBAN_PROJECT_REVENUE_BUILDINGS_RESALE: {
    buildingsResaleSellingPrice?: number;
    buildingsResalePropertyTransferDuties?: number;
  };
  URBAN_PROJECT_REVENUE_BUILDINGS_OPERATIONS_YEARLY_REVENUES: {
    yearlyProjectedRevenues?: YearlyBuildingsOperationsRevenues[];
  };
  URBAN_PROJECT_REVENUE_FINANCIAL_ASSISTANCE: {
    financialAssistanceRevenues?: FinancialAssistanceRevenue[];
  };
  URBAN_PROJECT_SCHEDULE_PROJECTION: {
    reinstatementSchedule?: {
      startDate: string;
      endDate: string;
    };
    installationSchedule?: {
      startDate: string;
      endDate: string;
    };
    firstYearOfOperation?: number;
  };
  URBAN_PROJECT_NAMING: {
    name?: string;
    description?: string;
  };
  URBAN_PROJECT_PROJECT_PHASE: {
    projectPhase?: UrbanProjectPhase;
  };
};

export type InformationalStep =
  | "URBAN_PROJECT_SPACES_CATEGORIES_INTRODUCTION"
  | "URBAN_PROJECT_SPACES_DEVELOPMENT_PLAN_INTRODUCTION"
  | "URBAN_PROJECT_GREEN_SPACES_INTRODUCTION"
  | "URBAN_PROJECT_RESIDENTIAL_AND_ACTIVITY_SPACES_INTRODUCTION"
  | "URBAN_PROJECT_PUBLIC_SPACES_INTRODUCTION"
  | "URBAN_PROJECT_SPACES_SOILS_SUMMARY"
  | "URBAN_PROJECT_SOILS_CARBON_SUMMARY"
  | "URBAN_PROJECT_SOILS_DECONTAMINATION_INTRODUCTION"
  | "URBAN_PROJECT_BUILDINGS_INTRODUCTION"
  | "URBAN_PROJECT_BUILDINGS_USE_INTRODUCTION"
  | "URBAN_PROJECT_STAKEHOLDERS_INTRODUCTION"
  | "URBAN_PROJECT_SITE_RESALE_INTRODUCTION"
  | "URBAN_PROJECT_EXPENSES_INTRODUCTION"
  | "URBAN_PROJECT_REVENUE_INTRODUCTION"
  | "URBAN_PROJECT_SCHEDULE_INTRODUCTION"
  | "URBAN_PROJECT_FINAL_SUMMARY";
