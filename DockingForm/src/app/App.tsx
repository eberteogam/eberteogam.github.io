import { useState } from "react";
import { Screen1MissionContext } from "./components/Screen1MissionContext";
import { Screen2InterfaceFamily } from "./components/Screen2InterfaceFamily";
import { Screen3GeometryInputs } from "./components/Screen3GeometryInputs";
import { Screen4SimPlan } from "./components/Screen4SimPlan";
import { Screen5Results } from "./components/Screen5Results";
import { ProgressStepper } from "./components/ProgressStepper";

// Vehicle class replaces the old multi-mission selector.
// All missions are ring docking; the class drives geometry + simulation defaults.
export type MissionContextType = "small" | "medium" | "large";
export type InterfaceFamilyType = "ring-soft-capture";
export type ComplianceLevelType = "low" | "medium" | "high";
export type ApproachPresetType =
  | "conservative"
  | "typical"
  | "aggressive"
  | "custom";
export type ReliabilityTargetType = "90" | "95" | "99";
export type SimulationBudgetType = "100" | "500" | "2000";
export type SimulationStatus = "not-run" | "running" | "completed" | "failed";

export interface WizardData {
  missionName?: string;
  missionContext?: MissionContextType;
  interfaceFamily?: InterfaceFamilyType;
  captureRadius?: number;
  ringInnerDiameter?: number;
  guideChamfer?: number;
  complianceLevel?: ComplianceLevelType;
  frictionCoefficient?: number;
  contactMaterial?: string;
  approachPreset?: ApproachPresetType;
  reliabilityTarget?: ReliabilityTargetType;
  simulationBudget?: SimulationBudgetType;
  customStartDistance?: { min: number; max: number };
  customLateralOffset?: { min: number; max: number };
  customClosingSpeed?: { min: number; max: number };
}

export interface SimulationResults {
  envelope: {
    max_offset_m: number;
    max_speed_mps: number;
    success_rate_pct: number;
  };
  simulation: {
    total_runs: number;
    reliability_target: number;
  };
  timestamp: string;
  modelVersion: string;
  heatmapData?: Array<{ offset: number; speed: number; success: number }>;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [data, setData] = useState<WizardData>({});
  const [simulationStatus, setSimulationStatus] =
    useState<SimulationStatus>("not-run");
  const [simulationResults, setSimulationResults] =
    useState<SimulationResults | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [prototypeMode, setPrototypeMode] = useState(false);

  const steps = [
    { number: 1, title: "Mission", description: "Brief" },
    { number: 2, title: "Interface", description: "Family" },
    { number: 3, title: "Geometry", description: "Inputs" },
    { number: 4, title: "Simulation", description: "Plan" },
    { number: 5, title: "Results", description: "Dashboard" },
  ];

  const updateData = (newData: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const nextScreen = () => {
    setCurrentScreen((s) => s + 1);
  };

  const prevScreen = () => {
    setCurrentScreen((s) => s - 1);
  };

  const goToScreen = (screen: number) => {
    setCurrentScreen(screen);
  };

  const runSimulation = async () => {
    setSimulationStatus("running");
    setSimulationError(null);
    setSimulationProgress(0);

    try {
      if (prototypeMode) {
        const progressInterval = setInterval(() => {
          setSimulationProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        clearInterval(progressInterval);
        setSimulationProgress(100);

        const mockResults: SimulationResults = generateMockResults(data);
        setSimulationResults(mockResults);
        setSimulationStatus("completed");
      } else {
        const progressInterval = setInterval(() => {
          setSimulationProgress((prev) => Math.min(prev + 5, 80));
        }, 500);

        // TODO: Replace with actual backend API call
        // const response = await fetch('/api/simulate', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     configuration: {
        //       missionName: data.missionName,
        //       vehicleClass: data.missionContext,
        //       interfaceFamily: data.interfaceFamily,
        //       ringInnerDiameter: data.ringInnerDiameter,
        //       captureRadius: data.captureRadius,
        //       guideChamfer: data.guideChamfer,
        //       complianceLevel: data.complianceLevel,
        //       frictionCoefficient: data.frictionCoefficient,
        //       contactMaterial: data.contactMaterial,
        //       reliabilityTarget: data.reliabilityTarget,
        //       simulationBudget: data.simulationBudget,
        //       approachPreset: data.approachPreset,
        //       customStartDistance: data.customStartDistance,
        //       customLateralOffset: data.customLateralOffset,
        //       customClosingSpeed: data.customClosingSpeed,
        //     }
        //   })
        // });
        // const results = await response.json();

        await new Promise((resolve) => setTimeout(resolve, 3000));
        clearInterval(progressInterval);

        throw new Error(
          "Backend API not connected. Enable Prototype Mode to test with mock results."
        );
      }
    } catch (error) {
      setSimulationStatus("failed");
      setSimulationError(
        error instanceof Error
          ? error.message
          : "Simulation failed. Please try again."
      );
      setSimulationProgress(0);
    }
  };

  const generateMockResults = (config: WizardData): SimulationResults => {
    const runs = parseInt(config.simulationBudget || "500");
    const heatmapData = [];

    for (let i = 0; i < Math.min(runs, 200); i++) {
      const offset = Math.random() * 0.3;
      const speed = Math.random() * 0.15;
      const baseSuccess =
        1 - (offset / 0.3) * 0.4 - (speed / 0.15) * 0.3;
      const noise = (Math.random() - 0.5) * 0.2;
      const success =
        Math.max(0, Math.min(1, baseSuccess + noise)) > 0.5 ? 1 : 0;

      heatmapData.push({ offset, speed, success });
    }

    const successPoints = heatmapData.filter((p) => p.success === 1);
    const target = parseInt(config.reliabilityTarget || "95") / 100;
    const sortedByOffset = [...successPoints].sort(
      (a, b) => b.offset - a.offset
    );
    const sortedBySpeed = [...successPoints].sort(
      (a, b) => b.speed - a.speed
    );

    const offsetIndex = Math.floor(successPoints.length * target);
    const speedIndex = Math.floor(successPoints.length * target);

    return {
      envelope: {
        max_offset_m: sortedByOffset[offsetIndex]?.offset || 0.15,
        max_speed_mps: sortedBySpeed[speedIndex]?.speed || 0.08,
        success_rate_pct: (successPoints.length / heatmapData.length) * 100,
      },
      simulation: {
        total_runs: runs,
        reliability_target: parseInt(config.reliabilityTarget || "95"),
      },
      timestamp: new Date().toISOString(),
      modelVersion: "Hertz-Kelvin v2.1 (Mock)",
      heatmapData,
    };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ProgressStepper currentStep={currentScreen} steps={steps} />

      <div className="min-h-[calc(100vh-180px)]">
        {currentScreen === 1 && (
          <Screen1MissionContext
            data={data}
            updateData={updateData}
            nextScreen={nextScreen}
          />
        )}
        {currentScreen === 2 && (
          <Screen2InterfaceFamily
            data={data}
            updateData={updateData}
            nextScreen={nextScreen}
            prevScreen={prevScreen}
          />
        )}
        {currentScreen === 3 && (
          <Screen3GeometryInputs
            data={data}
            updateData={updateData}
            nextScreen={nextScreen}
            prevScreen={prevScreen}
          />
        )}
        {currentScreen === 4 && (
          <Screen4SimPlan
            data={data}
            updateData={updateData}
            nextScreen={nextScreen}
            prevScreen={prevScreen}
          />
        )}
        {currentScreen === 5 && (
          <Screen5Results
            data={data}
            prevScreen={prevScreen}
            goToScreen={goToScreen}
            simulationStatus={simulationStatus}
            simulationResults={simulationResults}
            simulationError={simulationError}
            simulationProgress={simulationProgress}
            runSimulation={runSimulation}
            prototypeMode={prototypeMode}
            setPrototypeMode={setPrototypeMode}
          />
        )}
      </div>
    </div>
  );
}
