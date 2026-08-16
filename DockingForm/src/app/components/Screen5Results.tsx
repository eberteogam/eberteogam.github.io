import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import {
  Download,
  FileJson,
  FileText,
  Sheet,
  Play,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Settings,
  Beaker,
  Zap,
  ChevronLeft,
} from 'lucide-react';
import { WizardData, SimulationStatus, SimulationResults } from '../App';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Cell,
} from 'recharts';

interface Props {
  data: WizardData;
  prevScreen: () => void;
  goToScreen: (screen: number) => void;
  simulationStatus: SimulationStatus;
  simulationResults: SimulationResults | null;
  simulationError: string | null;
  simulationProgress: number;
  runSimulation: () => void;
  prototypeMode: boolean;
  setPrototypeMode: (mode: boolean) => void;
}

const vehicleClassLabels: Record<string, string> = {
  small: 'Small (< 500 kg)',
  medium: 'Medium (500–5,000 kg)',
  large: 'Large (> 5,000 kg)',
};

export function Screen5Results({
  data,
  prevScreen,
  goToScreen,
  simulationStatus,
  simulationResults,
  simulationError,
  simulationProgress,
  runSimulation,
  prototypeMode,
  setPrototypeMode,
}: Props) {
  const handleExportRequestJSON = () => {
    const requestData = {
      schema: 'docking-envelope-basilisk',
      version: '1.0',
      configuration: {
        missionName: data.missionName || null,
        vehicleClass: data.missionContext,
        interfaceFamily: data.interfaceFamily,
        ringInnerDiameter: data.ringInnerDiameter,
        captureRadius: data.captureRadius,
        guideChamfer: data.guideChamfer || null,
        complianceLevel: data.complianceLevel,
        frictionCoefficient: data.frictionCoefficient || null,
        contactMaterial: data.contactMaterial || null,
        reliabilityTarget: data.reliabilityTarget,
        simulationBudget: data.simulationBudget,
        approachPreset: data.approachPreset,
        customStartDistance: data.customStartDistance || null,
        customLateralOffset: data.customLateralOffset || null,
        customClosingSpeed: data.customClosingSpeed || null,
      },
    };

    const blob = new Blob([JSON.stringify(requestData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docking-request${data.missionName ? `-${data.missionName.replace(/\s+/g, '-')}` : ''}.json`;
    a.click();
  };

  const handleExportRunArtifactJSON = () => {
    if (!simulationResults) return;

    const exportData = {
      schema: 'docking-envelope-basilisk',
      version: '1.0',
      configuration: {
        missionName: data.missionName || null,
        vehicleClass: data.missionContext,
        interfaceFamily: data.interfaceFamily,
        ringInnerDiameter: data.ringInnerDiameter,
        captureRadius: data.captureRadius,
        guideChamfer: data.guideChamfer || null,
        complianceLevel: data.complianceLevel,
        frictionCoefficient: data.frictionCoefficient || null,
        contactMaterial: data.contactMaterial || null,
        reliabilityTarget: data.reliabilityTarget,
        simulationBudget: data.simulationBudget,
        approachPreset: data.approachPreset,
        customStartDistance: data.customStartDistance || null,
        customLateralOffset: data.customLateralOffset || null,
        customClosingSpeed: data.customClosingSpeed || null,
      },
      results: {
        envelope: simulationResults.envelope,
        simulation: simulationResults.simulation,
        timestamp: simulationResults.timestamp,
        modelVersion: simulationResults.modelVersion,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docking-envelope-basilisk${data.missionName ? `-${data.missionName.replace(/\s+/g, '-')}` : ''}.json`;
    a.click();
  };

  const handleExportPDF = () => {
    alert(
      'PDF export would generate a comprehensive report for procurement and verification teams.'
    );
  };

  const handleExportCSV = () => {
    if (!simulationResults?.heatmapData) return;

    const csv = [
      'offset_m,speed_mps,success',
      ...simulationResults.heatmapData.map(
        (row) => `${row.offset},${row.speed},${row.success}`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simulation-runs.csv';
    a.click();
  };

  const getSweepSummary = () => {
    if (data.customStartDistance || data.customLateralOffset || data.customClosingSpeed) {
      return 'Custom user-defined ranges';
    }
    switch (data.approachPreset) {
      case 'conservative':
        return 'Conservative — tighter ranges, lower speeds';
      case 'typical':
        return 'Typical — standard operational ranges';
      case 'aggressive':
        return 'Aggressive — wide ranges, higher speeds';
      default:
        return 'Not specified';
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-3 py-1">
              Step 5 of 5
            </Badge>
            <Badge variant="outline" className="text-slate-500 px-3 py-1">
              Results Dashboard
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Results Dashboard</h1>
          <p className="text-slate-600">
            Contact-aware docking envelope analysis
            {data.missionName && (
              <> — <strong className="text-slate-800">{data.missionName}</strong></>
            )}
          </p>
        </div>

        {/* Prototype Mode Toggle */}
        <Card className="border-purple-200 shrink-0">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              {prototypeMode ? (
                <Beaker className="w-5 h-5 text-purple-600" />
              ) : (
                <Zap className="w-5 h-5 text-blue-600" />
              )}
              <div className="flex-1">
                <Label
                  htmlFor="prototype-toggle"
                  className="cursor-pointer font-semibold text-sm"
                >
                  {prototypeMode ? 'Prototype Mode' : 'Connected Mode'}
                </Label>
                <p className="text-xs text-slate-600">
                  {prototypeMode
                    ? 'Mock results for testing'
                    : 'Simulink backend required'}
                </p>
              </div>
              <Switch
                id="prototype-toggle"
                checked={prototypeMode}
                onCheckedChange={setPrototypeMode}
                disabled={simulationStatus === 'running'}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Results Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Not-run state */}
          {simulationStatus === 'not-run' && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500 text-white rounded-lg">
                    <Play className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Ready to Generate Envelope
                    </h3>
                    <p className="text-blue-800 mb-4">
                      Configuration complete. Click below to run the Simulink contact-aware
                      simulation and compute your docking envelope.
                    </p>
                    <Button
                      onClick={runSimulation}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Run Simulation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Running state */}
          {simulationStatus === 'running' && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-500 text-white rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                      Simulation Running
                    </h3>
                    <p className="text-yellow-800 mb-4">
                      Running {data.simulationBudget} Monte Carlo sweeps with contact dynamics…
                    </p>
                    <Progress value={simulationProgress} className="h-2" />
                    <p className="text-sm text-yellow-700 mt-2">
                      {simulationProgress}% complete
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Failed state */}
          {simulationStatus === 'failed' && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500 text-white rounded-lg">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                      Simulation Failed
                    </h3>
                    <p className="text-red-800 mb-4">{simulationError}</p>
                    <Button
                      onClick={runSimulation}
                      variant="outline"
                      className="border-red-300"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed state */}
          {simulationStatus === 'completed' && simulationResults && (
            <>
              <Alert className="border-green-300 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="ml-2">
                  <span className="font-semibold text-green-900">Simulation Complete — </span>
                  <span className="text-green-800 text-sm">
                    Computed at {new Date(simulationResults.timestamp).toLocaleString()} ·{' '}
                    {simulationResults.modelVersion}
                  </span>
                </AlertDescription>
              </Alert>

              {/* Envelope metric cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Maximum Lateral Offset</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {simulationResults.envelope.max_offset_m.toFixed(3)} m
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      @ {simulationResults.simulation.reliability_target}% reliability
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Maximum Approach Speed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {simulationResults.envelope.max_speed_mps.toFixed(3)} m/s
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      @ {simulationResults.simulation.reliability_target}% reliability
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Overall Success Rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {simulationResults.envelope.success_rate_pct.toFixed(1)}%
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      of {simulationResults.simulation.total_runs} runs
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Heatmap */}
              <Card>
                <CardHeader>
                  <CardTitle>Success Probability Heatmap</CardTitle>
                  <CardDescription>
                    Contact-aware simulation results: Success (green) vs Failure (red)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="offset"
                        name="Lateral Offset"
                        unit="m"
                        label={{
                          value: 'Lateral Offset (m)',
                          position: 'bottom',
                          offset: 40,
                        }}
                      />
                      <YAxis
                        type="number"
                        dataKey="speed"
                        name="Approach Speed"
                        unit="m/s"
                        label={{
                          value: 'Approach Speed (m/s)',
                          angle: -90,
                          position: 'left',
                          offset: 40,
                        }}
                      />
                      <ZAxis type="number" range={[30, 60]} />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const pt = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-lg">
                                <p className="font-semibold">
                                  {pt.success ? '✓ Success' : '✗ Failure'}
                                </p>
                                <p className="text-sm">Offset: {pt.offset.toFixed(3)} m</p>
                                <p className="text-sm">Speed: {pt.speed.toFixed(3)} m/s</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter data={simulationResults.heatmapData || []}>
                        {(simulationResults.heatmapData || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.success ? '#10b981' : '#ef4444'}
                            fillOpacity={0.6}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-slate-500 mt-4 text-center">
                    Each point represents one simulation run from the Monte Carlo sweep
                  </p>
                </CardContent>
              </Card>

              {/* Export */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Results</CardTitle>
                  <CardDescription>
                    Download simulation data in various formats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={handleExportRunArtifactJSON}
                      variant="outline"
                      className="justify-start h-auto py-4"
                    >
                      <div className="flex items-start gap-3">
                        <FileJson className="w-5 h-5 mt-0.5 text-blue-600" />
                        <div className="text-left">
                          <div className="font-semibold">Run Artifact JSON</div>
                          <div className="text-xs text-slate-600">For Basilisk/bsk-rl</div>
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={handleExportPDF}
                      variant="outline"
                      className="justify-start h-auto py-4"
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 mt-0.5 text-red-600" />
                        <div className="text-left">
                          <div className="font-semibold">PDF Report</div>
                          <div className="text-xs text-slate-600">Procurement/Verification</div>
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={handleExportCSV}
                      variant="outline"
                      className="justify-start h-auto py-4"
                    >
                      <div className="flex items-start gap-3">
                        <Sheet className="w-5 h-5 mt-0.5 text-green-600" />
                        <div className="text-left">
                          <div className="font-semibold">CSV Data</div>
                          <div className="text-xs text-slate-600">All simulation runs</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Locked / pending state */}
          {simulationStatus !== 'completed' && (
            <Card className="border-slate-200 bg-slate-50 opacity-60">
              <CardHeader>
                <CardTitle className="text-slate-400">Results Pending</CardTitle>
                <CardDescription>
                  Run the simulation to see envelope metrics and heatmap
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Results will appear here after simulation completes</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Configuration Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg">Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-slate-900">Interface Parameters</h4>
                <dl className="space-y-1">
                  {data.missionName && (
                    <div className="flex justify-between">
                      <dt className="text-slate-600">Mission:</dt>
                      <dd className="font-medium text-right truncate ml-2 max-w-[140px]">
                        {data.missionName}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Vehicle Class:</dt>
                    <dd className="font-medium text-right">
                      {data.missionContext
                        ? vehicleClassLabels[data.missionContext]
                        : '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Interface:</dt>
                    <dd className="font-medium text-right">Ring / Soft-Capture</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Capture Radius:</dt>
                    <dd className="font-medium font-mono text-right">
                      {data.captureRadius} m
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Ring ⌀:</dt>
                    <dd className="font-medium font-mono text-right">
                      {data.ringInnerDiameter} m
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Compliance:</dt>
                    <dd className="font-medium text-right capitalize">
                      {data.complianceLevel}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2 text-slate-900">Sweep Parameters</h4>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Preset:</dt>
                    <dd className="font-medium text-right capitalize">
                      {data.approachPreset}
                    </dd>
                  </div>
                  <div className="mt-2">
                    <dt className="text-slate-600 mb-1">Summary:</dt>
                    <dd className="text-xs text-slate-700 bg-slate-50 p-2 rounded">
                      {getSweepSummary()}
                    </dd>
                  </div>
                  <div className="flex justify-between pt-2">
                    <dt className="text-slate-600">Reliability:</dt>
                    <dd className="font-medium text-right">{data.reliabilityTarget}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Runs:</dt>
                    <dd className="font-medium text-right">{data.simulationBudget}</dd>
                  </div>
                </dl>
              </div>

              {simulationResults && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2 text-slate-900">Run Metadata</h4>
                  <dl className="space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-slate-600">Model:</dt>
                      <dd className="font-medium text-right text-xs">
                        {simulationResults.modelVersion}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-600">Timestamp:</dt>
                      <dd className="font-mono text-xs text-right">
                        {new Date(simulationResults.timestamp).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-600">Total Runs:</dt>
                      <dd className="font-medium text-right">
                        {simulationResults.simulation.total_runs}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <Button
                  onClick={() => goToScreen(3)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Geometry
                </Button>
                <Button
                  onClick={handleExportRequestJSON}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <FileJson className="w-4 h-4 mr-2" />
                  Export Request JSON
                </Button>
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
        {simulationStatus === 'completed' && (
          <Button onClick={handleExportRunArtifactJSON} size="lg">
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        )}
      </div>
    </div>
  );
}
