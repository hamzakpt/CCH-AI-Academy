import { Card, CardContent, CardHeader, CardTitle } from '@ai-adventure/app/components/ui/card';
import { Button } from '@ai-adventure/app/components/ui/button';
import { Alert, AlertDescription } from '@ai-adventure/app/components/ui/alert';
import { AgentStep } from '@ai-adventure/app/types/scenario';
import { AlertTriangle, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

interface HITLGateProps {
  step: AgentStep;
  onApprove: () => void;
  onReject: () => void;
}

export function HITLGate({ step, onApprove, onReject }: HITLGateProps) {
  return (
    <div className="space-y-4">
      <Alert className="bg-orange-50 border-2 border-orange-300">
        <ShieldAlert className="h-5 w-5 text-orange-600" />
        <AlertDescription className="text-orange-900">
          <strong className="text-lg">Human Approval Required</strong>
          <p className="mt-2">This is a critical step that requires your review before the agent proceeds.</p>
        </AlertDescription>
      </Alert>

      <Card className="border-2 border-orange-300 bg-white">
        <CardHeader className="bg-orange-50 border-b border-orange-200">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            {step.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div>
            <h4 className="font-semibold mb-2">What the agent wants to do:</h4>
            <p className="text-gray-700">{step.description}</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Review Required:</h4>
            <p className="text-yellow-800">{step.hitlMessage}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Agent will use:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Tools:</span>
                <span className="ml-2 font-medium">{step.tools.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-600">Data:</span>
                <span className="ml-2 font-medium">{step.dataUsed.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-600">Expected result:</span>
                <span className="ml-2 font-medium">{step.successCriteria}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onApprove}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Approve & Continue
            </Button>
            <Button
              onClick={onReject}
              variant="outline"
              className="flex-1 border-2 border-red-300 text-red-700 hover:bg-red-50"
              size="lg"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Reject & Stop
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            💡 In production, this gate prevents costly mistakes and ensures compliance
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
