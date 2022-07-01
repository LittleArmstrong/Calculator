import { $ } from "./toolbox.mjs";

/**
 * Bind the inputs and events with the functions
 */
function init_calculator() {
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
      { key: "-", id: "#sub", value: "-" }, //for sign
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
         [display.value, supv_state, num_state] = handle_math_expression({
            chars: input.value,
            expression: display.value,
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
}

function handle_math_expression({ chars, expr, num_state, supv_state }) {
   let new_expr = expr;
   let next_num_state = num_state;
   let next_supv_state = supv_state;
   const array_chars = chars.split("");

   while (array_chars.length !== 0) {
      const actions = [];
      let action = "";
      let char = array_chars.shift();
      let char_event = get_char_event(char);
      [action, next_supv_state] = supv_fsm.accept({
         event: char_event,
         state: next_supv_state,
         num_state: next_num_state,
      });
      actions.push(action);

      while (actions.length !== 0) {
         let curr_action = actions.shift();
         switch (curr_action) {
            case "ignore":
               break;
            case "add_char":
               new_expr += char;
               break;
            case "call_num_fsm":
               [next_num_state, action] = num_fsm.accept(char_event, next_num_state);
               actions.unshift(action);
               break;
            case "next_num":
               new_expr += char;
               next_num_state = num_fsm.init_state;
               break;
            case "calc":
               new_expr = calc_expr(new_expr);
               next_num_state = num_fsm.init_state;
               break;

            case "calc_next":
               new_expr = calc_expr(new_expr) + char;
               next_num_state = num_fsm.init_state;
               break;
            default:
               console.log("No such case:", action);
         }
      }
   }
   return [new_expr, next_supv_state, next_num_state];

   //returns new expr and states
}

const num_fsm = {
   accept(event, state) {
      const transitions = {
         init: {
            minus: ["num_sign", "add_char"],
            num: ["int", "add_char"],
         },
         num_sign: {
            num: ["int", "add_char"],
         },
         int: {
            num: ["int", "add_char"],
            dot: ["float", "add_char"],
            base: ["base", "add_char"],
         },
         float: {
            num: ["float", "add_char"],
         },
         base: {
            minus: ["exp_sign", "add_char"],
            num: ["exp", "add_char"],
         },
         exp_sign: {
            num: ["exp", "add_char"],
         },
         exp: {
            num: ["exp", "add_char"],
         },
      };
      const def_event = "def";
      const def_action = "ignore";
      return transitions[state][event] ?? transitions[state][def_event] ?? [state, def_action];
   },

   is_tstate(state) {
      const tstates = ["int", "float", "exp"];
      return tstates.includes(state);
   },

   is_sign_state(state) {
      const sign_states = ["init", "base"];
      return sign_states.includes(state);
   },

   get init_state() {
      const init_state = "init";
      return init_state;
   },
};

const supv_fsm = {
   accept({ event, state, num_state }) {
      const transitions = {
         init: {
            num: [{ condition: true, step: ["call_num_fsm", "first_num"] }],
            minus: [{ condition: true, step: ["call_num_fsm", "first_num"] }],
         },
         first_num: {
            num: [{ condition: true, step: ["call_num_fsm", "first_num"] }],
            minus: [
               {
                  condition: () => num_fsm.is_sign_state(num_state),
                  step: ["call_num_fsm", "first_num"],
               },
               {
                  condition: () => num_fsm.is_tstate(num_state),
                  step: ["next_num", "second_num"],
               },
            ],
            dot: [{ condition: true, step: ["call_num_fsm", "first_num"] }],
            op: [
               {
                  condition: () => num_fsm.is_tstate(num_state),
                  step: ["next_num", "second_num"],
               },
            ],
         },
         second_num: {
            num: [{ condition: true, step: ["call_num_fsm", "second_num"] }],
            minus: [
               {
                  condition: () => num_fsm.is_sign_state(num_state),
                  step: ["call_num_fsm", "second_num"],
               },
               {
                  condition: () => num_fsm.is_tstate(num_state),
                  step: ["calc_next", "second_num"],
               },
            ],
            dot: [{ condition: true, step: ["call_num_fsm", "second_num"] }],
            op: [
               {
                  condition: () => num_fsm.is_tstate(num_state),
                  step: ["calc_next", "second_num"],
               },
            ],
            eq: [{ condition: () => num_fsm.is_tstate(num_state), step: ["calc", "calc_num"] }],
         },
         calc_num: {
            num: [{ condition: true, step: ["call_num_fsm", "first_num"] }],
            minus: [
               {
                  condition: () => num_fsm.is_tstate(num_state),
                  step: ["calc_next", "second_num"],
               },
            ],
            op: [
               {
                  condition: () => num_fsm.is_tstate(num_state),
                  step: ["calc_next", "second_num"],
               },
            ],
         },
      };
      const def_step = ["ignore", state];
      const def_event = [{ condition: true, step: def_step }];
      const next = (transitions[state][event] ?? transitions[state][def_event] ?? def_event).find(
         (step) => (typeof step.condition === "function" ? step.condition() : step.condition)
      );
      return next?.step ?? def_step;
   },
};

/**
 * Checks if the char matches one of the given events
 * @param {String} char    The char to be checked
 * @returns {String}       the event of the corresponding char
 */
function get_char_event(char) {
   const char_events = [
      { name: "num", regex: /\d/ },
      { name: "del", regex: /d/ },
      { name: "ac", regex: /a/ },
      { name: "op", regex: /[+*/]/ },
      { name: "minus", regex: /-/ },
      { name: "dot", regex: /\./ },
      { name: "eq", regex: /=/ },
      { name: "base", regex: /e/ },
   ];
   const event = char_events.find((event) => event.regex.test(char));
   return event?.name ?? "";
}

function calc_expr(expr) {
   let [numbers, operator] = parse_math_expr(expr);
   let result = null;
   switch (operator) {
      case "+":
         result = add(numbers);
         break;
      case "-":
         result = sub(numbers);
         break;
      case "*":
         result = mul(numbers);
         break;
      case "/":
         result = div(numbers);
         break;
      default:
         return error(`No such case: "${operator}"`);
   }
   return Number.isFinite(result) ? result : "NaN";
}

function parse_math_expr(expr) {
   //first regex matches first number (with sign if present) and second matches second number (with sign if preceded by an operator)
   //converts the strings tu numbers
   const numbers = expr
      .match(/^-?\d*\.?\d+(?:e[-+]?\d+)?|(?<=[-+*/])-?\d*\.?\d+(?:e[-+]?\d+)?/g)
      .map(Number);
   // takes the first operator that is preceded by a number
   const operator = expr.match(/(?<=\d.?)[-+*\/]/)[0];
   return [numbers, operator];
}

function add([num1, num2]) {
   return num1 + num2;
}

function sub([num1, num2]) {
   return num1 - num2;
}

function mul([num1, num2]) {
   return num1 * num2;
}

function div([num1, num2]) {
   return num1 / num2;
}

//main
init_calculator();

let supv_state = "first_num";
let num_state = "float";
let expr = "";

[expr, supv_state, num_state] = handle_math_expression({
   chars: "--+93=",
   expr: "-1.45",
   num_state: num_state,
   supv_state: supv_state,
});

console.log(expr, num_state, supv_state);
