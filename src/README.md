# 125 Broadstreet — Dosing Calculator (TypeScript CLI + Module)

This repository contains a concise TypeScript implementation of an infusion dosing calculator that:
- Accepts THC% and/or THCA% (THCA converted to THC with factor 0.877)
- Uses an extraction efficiency percentage (default 75%)
- Accepts measurements in ml, tsp, tbsp, fl_oz, cup
- Outputs total mg in infusion, mg per unit, mg in recipe portion, and mg per serving

Files:
- `src/calc.ts` — core pure function `calculateDosage` (exported)
- `src/cli.ts` — small CLI that calls the calculator and prints results
- `package.json`, `tsconfig.json` — build/run configuration

Quick start:
1. Install
   - npm install
2. Build
   - npm run build
3. Run the CLI (examples):
   - npm run cli -- --examples
   - npm run cli -- --grams 7 --thc 21.5 --efficiency 75 --totalBaseMade 1 --totalBaseUnit cup --baseUsed 0.5 --recipeUnit cup --servings 10

Example explanation:
- Example 1: 7 g cannabis, 21.5% THC, 75% efficiency, 1 cup base made, recipe uses 0.5 cup, 10 servings
  - Use: `npm run cli -- --grams 7 --thc 21.5 --efficiency 75 --totalBaseMade 1 --totalBaseUnit cup --baseUsed 0.5 --recipeUnit cup --servings 10`

API (programmatic):
- Import the function in another TypeScript file:
```ts
import { calculateDosage } from "./dist/calc"; // or from src with ts-node

const result = calculateDosage({
  cannabisGrams: 7,
  thcPercent: 21.5,
  efficiencyPercent: 75,
  totalBaseMade: 1,
  totalBaseUnit: "cup",
  baseUsed: 0.5,
  recipeUnit: "cup",
  servings: 10
});
console.log(result);
```

Notes & suggestions:
- The core function is pure and easy to unit-test. Consider adding Jest tests that call `calculateDosage` with known inputs.
- If you want to use this in the browser, you can port the logic in `src/calc.ts` to a small client-side JS file and wire it into your existing UI.
- If you add a web UI that calls the logic, reuse the same conversion/logic to keep numbers consistent between CLI, tests, and UI.R
