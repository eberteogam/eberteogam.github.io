import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, Settings2, Weight, ChevronRight, Info } from 'lucide-react';
import { MissionContextType, WizardData } from '../App';
import { getMissionDefaults } from '../utils/missionDefaults';

interface Props {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  nextScreen: () => void;
}

const vehicleClasses: Array<{
  id: MissionContextType;
  label: string;
  massRange: string;
  examples: string;
  color: string;
  accent: string;
}> = [
  {
    id: 'small',
    label: 'Small',
    massRange: '< 500 kg',
    examples: 'SmallSat, CubeSat, nano-satellite',
    color: 'bg-violet-500',
    accent: 'border-violet-400 bg-violet-50 ring-violet-500',
  },
  {
    id: 'medium',
    label: 'Medium',
    massRange: '500 kg – 5,000 kg',
    examples: 'Servicing spacecraft, logistics module',
    color: 'bg-blue-500',
    accent: 'border-blue-400 bg-blue-50 ring-blue-500',
  },
  {
    id: 'large',
    label: 'Large',
    massRange: '> 5,000 kg',
    examples: 'Crewed vehicle, heavy cargo tanker',
    color: 'bg-slate-700',
    accent: 'border-slate-500 bg-slate-50 ring-slate-600',
  },
];

export function Screen1MissionContext({ data, updateData, nextScreen }: Props) {
  const [showDefaults, setShowDefaults] = useState(false);

  const handleClassSelect = (id: MissionContextType) => {
    const defaults = getMissionDefaults(id);
    updateData({
      missionContext: id,
      interfaceFamily: 'ring-soft-capture',
      reliabilityTarget: defaults.reliabilityTarget,
      approachPreset: defaults.approachPreset,
      simulationBudget: defaults.simulationBudget,
      captureRadius: defaults.geometryDefaults.captureRadius,
      ringInnerDiameter: defaults.geometryDefaults.ringInnerDiameter,
      complianceLevel: defaults.geometryDefaults.complianceLevel,
    });
  };

  const selectedDefaults = data.missionContext
    ? getMissionDefaults(data.missionContext)
    : null;
  const selectedClass = vehicleClasses.find((v) => v.id === data.missionContext);

  const isValid = !!data.missionContext;

  return (
    <div className="container max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-3 py-1">
            Step 1 of 5
          </Badge>
          <Badge variant="outline" className="text-slate-500 px-3 py-1">
            Rendezvous + Ring Docking
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Mission Brief</h1>
        <p className="text-slate-600">
          Provide a mission identifier and select the chaser vehicle class.
          The class drives ring geometry defaults, reliability targets, and sweep ranges for all subsequent steps.
        </p>
      </div>

      {/* Scope callout */}
      <Alert className="mb-8 border-blue-200 bg-blue-50">
        <Info className="h-5 w-5 text-blue-600" />
        <AlertDescription className="ml-2 text-blue-800 text-sm">
          <strong>Tool scope:</strong> This wizard generates docking envelopes for the
          {' '}<strong>rendezvous + ring docking phase</strong> — covering{' '}
          <strong>Soft Capture</strong> (ring contact &amp; retention) and{' '}
          <strong>Hard Capture</strong> (rigid latching). Only the ring interface is supported in V1.
        </AlertDescription>
      </Alert>

      {/* Mission name */}
      <div className="mb-8">
        <Label htmlFor="missionName" className="text-base font-semibold text-slate-900 mb-2 block">
          Mission Identifier <span className="font-normal text-slate-500">(optional)</span>
        </Label>
        <Input
          id="missionName"
          placeholder="e.g. DEMO-2 Ring Dock, OTV-7 Rendezvous"
          value={data.missionName || ''}
          onChange={(e) => updateData({ missionName: e.target.value })}
          className="max-w-md font-mono"
        />
        <p className="text-xs text-slate-500 mt-1">Used as the label in exported JSON artifacts.</p>
      </div>

      {/* Vehicle class selector */}
      <div className="mb-6">
        <Label className="text-base font-semibold text-slate-900 mb-3 block flex items-center gap-2">
          <Weight className="w-4 h-4" />
          Chaser Vehicle Class <span className="text-red-500 ml-0.5">*</span>
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehicleClasses.map((vc) => {
            const isSelected = data.missionContext === vc.id;
            return (
              <Card
                key={vc.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected
                    ? `ring-2 ${vc.accent}`
                    : 'hover:border-blue-300'
                }`}
                onClick={() => handleClassSelect(vc.id)}
              >
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${vc.color}`}>
                      {vc.label}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                    )}
                  </div>
                  <div className="font-mono text-slate-700 text-sm mb-1">{vc.massRange}</div>
                  <div className="text-xs text-slate-500">{vc.examples}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Selected defaults summary */}
      {selectedDefaults && selectedClass && (
        <div className="mb-8">
          <div
            className="flex items-center gap-2 p-4 rounded-lg border border-green-300 bg-green-50 cursor-pointer select-none"
            onClick={() => setShowDefaults(!showDefaults)}
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-green-900 text-sm">
                Defaults applied for <strong>{selectedClass.label}</strong> vehicle class
                ({selectedClass.massRange})
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                Reliability {selectedDefaults.reliabilityTarget}% · Preset: {selectedDefaults.approachPreset} ·{' '}
                {selectedDefaults.simulationBudget} runs · Capture radius {selectedDefaults.geometryDefaults.captureRadius} m
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-green-700 hover:bg-green-100 shrink-0"
              onClick={(e) => { e.stopPropagation(); setShowDefaults(!showDefaults); }}
            >
              <Settings2 className="w-4 h-4 mr-1" />
              {showDefaults ? 'Hide' : 'Show all'}
            </Button>
          </div>

          {showDefaults && (
            <div className="mt-2 p-4 rounded-lg border border-green-200 bg-white text-sm space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-slate-500 text-xs mb-1">Reliability Target</p>
                  <p className="font-semibold text-slate-900">{selectedDefaults.reliabilityTarget}%</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Approach Preset</p>
                  <p className="font-semibold text-slate-900 capitalize">{selectedDefaults.approachPreset}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Simulation Budget</p>
                  <p className="font-semibold text-slate-900">{selectedDefaults.simulationBudget} runs</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Capture Radius</p>
                  <p className="font-mono font-semibold text-slate-900">{selectedDefaults.geometryDefaults.captureRadius} m</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Ring Inner ⌀</p>
                  <p className="font-mono font-semibold text-slate-900">{selectedDefaults.geometryDefaults.ringInnerDiameter} m</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Compliance</p>
                  <p className="font-semibold text-slate-900 capitalize">{selectedDefaults.geometryDefaults.complianceLevel}</p>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-slate-500 text-xs mb-1">Sweep Ranges (typical preset)</p>
                <div className="font-mono text-xs text-slate-700 space-y-0.5">
                  <p>Start distance: {selectedDefaults.sweepRanges.startDistance.display}</p>
                  <p>Lateral offset: {selectedDefaults.sweepRanges.lateralOffset.display}</p>
                  <p>Closing speed: {selectedDefaults.sweepRanges.closingSpeed.display}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic">
                All defaults can be overridden in Steps 3 (Geometry) and 4 (Simulation Plan).
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <Button
          onClick={nextScreen}
          disabled={!isValid}
          size="lg"
          className="px-8 gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
