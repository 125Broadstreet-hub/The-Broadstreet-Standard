#!/usr/bin/env node
/**
 * Simple CLI wrapper around calculateDosage
 *
 * Usage examples:
 *  node dist/cli.js --grams 7 --thc 21.5 --efficiency 75 --totalBaseMade 1 --totalBaseUnit cup --baseUsed 0.5 --recipeUnit cup --servings 10
 *
 * Or run with examples:
 *  node dist/cli.js --examples
 */

import { calculateDosage, Inputs } from "./calc";

function printHelp() {
  console.log(`
125 Broadstreet - Dosing Calculator (CLI)

Options:
  --grams <number>         Cannabis grams (required in calculation examples)
  --thc <number>           THC % (optional)
  --thca <number>          THCA % (optional)
  --efficiency <number>    Extraction efficiency % (default 75)
  --totalBaseMade <number> Total base volume made (e.g., 1)
  --totalBaseUnit <unit>   Unit for base made: ml, tsp, tbsp, fl_oz, cup
  --baseUsed <number>      Amount used in recipe (e.g., 0.5)
  --recipeUnit <unit>      Unit for base used: ml, tsp, tbsp, fl_oz, cup
  --servings <number>      Number of servings in recipe
  --examples               Show example runs
  --help                   Show this help
`);
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  let key: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      key = a.substring(2);
      // flags without values (like --examples) are set to 'true'
      if (["examples", "help"].includes(key)) {
        args[key] = "true";
        key = null;
      } else {
        // next token will be value
        args[key] = argv[i + 1];
        i++;
        key = null;
      }
    } else if (key) {
      args[key] = a;
      key = null;
    }
  }
  return args;
}

function printResults(results: ReturnType<typeof calculateDosage>) {
  console.log("Results:");
  console.log(`  Total THC in infusion: ${results.totalThcMg} mg`);
  console.log(`  mg per mL: ${results.mgPerMl} mg`);
  console.log("  mg per unit:");
  console.log(`    tsp: ${results.mgPerUnit.tsp} mg`);
  console.log(`    tbsp: ${results.mgPerUnit.tbsp} mg`);
  console.log(`    fl oz: ${results.mgPerUnit.fl_oz} mg`);
  console.log(`    cup: ${results.mgPerUnit.cup} mg`);
  console.log(`  Total THC in recipe portion: ${results.totalThcInRecipe} mg`);
  console.log(`  mg per serving: ${results.mgPerServing} mg`);
}

function runExample(name: string) {
  if (name === "example1") {
    const input: Inputs = {
      cannabisGrams: 7,
      thcPercent: 21.5,
      efficiencyPercent: 75,
      totalBaseMade: 1,
      totalBaseUnit: "cup",
      baseUsed: 0.5,
      recipeUnit: "cup",
      servings: 10
    };
    console.log("Example 1: 7g flower, 21.5% THC, 75% efficiency, 1 cup base, recipe uses 0.5 cup, 10 servings");
    printResults(calculateDosage(input));
  } else if (name === "example2") {
    const input: Inputs = {
      cannabisGrams: 5,
      thcPercent: 18,
      thcaPercent: 2.5,
      efficiencyPercent: 70,
      totalBaseMade: 250,
      totalBaseUnit: "ml",
      baseUsed: 50,
      recipeUnit: "ml",
      servings: 8
    };
    console.log("Example 2: 5g flower, 18% THC + 2.5% THCA, 70% efficiency, 250 mL base, recipe uses 50 mL, 8 servings");
    printResults(calculateDosage(input));
  } else {
    console.log("Unknown example. Available: example1, example2");
  }
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    printHelp();
    return;
  }

  const parsed = parseArgs(argv);
  if (parsed.help === "true") {
    printHelp();
    return;
  }

  if (parsed.examples === "true") {
    runExample("example1");
    console.log("\n---\n");
    runExample("example2");
    return;
  }

  // Required fields for running a calculation: cannabisGrams, totalBaseMade, totalBaseUnit, baseUsed, recipeUnit, servings
  try {
    const input: Inputs = {
      cannabisGrams: parsed.grams ? Number(parsed.grams) : 0,
      thcPercent: parsed.thc ? Number(parsed.thc) : 0,
      thcaPercent: parsed.thca ? Number(parsed.thca) : 0,
      efficiencyPercent: parsed.efficiency ? Number(parsed.efficiency) : 75,
      totalBaseMade: parsed.totalBaseMade ? Number(parsed.totalBaseMade) : 0,
      totalBaseUnit: (parsed.totalBaseUnit as any) || "ml",
      baseUsed: parsed.baseUsed ? Number(parsed.baseUsed) : 0,
      recipeUnit: (parsed.recipeUnit as any) || "ml",
      servings: parsed.servings ? Number(parsed.servings) : 0
    };

    // Basic validation
    if (!input.cannabisGrams || !input.totalBaseMade || !input.baseUsed || !input.servings) {
      console.error("Missing required numeric inputs. See --help for required flags.");
      process.exitCode = 2;
      return;
    }

    const results = calculateDosage(input);
    printResults(results);
  } catch (err) {
    console.error("Error:", err);
    process.exitCode = 1;
  }
}

main();
