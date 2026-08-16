import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  Cone,
  ArrowRight,
  Lock,
  Clock,
} from 'lucide-react';
import { WizardData } from '../App';

interface Props {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  nextScreen: () => void;
  prevScreen: () => void;
}

export function Screen2InterfaceFamily({
  data,
  updateData,
  nextScreen,
  prevScreen,
}: Props) {
  // Ring is the only supported interface; auto-select on mount
  useEffect(() => {
    if (data.interfaceFamily !== 'ring-soft-capture') {
      updateData({ interfaceFamily: 'ring-soft-capture' });
    }
  }, []);

  return (
    <div className="container max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-3 py-1">
            Step 2 of 5
          </Badge>
          <Badge variant="outline" className="text-slate-500 px-3 py-1">
            Interface Family
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Interface Family
        </h1>
        <p className="text-slate-600">
          V1 supports the <strong>Ring / Soft-Capture</strong> interface covering
          both docking sub-phases. Additional interface types are on the roadmap.
        </p>
      </div>

      {/* Phase flow diagram */}
      <Alert className="mb-8 border-blue-200 bg-blue-50">
        <AlertDescription className="flex items-center gap-3 flex-wrap text-sm text-blue-800">
          <span className="font-semibold text-blue-900">Ring Docking Phases:</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
              Rendezvous
            </span>
            <ArrowRight className="w-4 h-4 text-blue-500" />
            <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold">
              Soft Capture
            </span>
            <ArrowRight className="w-4 h-4 text-blue-500" />
            <span className="px-3 py-1 bg-blue-700 text-white rounded-full text-xs font-semibold">
              Hard Capture
            </span>
          </div>
          <span className="text-blue-700 text-xs ml-auto">
            Both sub-phases modelled in V1
          </span>
        </AlertDescription>
      </Alert>

      <div className="space-y-4 mb-8">
        {/* Active: Ring / Soft-Capture */}
        <Card className="ring-2 ring-blue-500 bg-blue-50 cursor-default">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-500 text-white">
                <Circle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-xl">Ring / Soft-Capture</CardTitle>
                  <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                    V1 Supported
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Selected
                  </Badge>
                </div>
                <CardDescription className="text-base text-slate-700">
                  Annular capture ring with compliant mechanisms. Covers the full
                  docking sequence from initial ring contact through rigid latching.
                </CardDescription>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">
                      Soft Capture
                    </p>
                    <p className="text-sm text-slate-700">
                      Ring contacts target interface. Capture latches engage, arresting
                      relative motion and absorbing residual energy.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-800 mb-1 uppercase tracking-wide">
                      Hard Capture
                    </p>
                    <p className="text-sm text-slate-700">
                      Structural hooks pull vehicles together to a rigid mated state.
                      Seal &amp; tunnel pressurisation (if crewed) can then proceed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Coming soon: Probe-and-Drogue */}
        <Card className="opacity-55 cursor-not-allowed bg-slate-50 border-dashed">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-slate-200 text-slate-400">
                <Cone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-xl text-slate-500">
                    Probe-and-Drogue
                  </CardTitle>
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="w-3 h-3" />
                    Coming Soon
                  </Badge>
                  <Badge variant="outline" className="gap-1 text-slate-400">
                    <Lock className="w-3 h-3" />
                    Locked
                  </Badge>
                </div>
                <CardDescription className="text-slate-500">
                  Probe extends into drogue receptacle for initial capture and
                  alignment. Planned for a future release.
                </CardDescription>
                <p className="text-xs text-slate-400 mt-2">
                  Contact the Pilot Team to discuss early access.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={prevScreen} variant="outline" size="lg" className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={nextScreen}
          size="lg"
          className="px-8 gap-2"
        >
          Continue to Geometry
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
