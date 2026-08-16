import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { Settings2, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { WizardData, ApproachPresetType, ReliabilityTargetType, SimulationBudgetType } from '../App';
import { getMissionDefaults, getPresetRanges } from '../utils/missionDefaults';

interface Props {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
}

const vehicleClassLabels: Record<string, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};

export function Screen4SimPlan({ data, updateData, nextScreen, prevScreen }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const missionConfig = data.missionContext ? getMissionDefaults(data.missionContext) : null;
  const currentPreset = data.approachPreset || 'typical';
  const sweepRanges = data.missionContext
    ? getPresetRanges(data.missionContext, currentPreset)
    : null;

  const classLabel = data.missionContext ? vehicleClassLabels[data.missionContext] : null;

  const approachPresets: Array<{
    id: ApproachPresetType;
    title: string;
    description: string;
    recommended?: boolean;
  }> = [
    {
      id: 'conservative',
      title: 'Conservative',
      description: 'Slow, safe approach parameters with wide safety margins',
      recommended: data.missionContext === 'large',
    },
    {
      id: 'typical',
      title: 'Typical (Standard)',
      description: 'Standard operational parameters for most ring-docking missions',
      recommended: data.missionContext === 'small' || data.missionContext === 'medium',
    },
    {
      id: 'aggressive',
      title: 'Aggressive / Stress Test',
      description: 'Maximum envelope testing with challenging initial conditions',
    },
  ];

  const handleNext = () => {
    if (data.approachPreset && data.reliabilityTarget && data.simulationBudget) {
      nextScreen();
    }
  };

  const isFormValid = data.approachPreset && data.reliabilityTarget && data.simulationBudget;

  return (
    <div className="container max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-3 py-1">
            Step 4 of 5
          </Badge>
          <Badge variant="outline" className="text-slate-500 px-3 py-1">
            Simulation Plan
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Simulation Plan</h1>
        <p className="text-slate-600">
          Configure the Monte Carlo sweep parameters.
          {classLabel && <> Defaults loaded from <strong>{classLabel}</strong> vehicle class.</>}
        </p>
      </div>

      {/* Sweep plan callout */}
      {missionConfig && sweepRanges && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertDescription className="ml-2">
            <p className="font-semibold text-blue-900 mb-2">
              Sweep Plan — {classLabel} class &nbsp;·&nbsp; <span className="capitalize">{currentPreset}</span> preset
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <strong>Start Distance:</strong>
                <div className="font-mono bg-white px-2 py-1 rounded mt-1">
                  {sweepRanges.startDistance.display}
                </div>
              </div>
              <div>
                <strong>Lateral Offset:</strong>
                <div className="font-mono bg-white px-2 py-1 rounded mt-1">
                  {sweepRanges.lateralOffset.display}
                </div>
              </div>
              <div>
                <strong>Closing Speed:</strong>
                <div className="font-mono bg-white px-2 py-1 rounded mt-1">
                  {sweepRanges.closingSpeed.display}
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Approach Preset */}
          <Card>
            <CardHeader>
              <CardTitle>Approach Phase Preset</CardTitle>
              <CardDescription>
                Defines sweep distribution for the Monte Carlo simulation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={data.approachPreset}
                onValueChange={(value) =>
                  updateData({ approachPreset: value as ApproachPresetType })
                }
              >
                <div className="space-y-3">
                  {approachPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                        data.approachPreset === preset.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <RadioGroupItem value={preset.id} id={preset.id} className="mt-1" />
                      <div className="flex-1">
                        <Label
                          htmlFor={preset.id}
                          className="cursor-pointer flex items-center gap-2"
                        >
                          <span className="font-semibold">{preset.title}</span>
                          {preset.recommended && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              Recommended
                            </Badge>
                          )}
                        </Label>
                        <p className="text-sm text-slate-600 mt-1">{preset.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Advanced Toggle */}
          <Card className="border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings2 className="w-5 h-5 text-purple-600" />
                  <div>
                    <Label
                      htmlFor="advanced-toggle"
                      className="text-base font-semibold cursor-pointer"
                    >
                      Advanced: Override Sweep Ranges
                    </Label>
                    <p className="text-sm text-slate-600">
                      Manually define custom parameter ranges (experts only)
                    </p>
                  </div>
                </div>
                <Switch
                  id="advanced-toggle"
                  checked={showAdvanced}
                  onCheckedChange={setShowAdvanced}
                />
              </div>

              {showAdvanced && (
                <div className="mt-6 space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Start Distance Min (m)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder={sweepRanges?.startDistance.min.toString() || '2.0'}
                        value={data.customStartDistance?.min || ''}
                        onChange={(e) =>
                          updateData({
                            customStartDistance: {
                              ...data.customStartDistance,
                              min: parseFloat(e.target.value),
                              max:
                                data.customStartDistance?.max ||
                                sweepRanges?.startDistance.max ||
                                5,
                            },
                          })
                        }
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Start Distance Max (m)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder={sweepRanges?.startDistance.max.toString() || '5.0'}
                        value={data.customStartDistance?.max || ''}
                        onChange={(e) =>
                          updateData({
                            customStartDistance: {
                              min:
                                data.customStartDistance?.min ||
                                sweepRanges?.startDistance.min ||
                                2,
                              max: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Lateral Offset Min (m)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.0"
                        value={data.customLateralOffset?.min || ''}
                        onChange={(e) =>
                          updateData({
                            customLateralOffset: {
                              ...data.customLateralOffset,
                              min: parseFloat(e.target.value),
                              max:
                                data.customLateralOffset?.max ||
                                sweepRanges?.lateralOffset.max ||
                                0.15,
                            },
                          })
                        }
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Lateral Offset Max (m)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={sweepRanges?.lateralOffset.max.toString() || '0.15'}
                        value={data.customLateralOffset?.max || ''}
                        onChange={(e) =>
                          updateData({
                            customLateralOffset: {
                              min: data.customLateralOffset?.min || 0,
                              max: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Closing Speed Min (m/s)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder={sweepRanges?.closingSpeed.min.toString() || '0.01'}
                        value={data.customClosingSpeed?.min || ''}
                        onChange={(e) =>
                          updateData({
                            customClosingSpeed: {
                              ...data.customClosingSpeed,
                              min: parseFloat(e.target.value),
                              max:
                                data.customClosingSpeed?.max ||
                                sweepRanges?.closingSpeed.max ||
                                0.08,
                            },
                          })
                        }
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Closing Speed Max (m/s)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder={sweepRanges?.closingSpeed.max.toString() || '0.08'}
                        value={data.customClosingSpeed?.max || ''}
                        onChange={(e) =>
                          updateData({
                            customClosingSpeed: {
                              min:
                                data.customClosingSpeed?.min ||
                                sweepRanges?.closingSpeed.min ||
                                0.01,
                              max: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reliability + Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reliability Target</CardTitle>
                <CardDescription>Desired success probability threshold</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={data.reliabilityTarget}
                  onValueChange={(value) =>
                    updateData({ reliabilityTarget: value as ReliabilityTargetType })
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="90" id="rel-90" />
                      <Label htmlFor="rel-90" className="cursor-pointer">
                        90% Success
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="95" id="rel-95" />
                      <Label htmlFor="rel-95" className="cursor-pointer flex items-center gap-2">
                        95% Success
                        {(data.missionContext === 'small' || data.missionContext === 'medium') && (
                          <Badge className="bg-green-100 text-green-700 text-xs">Default</Badge>
                        )}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="99" id="rel-99" />
                      <Label htmlFor="rel-99" className="cursor-pointer flex items-center gap-2">
                        99% Success
                        {data.missionContext === 'large' && (
                          <Badge className="bg-green-100 text-green-700 text-xs">Default</Badge>
                        )}
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Simulation Budget</CardTitle>
                <CardDescription>Number of Monte Carlo runs</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={data.simulationBudget}
                  onValueChange={(value) =>
                    updateData({ simulationBudget: value as SimulationBudgetType })
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="100" id="sim-100" />
                      <Label htmlFor="sim-100" className="cursor-pointer">
                        Fast (100 runs)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="500" id="sim-500" />
                      <Label htmlFor="sim-500" className="cursor-pointer flex items-center gap-2">
                        Standard (500 runs)
                        {(data.missionContext === 'small' || data.missionContext === 'medium') && (
                          <Badge className="bg-green-100 text-green-700 text-xs">Default</Badge>
                        )}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2000" id="sim-2000" />
                      <Label htmlFor="sim-2000" className="cursor-pointer flex items-center gap-2">
                        Thorough (2,000 runs)
                        {data.missionContext === 'large' && (
                          <Badge className="bg-green-100 text-green-700 text-xs">Default</Badge>
                        )}
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What Gets Simulated sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg">What Gets Simulated</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-slate-900">Monte Carlo Sweeps</h4>
                <p className="text-slate-600 mb-2">
                  Simulink randomly samples within your sweep ranges:
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>Start distance</li>
                  <li>Lateral offset (radial)</li>
                  <li>Closing speed</li>
                  <li>Angular misalignment (future)</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2 text-slate-900">No px₀/vx₀ Required</h4>
                <p className="text-slate-600">
                  You provide <strong>friendly ranges</strong>, not exact initial
                  conditions. The tool derives statistical envelope bounds automatically.
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2 text-slate-900">Output</h4>
                <p className="text-slate-600 mb-2">You'll receive:</p>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>Max safe offset @ {data.reliabilityTarget || '95'}% reliability</li>
                  <li>Max safe speed @ {data.reliabilityTarget || '95'}% reliability</li>
                  <li>Success rate heatmap</li>
                  <li>JSON export for Basilisk/bsk-rl</li>
                </ul>
              </div>

              {missionConfig && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2 text-slate-900">Mission Profile</h4>
                  <p className="text-xs text-slate-600">{missionConfig.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button onClick={prevScreen} variant="outline" size="lg" className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isFormValid}
          size="lg"
          className="px-8 gap-2"
        >
          Review Configuration
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
