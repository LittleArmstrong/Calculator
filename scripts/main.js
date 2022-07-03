import { $ } from "./toolbox.mjs";
import { calculate } from "./calculator.mjs";

/**
 * Bind the inputs and events with the functions
 */
(function init_calculator() {
   const display = $("#display"); // textfield where the input and calculation is shown
   const char_inputs = [
      // input for creating valid nums
      { key: "0", id: "#num0", value: "0" },
      { key: "1", id: "#num1", value: "1" },
      { key: "2", id: "#num2", value: "2" },
      { key: "3", id: "#num3", value: "3" },
      { key: "4", id: "#num4", value: "4" },
      { key: "5", id: "#num5", value: "5" },
      { key: "6", id: "#num6", value: "6" },
      { key: "7", id: "#num7", value: "7" },
      { key: "8", id: "#num8", value: "8" },
      { key: "9", id: "#num9", value: "9" },
      { key: "-", id: "#sub", value: "-" },
      { key: ".", id: "#dot", value: "." },
      { key: "+", id: "#add", value: "+" },
      { key: "*", id: "#mul", value: "*" },
      { key: "/", id: "#div", value: "/" },
      { key: "Enter=", id: "#eq", value: "=" },
      { key: "Delete", id: "#ac", value: "a" },
   ];
   let supv_state = "init";
   let num_state = "init";

   // bind calc function to the input buttons
   char_inputs.forEach((input) => {
      $(input.id).addEventListener("click", () => {
         [display.value, supv_state, num_state] = calculate(input.value, {
            expr: display.value,
            num_state: num_state,
            supv_state: supv_state,
         });
      });
   });

   //simulate clicking the buttons with keypresses (keyup)
   document.onkeyup = (event) => {
      char_inputs.some((input) => {
         if (input.key.includes(event.key)) {
            $(input.id).click();
            return true;
         }
      });
   };
})();
