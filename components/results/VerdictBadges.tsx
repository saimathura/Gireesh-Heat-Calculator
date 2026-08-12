import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { CalculationResult } from "@/lib/types/results";

export function VerdictBadges({ result }: { result: CalculationResult }) {
  const allOk =
    result.verdicts.convergenceOk &&
    result.verdicts.tubeDeltaPOk &&
    result.verdicts.shellDeltaPOk;

  return (
    <Alert variant={allOk ? "default" : "destructive"} className="print:border">
      {allOk ? (
        <CheckCircle2 className="text-emerald-600" />
      ) : (
        <AlertTriangle />
      )}
      <AlertTitle>{allOk ? "Design OK" : "Review required"}</AlertTitle>
      <AlertDescription>
        <ul className="list-inside list-disc space-y-0.5">
          {result.verdicts.messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
