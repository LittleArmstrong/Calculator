import { calculate } from "../scripts/calculator.mjs";

const tests = [
   test("no multiple signs or dots", () => calculate("-.-12..3.4.")[0], "-12.34"),
   test("addition", () => calculate("--12..3.4+-15..4.3=")[0], "-27.77"),
   test("subtraction", () => calculate("11-10=")[0], "1"),
   test("multiplication", () => calculate("-10*-10=")[0], "100"),
   test("division", () => calculate("99/33=")[0], "3"),
   test("calculate multiple times", () => calculate("-1+2*3/3=")[0], "1"),
   test("calculation with next op", () => calculate("-1+2-")[0], "1-"),
];
console.table(tests);

function test(desc, func, exp) {
   const test = {};
   const val = func();
   test.Description = desc;
   test.Test = val === exp ? "passed" : "failed";
   test.Expected = exp;
   test.Received = val;
   return test;
}
