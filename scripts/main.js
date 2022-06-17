import { $ } from "./toolbox.mjs";
/**
 * Bind the events to the calculator buttons and call the corresponding function
 * for the evaluation of the input value
 */
function bind_events() {
   // textfield where the input and calculation is shown
   const display = $("#display");
   // accepted input buttons
   const char_inputs = [
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
      { key: "+", id: "#add", value: "+" },
      { key: "*", id: "#mul", value: "*" },
      { key: "/", id: "#div", value: "/" },
      { key: ".", id: "#dot", value: "." },
      { key: "Enter=", id: "#eq", value: "=" },
      { key: "Delete", id: "#ac", value: "a" },
   ];

   // bind calc function to the input buttons
   char_inputs.forEach((input) => {
      $(input.id).addEventListener("click", () => {
         display.value = handle_input(input.value);
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
}

/**
 * Groups certain characters and gives them an event name
 * @typedef {[{name: String, regex: Regex}]} char_events
 */

/**
 * Define the characters that count as an event
 * @type {char_events}
 */
const defined_events = [
   { name: "num", regex: /\d/ },
   { name: "del", regex: /d/ },
   { name: "ac", regex: /a/ },
   { name: "op", regex: /[+*/]/ },
   { name: "minus", regex: /-/ },
   { name: "dot", regex: /\./ },
   { name: "eq", regex: /=/ },
   { name: "base", regex: /e/ },
];

// save the current expression
let curr_expr = "";

// evaluates the chars and current expression to create a math expression
// and calculate it
function handle_input(str) {
   const chars = str.split("");
   let event = "";
   chars.forEach((char) => {
      event = get_char_event(char, defined_events);
      console.log(event);
      curr_expr += event ? char : "";
   });

   return curr_expr;
}

/**
 * Checks if the char matches one of the given events
 * @param {String} char                               The char to be checked
 * @param {{event:String, regex: RegExp}[]} events    An Array of the events and the corresponding regex the expr should contain
 * @returns {string}                                  the event stream of the corresponding char
 */
function get_char_event(char, events) {
   let char_event = "";
   events.some((event) => {
      if (event.regex.test(char)) {
         char_event = event.name;
         return true;
      }
   });
   return char_event;
}

bind_events();
