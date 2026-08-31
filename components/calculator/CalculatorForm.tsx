"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { Calculator, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadReferenceExampleButton } from "@/components/calculator/LoadReferenceExampleButton";
import { LoadKeroseneWaterVaporExampleButton } from "@/components/calculator/LoadKeroseneWaterVaporExampleButton";
import { CoolingArrangementField } from "@/components/calculator/form-sections/CoolingArrangementField";
import { ShellSideFluidFields } from "@/components/calculator/form-sections/ShellSideFluidFields";
import { TubeSideFluidFields } from "@/components/calculator/form-sections/TubeSideFluidFields";
import { TubeGeometryFields } from "@/components/calculator/form-sections/TubeGeometryFields";
import { BaffleFields } from "@/components/calculator/form-sections/BaffleFields";
import { FoulingAndMaterialFields } from "@/components/calculator/form-sections/FoulingAndMaterialFields";
import { IterationSettingsFields } from "@/components/calculator/form-sections/IterationSettingsFields";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { IntroHero } from "@/components/intro/IntroHero";
import { ThemeToggle } from "@/components/ThemeToggle";
import { runCalculation } from "@/lib/calculations/runCalculation";
import { heatExchangerInputsSchema } from "@/lib/validation/inputSchema";
import { REFERENCE_EXAMPLE_INPUTS } from "@/lib/referenceExample";
import { KEROSENE_WATER_VAPOR_EXAMPLE_INPUTS } from "@/lib/keroseneWaterVaporExample";
import { estimateInitialU, type USuggestion, type UCategory } from "@/lib/constants/uValueTable";
import type { HeatExchangerInputs, HiSelectionMode } from "@/lib/types/inputs";

// Real computation is synchronous and sub-millisecond - this is a
// deliberate perceived-progress delay, not a real computation cost, so
// the Calculate button reads as "doing something" instead of a static
// instant swap.
const CALCULATE_FEEDBACK_MS = 550;

export function CalculatorForm() {
  const [entered, setEntered] = useState(false);
  const {
    register,
    control,
    setValue,
    getValues,
    watch,
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
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationCount, setCalculationCount] = useState(0);
  const [shellUCategory, setShellUCategory] = useState<UCategory | null>(null);
  const [tubeUCategory, setTubeUCategory] = useState<UCategory | null>(null);
  const [uSuggestion, setUSuggestion] = useState<USuggestion | null>(null);

  // Auto-fills "Initial assumed U" from typical literature ranges whenever
  // both fluids are selected (or reselected), the same one-shot-autofill
  // pattern as the fluid property fields - the user can still freely edit
  // the field afterwards.
  useEffect(() => {
    if (!shellUCategory || !tubeUCategory || tubeUCategory === "steam") {
      setUSuggestion(null);
      return;
    }
    const suggestion = estimateInitialU(shellUCategory, tubeUCategory);
    setUSuggestion(suggestion);
    setValue("initialUGuessWM2C", suggestion.midWM2C, { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shellUCategory, tubeUCategory]);

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
    setIsCalculating(true);
    window.setTimeout(() => {
      setSubmittedInputs(values);
      setCalculationCount((c) => c + 1);
      setIsCalculating(false);
    }, CALCULATE_FEEDBACK_MS);
  };

  const onLoadReferenceExample = () => {
    reset(REFERENCE_EXAMPLE_INPUTS);
    setSubmittedInputs(REFERENCE_EXAMPLE_INPUTS);
    setCalculationCount((c) => c + 1);
    // The reference example sets initialUGuessWM2C directly rather than via
    // a fluid preset selection, so clear any stale preset-driven suggestion.
    setShellUCategory(null);
    setTubeUCategory(null);
  };

  const onLoadKeroseneWaterVaporExample = () => {
    reset(KEROSENE_WATER_VAPOR_EXAMPLE_INPUTS);
    setSubmittedInputs(KEROSENE_WATER_VAPOR_EXAMPLE_INPUTS);
    setCalculationCount((c) => c + 1);
    // Reflect the example's actual fluids (gas shell / light-oil tube) so
    // the U-suggestion caption matches instead of showing stale/no info.
    setShellUCategory("gas");
    setTubeUCategory("light-oil");
  };

  // Cmd/Ctrl+Enter submits from anywhere in the form.
  useEffect(() => {
    if (!entered) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entered]);

  return (
    <AnimatePresence mode="wait">
      {!entered ? (
        <IntroHero key="intro" onEnter={() => setEntered(true)} />
      ) : (
        <motion.div
          key="calculator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 print:px-0"
        >
          <header className="flex items-start justify-between gap-4 print:hidden">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold tracking-tight">
                Shell &amp; Tube Heat Exchanger Calculator
              </h1>
              <p className="text-sm text-muted-foreground">
                Kern&apos;s-method design calculator with iterative U convergence and
                digitized chart correlations.
              </p>
            </div>
            <ThemeToggle />
          </header>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6 print:hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-muted-foreground">Design inputs</h2>
              <div className="flex flex-wrap items-center gap-2">
                <LoadReferenceExampleButton onClick={onLoadReferenceExample} />
                <LoadKeroseneWaterVaporExampleButton onClick={onLoadKeroseneWaterVaporExample} />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cooling arrangement</CardTitle>
              </CardHeader>
              <CardContent>
                <CoolingArrangementField
                  control={control}
                  watch={watch}
                  setValue={setValue}
                  getValues={getValues}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Shell-side fluid</CardTitle>
              </CardHeader>
              <CardContent>
                <ShellSideFluidFields
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                  watch={watch}
                  onCategoryChange={setShellUCategory}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tube-side fluid</CardTitle>
              </CardHeader>
              <CardContent>
                <TubeSideFluidFields
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                  watch={watch}
                  onCategoryChange={setTubeUCategory}
                />
              </CardContent>
            </Card>

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
                <FoulingAndMaterialFields register={register} errors={errors} setValue={setValue} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Iteration settings</CardTitle>
              </CardHeader>
              <CardContent>
                <IterationSettingsFields register={register} errors={errors} uSuggestion={uSuggestion} />
              </CardContent>
            </Card>

            <div>
              <motion.div
                className="inline-block"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button type="submit" size="lg" disabled={isCalculating}>
                  {isCalculating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Calculator className="size-4" />
                  )}
                  {isCalculating ? "Calculating…" : "Calculate"}
                </Button>
              </motion.div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Tip: press {typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent) ? "⌘" : "Ctrl"}+Enter to calculate from anywhere in the form.
              </p>
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
              key={calculationCount}
              result={result}
              inputs={submittedInputs}
              hiSelectionMode={hiSelectionMode}
              onHiSelectionModeChange={setHiSelectionMode}
            />
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
