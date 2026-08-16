import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { HelpCircle, Zap, Archive, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { WizardData, ComplianceLevelType } from '../App';
import { getMissionDefaults } from '../utils/missionDefaults';

interface Props {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
}

const vehicleClassLabels: Record<string, string> = {
  small: 'Small (< 500 kg)',
  medium: 'Medium (500 kg–5,000 kg)',
  large: 'Large (> 5,000 kg)',
};

export function Screen3GeometryInputs({ data, updateData, nextScreen, prevScreen }: Props) {
  // Prefill geometry defaults from vehicle class if not already set
  useEffect(() => {
    if (data.missionContext && !data.captureRadius) {
      const defaults = getMissionDefaults(data.missionContext);
      updateData({
        captureRadius: defaults.geometryDefaults.captureRadius,
        ringInnerDiameter: defaults.geometryDefaults.ringInnerDiameter,
        complianceLevel: defaults.geometryDefaults.complianceLevel,
      });
    }
  }, [data.missionContext]);

  const handleNext = () => {
    if (data.captureRadius && data.ringInnerDiameter && data.complianceLevel) {
      nextScreen();
    }
  };

  const isFormValid =
    data.captureRadius &&
    data.captureRadius > 0 &&
    data.ringInnerDiameter &&
    data.ringInnerDiameter > 0 &&
    data.complianceLevel;

  const missionConfig = data.missionContext ? getMissionDefaults(data.missionContext) : null;
  const classLabel = data.missionContext ? vehicleClassLabels[data.missionContext] : null;

  return (
    <div className="container max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-3 py-1">
            Step 3 of 5
          </Badge>
          <Badge variant="outline" className="text-slate-500 px-3 py-1">
            Ring / Soft-Capture
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Interface Geometry
        </h1>
        <p className="text-slate-600">
          Configure ring dimensions and mechanical properties.
          {classLabel && <> Defaults loaded from vehicle class <strong>{classLabel}</strong>.</>}
        </p>
      </div>

      {/* Mission-specific warnings */}
      {missionConfig && missionConfig.warnings.length > 0 && (
        <Alert className="mb-6 border-amber-300 bg-amber-50">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="ml-2">
            <p className="font-semibold text-amber-900 mb-2">
              {classLabel} — Design Considerations
            </p>
            <ul className="space-y-1 text-sm text-amber-800">
              {missionConfig.warnings.map((warning, idx) => (
                <li key={idx}>• {warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* V1 model note */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                V1 Contact-Aware Envelope Generation
              </h3>
              <p className="text-sm text-blue-800">
                <strong>Capture Radius</strong> is wired to the Simulink contact
                simulation model in V1. Ring Diameter and Compliance are stored
                now and will activate automatically in vNext model versions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ring Geometry Parameters</CardTitle>
              <CardDescription>
                {classLabel ? `Defaults from ${classLabel}` : 'Ring / Soft-Capture configuration'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Capture Radius — V1 Active */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="captureRadius">Capture Radius (m) *</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Distance from ring centre-line at which capture features begin
                          engagement. This directly drives the V1 envelope simulation.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Badge variant="outline" className="text-xs bg-green-50 border-green-400 text-green-700">
                    <Zap className="w-3 h-3 mr-1" />
                    V1 Active
                  </Badge>
                </div>
                <Input
                  id="captureRadius"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.4"
                  value={data.captureRadius || ''}
                  onChange={(e) => updateData({ captureRadius: parseFloat(e.target.value) })}
                  className="font-mono max-w-xs"
                />
                {missionConfig && (
                  <p className="text-xs text-slate-600">
                    💡 Recommended for {classLabel}: {missionConfig.geometryRecommendations.captureRadiusRange}
                  </p>
                )}
              </div>

              {/* Ring Inner Diameter — Stored */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="ringDiameter">Ring Inner Diameter (m) *</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Inner diameter of the docking ring. Stored now; will be wired
                          to the contact model in vNext.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Badge variant="outline" className="text-xs bg-slate-50 border-slate-300 text-slate-600">
                    <Archive className="w-3 h-3 mr-1" />
                    Stored (vNext)
                  </Badge>
                </div>
                <Input
                  id="ringDiameter"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.8"
                  value={data.ringInnerDiameter || ''}
                  onChange={(e) => updateData({ ringInnerDiameter: parseFloat(e.target.value) })}
                  className="font-mono max-w-xs"
                />
                {missionConfig && (
                  <p className="text-xs text-slate-600">
                    💡 Recommended for {classLabel}: {missionConfig.geometryRecommendations.ringDiameterRange}
                  </p>
                )}
              </div>

              {/* Compliance Level — Stored */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="compliance">Soft-Capture Compliance Level *</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Stiffness of the capture mechanism springs. Low = rigid, High = compliant.
                          Stored for vNext calibration.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Badge variant="outline" className="text-xs bg-slate-50 border-slate-300 text-slate-600">
                    <Archive className="w-3 h-3 mr-1" />
                    Stored (vNext)
                  </Badge>
                </div>
                <Select
                  value={data.complianceLevel}
                  onValueChange={(value) => updateData({ complianceLevel: value as ComplianceLevelType })}
                >
                  <SelectTrigger id="compliance" className="max-w-xs">
                    <SelectValue placeholder="Select compliance level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Stiff)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High (Compliant)</SelectItem>
                  </SelectContent>
                </Select>
                {missionConfig && (
                  <p className="text-xs text-slate-600">
                    💡 {missionConfig.geometryRecommendations.complianceNote}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Optional Fields */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Optional Parameters</CardTitle>
                  <CardDescription>Stored for future higher-fidelity models</CardDescription>
                </div>
                <Badge variant="secondary">
                  <Archive className="w-3 h-3 mr-1" />
                  Future Use
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="chamfer">Guide Chamfer / Lead-in (mm)</Label>
                <Input
                  id="chamfer"
                  type="number"
                  step="0.1"
                  placeholder="10"
                  value={data.guideChamfer || ''}
                  onChange={(e) => updateData({ guideChamfer: parseFloat(e.target.value) })}
                  className="font-mono max-w-xs"
                />
                <p className="text-xs text-slate-500">
                  Will be used in V2 for detailed contact geometry modelling.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="friction">Coefficient of Friction (μ)</Label>
                <Input
                  id="friction"
                  type="number"
                  step="0.01"
                  placeholder="0.2"
                  value={data.frictionCoefficient || ''}
                  onChange={(e) =>
                    updateData({ frictionCoefficient: parseFloat(e.target.value) })
                  }
                  className="font-mono max-w-xs"
                />
                <p className="text-xs text-slate-500">Default: 0.2</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Contact Material Preset</Label>
                <Select
                  value={data.contactMaterial}
                  onValueChange={(value) => updateData({ contactMaterial: value })}
                >
                  <SelectTrigger id="material" className="max-w-xs">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aluminum">Aluminium</SelectItem>
                    <SelectItem value="steel">Steel</SelectItem>
                    <SelectItem value="composite">Composite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Field Status Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg">V1 Model Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-100 text-green-700">
                    <Zap className="w-3 h-3 mr-1" />
                    V1 Active
                  </Badge>
                </div>
                <p className="text-slate-600 mb-2">Wired to Simulink:</p>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>Capture Radius</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    <Archive className="w-3 h-3 mr-1" />
                    Stored (vNext)
                  </Badge>
                </div>
                <p className="text-slate-600 mb-2">Required, pending calibration:</p>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>Ring Inner Diameter</li>
                  <li>Compliance Level</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    Future Use
                  </Badge>
                </div>
                <p className="text-slate-600 mb-2">Optional — higher fidelity:</p>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>Guide Chamfer</li>
                  <li>Friction Coefficient</li>
                  <li>Material Preset</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-slate-500">
                  💡 All fields are stored in your configuration. As model versions
                  progress, more fields activate automatically.
                </p>
              </div>
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
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
