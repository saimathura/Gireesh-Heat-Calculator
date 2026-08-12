"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadReferenceExampleButton } from "@/components/calculator/LoadReferenceExampleButton";
import { ShellSideFluidFields } from "@/components/calculator/form-sections/ShellSideFluidFields";
import { TubeSideFluidFields } from "@/components/calculator/form-sections/TubeSideFluidFields";
import { TubeGeometryFields } from "@/components/calculator/form-sections/TubeGeometryFields";
import { BaffleFields } from "@/components/calculator/form-sections/BaffleFields";
import { FoulingAndMaterialFields } from "@/components/calculator/form-sections/FoulingAndMaterialFields";
import { IterationSettingsFields } from "@/components/calculator/form-sections/IterationSettingsFields";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { runCalculation } from "@/lib/calculations/runCalculation";
import { heatExchangerInputsSchema } from "@/lib/validation/inputSchema";
import { REFERENCE_EXAMPLE_INPUTS } from "@/lib/referenceExample";
import type { HeatExchangerInputs, HiSelectionMode } from "@/lib/types/inputs";

const SECTIONS = [
  { title: "Shell-side fluid", Component: ShellSideFluidFields },
  { title: "Tube-side fluid", Component: TubeSideFluidFields },
] as const;

export function CalculatorForm() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HeatExchangerInputs>({
    resolver: zodResolver(heatExchangerInputsSchema),
    defaultValues: REFERENCE_EXAMPLE_INPUTS,
  });

  const [submittedInputs, setSubmittedInputs] = useState<HeatExchangerInputs>(
    REFERENCE_EXAMPLE_INPUTS,
  );
  const [hiSelectionMode, setHiSelectionMode] =
    useState<HiSelectionMode>("conservative");

  const { result, calcError } = useMemo(() => {
    try {
      return {
        result: runCalculation(submittedInputs, hiSelectionMode),
        calcError: null as string | null,
      };
    } catch (err) {
      return {
        result: null,
        calcError: err instanceof Error ? err.message : "Calculation failed.",
      };
    }
  }, [submittedInputs, hiSelectionMode]);

  const onSubmit = (values: HeatExchangerInputs) => {
    setSubmittedInputs(values);
  };

  const onLoadReferenceExample = () => {
    reset(REFERENCE_EXAMPLE_INPUTS);
    setSubmittedInputs(REFERENCE_EXAMPLE_INPUTS);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 print:px-0">
      <header className="flex flex-col gap-1 print:hidden">
        <h1 className="text-xl font-semibold tracking-tight">
          Shell &amp; Tube Heat Exchanger Calculator
        </h1>
        <p className="text-sm text-muted-foreground">
          Kern&apos;s-method design calculator with iterative U convergence and
          digitized chart correlations.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 print:hidden"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Design inputs</h2>
          <LoadReferenceExampleButton onClick={onLoadReferenceExample} />
        </div>

        {SECTIONS.map(({ title, Component }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Component register={register} errors={errors} />
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tube geometry &amp; layout</CardTitle>
          </CardHeader>
          <CardContent>
            <TubeGeometryFields register={register} errors={errors} control={control} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Baffles</CardTitle>
          </CardHeader>
          <CardContent>
            <BaffleFields register={register} errors={errors} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Fouling &amp; tube material</CardTitle>
          </CardHeader>
          <CardContent>
            <FoulingAndMaterialFields register={register} errors={errors} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Iteration settings</CardTitle>
          </CardHeader>
          <CardContent>
            <IterationSettingsFields register={register} errors={errors} />
          </CardContent>
        </Card>

        <div>
          <Button type="submit" size="lg">
            <Calculator className="size-4" />
            Calculate
          </Button>
        </div>
      </form>

      {calcError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not compute a result</AlertTitle>
          <AlertDescription>{calcError}</AlertDescription>
        </Alert>
      ) : null}

      {result ? (
        <ResultsPanel
          result={result}
          hiSelectionMode={hiSelectionMode}
          onHiSelectionModeChange={setHiSelectionMode}
        />
      ) : null}
    </div>
  );
}
