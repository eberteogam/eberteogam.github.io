import {
  MissionContextType,
  ReliabilityTargetType,
  ApproachPresetType,
  SimulationBudgetType,
  ComplianceLevelType,
} from "../App";

export interface MissionDefaults {
  reliabilityTarget: ReliabilityTargetType;
  approachPreset: ApproachPresetType;
  simulationBudget: SimulationBudgetType;
  sweepRanges: {
    startDistance: {
      min: number;
      max: number;
      display: string;
    };
    lateralOffset: {
      min: number;
      max: number;
      display: string;
    };
    closingSpeed: { min: number; max: number; display: string };
  };
  geometryDefaults: {
    captureRadius: number;
    ringInnerDiameter: number;
    complianceLevel: ComplianceLevelType;
  };
  geometryRecommendations: {
    captureRadiusRange: string;
    ringDiameterRange: string;
    complianceNote: string;
  };
  warnings: string[];
  description: string;
  label: string;
  massRange: string;
}

export const MISSION_CONFIGURATIONS: Record<
  MissionContextType,
  MissionDefaults
> = {
  small: {
    label: "Small",
    massRange: "< 500 kg",
    reliabilityTarget: "95",
    approachPreset: "typical",
    simulationBudget: "500",
    sweepRanges: {
      startDistance: { min: 1, max: 3, display: "1–3 m" },
      lateralOffset: { min: 0, max: 0.08, display: "0–0.08 m" },
      closingSpeed: {
        min: 0.01,
        max: 0.05,
        display: "0.01–0.05 m/s",
      },
    },
    geometryDefaults: {
      captureRadius: 0.15,
      ringInnerDiameter: 0.3,
      complianceLevel: "low",
    },
    geometryRecommendations: {
      captureRadiusRange: "0.10–0.20 m (SmallSat/CubeSat class)",
      ringDiameterRange: "0.20–0.40 m (CubeSat-class ring)",
      complianceNote:
        "Low compliance due to tight mass/volume budget on small platforms",
    },
    warnings: [
      "Tighter mechanical tolerances required for small-scale ring interfaces",
      "Short approach distances due to limited sensor range",
      "Mass budget typically constrains compliance mechanism design",
    ],
    description:
      "SmallSat / CubeSat class — compact ring interface with tight tolerances and short approach distances",
  },

  medium: {
    label: "Medium",
    massRange: "500 kg – 5,000 kg",
    reliabilityTarget: "95",
    approachPreset: "typical",
    simulationBudget: "500",
    sweepRanges: {
      startDistance: { min: 2, max: 5, display: "2–5 m" },
      lateralOffset: { min: 0, max: 0.15, display: "0–0.15 m" },
      closingSpeed: {
        min: 0.01,
        max: 0.08,
        display: "0.01–0.08 m/s",
      },
    },
    geometryDefaults: {
      captureRadius: 0.4,
      ringInnerDiameter: 0.8,
      complianceLevel: "medium",
    },
    geometryRecommendations: {
      captureRadiusRange: "0.25–0.55 m (standard servicing spacecraft)",
      ringDiameterRange: "0.50–1.00 m (serviceable ring interface)",
      complianceNote:
        "Medium compliance balances capture tolerance and structural rigidity",
    },
    warnings: [
      "Standard operational parameters for uncrewed servicing missions",
      "Verify ring interface compatibility with target vehicle specification",
    ],
    description:
      "Standard servicing spacecraft — balanced ring geometry with moderate tolerances and typical approach dynamics",
  },

  large: {
    label: "Large",
    massRange: "> 5,000 kg",
    reliabilityTarget: "99",
    approachPreset: "conservative",
    simulationBudget: "2000",
    sweepRanges: {
      startDistance: { min: 5, max: 10, display: "5–10 m" },
      lateralOffset: { min: 0, max: 0.2, display: "0–0.20 m" },
      closingSpeed: {
        min: 0.005,
        max: 0.03,
        display: "0.005–0.03 m/s",
      },
    },
    geometryDefaults: {
      captureRadius: 0.8,
      ringInnerDiameter: 1.6,
      complianceLevel: "high",
    },
    geometryRecommendations: {
      captureRadiusRange: "0.60–1.20 m (heavy cargo / crewed-class)",
      ringDiameterRange: "1.20–2.00 m (APAS/IDA standard range)",
      complianceNote:
        "High compliance critical to absorb large contact forces from high-inertia vehicles",
    },
    warnings: [
      "99% reliability minimum for crewed-class and high-value cargo vehicles",
      "Conservative approach speeds mandatory for safe large-mass docking",
      "High compliance essential — large inertia amplifies contact loads",
    ],
    description:
      "Heavy cargo / crewed-class — robust ring interface with conservative margins and high reliability requirements",
  },
};

export function getMissionDefaults(
  mission: MissionContextType,
): MissionDefaults {
  return MISSION_CONFIGURATIONS[mission];
}

export function getPresetRanges(
  mission: MissionContextType,
  preset: ApproachPresetType,
) {
  const missionConfig = MISSION_CONFIGURATIONS[mission];

  // Scale from mission baseline
  const baseRanges = missionConfig.sweepRanges;

  switch (preset) {
    case "conservative":
      return {
        startDistance: {
          min: baseRanges.startDistance.min * 1.2,
          max: baseRanges.startDistance.max * 1.5,
          display: `${(baseRanges.startDistance.min * 1.2).toFixed(1)}–${(baseRanges.startDistance.max * 1.5).toFixed(1)} m`,
        },
        lateralOffset: {
          min: 0,
          max: baseRanges.lateralOffset.max * 0.5,
          display: `0–${(baseRanges.lateralOffset.max * 0.5).toFixed(3)} m`,
        },
        closingSpeed: {
          min: baseRanges.closingSpeed.min * 0.5,
          max: baseRanges.closingSpeed.max * 0.5,
          display: `${(baseRanges.closingSpeed.min * 0.5).toFixed(3)}–${(baseRanges.closingSpeed.max * 0.5).toFixed(3)} m/s`,
        },
      };

    case "typical":
      return {
        startDistance: {
          min: baseRanges.startDistance.min,
          max: baseRanges.startDistance.max,
          display: baseRanges.startDistance.display,
        },
        lateralOffset: {
          min: 0,
          max: baseRanges.lateralOffset.max,
          display: baseRanges.lateralOffset.display,
        },
        closingSpeed: {
          min: baseRanges.closingSpeed.min,
          max: baseRanges.closingSpeed.max,
          display: baseRanges.closingSpeed.display,
        },
      };

    case "aggressive":
      return {
        startDistance: {
          min: baseRanges.startDistance.min * 0.8,
          max: baseRanges.startDistance.max * 1.2,
          display: `${(baseRanges.startDistance.min * 0.8).toFixed(1)}–${(baseRanges.startDistance.max * 1.2).toFixed(1)} m`,
        },
        lateralOffset: {
          min: 0,
          max: baseRanges.lateralOffset.max * 2,
          display: `0–${(baseRanges.lateralOffset.max * 2).toFixed(3)} m`,
        },
        closingSpeed: {
          min: baseRanges.closingSpeed.min * 1.5,
          max: baseRanges.closingSpeed.max * 2,
          display: `${(baseRanges.closingSpeed.min * 1.5).toFixed(3)}–${(baseRanges.closingSpeed.max * 2).toFixed(3)} m/s`,
        },
      };

    default:
      return baseRanges;
  }
}
