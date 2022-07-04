import { calculate } from "../scripts/calculator.mjs";

// the tests for the calculate function
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

/**
 * @typedef Test_Obj
 * @type {Object}
 * @property {string} Description The description of the test
 * @property {"passed"|"failed"} Test Whether the test failed or passed
 * @property {any} Expected The expected value
 * @property {any} Received The received value
 */

/**
 *
 * @param {string} desc The description of the test
 * @param {function()} func The function to be called
 * @param {any} exp the expected value
 * @returns {Test_Obj} a test object
 */
function test(desc, func, exp) {
   const test = {};
   const val = func();
   test.Description = desc;
   test.Test = val === exp ? "passed" : "failed";
   test.Expected = exp;
   test.Received = val;
   return test;
}
