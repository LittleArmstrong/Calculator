import { calculate } from "../scripts/calculator.mjs";

// some tests for the calculate function
const tests = [
   test("valid number", () => calculate("e-.-12..3e-e.4.e")[0], "-12.3e-4"), //check num fsm
   test("addition", () => calculate("-12.34+-15.43=")[0], "-27.77"),
   test("subtraction", () => calculate("11-10=")[0], "1"),
   test("multiplication", () => calculate("-10*-10=")[0], "100"),
   test("division", () => calculate("99/33=")[0], "3"),
   test("calculate multiple times", () => calculate("-1+2*3/3=")[0], "1"),
   test("calculation with next op", () => calculate("-1+2-")[0], "1-"),
   test("num input on calculated num", () => calculate("-1+2=5")[0], "5"),
   test("divide by zero error", () => calculate("1/0=")[0], "ERR"),
   test("num input on error", () => calculate("1/0=3")[0], "3"),
   test("reset num fsm for second num", () => calculate("1/")[2], "init"),
   test("reset num fsm for second num afte calc", () => calculate("1/2=+")[2], "init"),
   test("clear display", () => calculate("1/2=+a")[0], ""),
   test("delete last char", () => calculate("1/2d")[0], "1/"),
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
