/**
 * Core dosing calculator (TypeScript)
 *
 * Supports:
 * - THC% and/or THCA% (THCA -> THC using factor 0.877)
 * - Efficiency % (default 75)
 * - Units: ml, tsp, tbsp, fl_oz, cup
 * - Outputs: total mg in infusion, mg per unit, mg in recipe, mg per serving
 */

export type Unit = "ml" | "tsp" | "tbsp" | "fl_oz" | "cup";

export interface Inputs {
  cannabisGrams: number;
  thcPercent?: number;      // optional, default 0
  thcaPercent?: number;     // optional, default 0 (converted to THC using 0.877)
  efficiencyPercent?: number; // optional, default 75
  totalBaseMade: number;
  totalBaseUnit: Unit;
  baseUsed: number;
  recipeUnit: Unit;
  servings: number;
}

export interface Results {
  totalThcMg: number;            // total mg THC in infusion (after efficiency)
  mgPerMl: number;               // mg per mL of base
  mgPerUnit: Record<Unit, number>; // mg per each supported unit
  totalThcInRecipe: number;      // total mg THC in the recipe portion used
  mgPerServing: number;          // mg per serving
}

/** conversion from named units to mL */
const CONVERSION_TO_ML: Record<Unit, number> = {
  ml: 1,
  tsp: 4.92892,
  tbsp: 14.7868,
  fl_oz: 29.5735,
  cup: 236.588
};

/** THCA -> THC conversion factor when fully decarboxylated */
const THCA_TO_THC = 0.877;

/** Rounds a number to 2 decimal places */
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** Main calculation function */
export function calculateDosage(input: Inputs): Results {
  // Normalize and defaults
  const cannabisGrams = Math.max(0, input.cannabisGrams || 0);
  const thcPercent = Math.max(0, input.thcPercent || 0);
  const thcaPercent = Math.max(0, input.thcaPercent || 0);
  const efficiencyPercent = (input.efficiencyPercent === undefined) ? 75 : Math.max(0, input.efficiencyPercent || 0);
  const totalBaseMade = Math.max(0, input.totalBaseMade || 0);
  const totalBaseUnit = input.totalBaseUnit;
  const baseUsed = Math.max(0, input.baseUsed || 0);
  const recipeUnit = input.recipeUnit;
  const servings = Math.max(0, input.servings || 0);

  // Convert THCA to THC and combine
  const thcFromThca = thcaPercent * THCA_TO_THC;
  const totalThcPercent = thcPercent + thcFromThca;

  // Total THC in mg (grams -> mg = grams * 1000)
  const totalThcMg = cannabisGrams * 1000 * (totalThcPercent / 100) * (efficiencyPercent / 100);

  // Convert base quantities to mL
  const totalBaseMl = (CONVERSION_TO_ML[totalBaseUnit] || 1) * totalBaseMade;
  const baseUsedMl = (CONVERSION_TO_ML[recipeUnit] || 1) * baseUsed;

  // Avoid divide by zero
  const mgPerMl = totalBaseMl > 0 ? totalThcMg / totalBaseMl : 0;

  // Total THC in the recipe portion used and per serving
  const totalThcInRecipe = mgPerMl * baseUsedMl;
  const mgPerServing = servings > 0 ? totalThcInRecipe / servings : 0;

  // mg per unit conversions
  const mgPerUnit: Record<Unit, number> = {
    ml: round2(mgPerMl),
    tsp: round2(mgPerMl * CONVERSION_TO_ML.tsp),
    tbsp: round2(mgPerMl * CONVERSION_TO_ML.tbsp),
    fl_oz: round2(mgPerMl * CONVERSION_TO_ML.fl_oz),
    cup: round2(mgPerMl * CONVERSION_TO_ML.cup)
  };

  return {
    totalThcMg: round2(totalThcMg),
    mgPerMl: round2(mgPerMl),
    mgPerUnit,
    totalThcInRecipe: round2(totalThcInRecipe),
    mgPerServing: round2(mgPerServing)
  };
}
