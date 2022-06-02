import { $ } from "./toolbox.mjs";

const display = $("#display");

// try FSM for creating string expressiongi
function bind_events() {
   //add the numbers to the display if pressed
   for (let i = 0; i < 10; i++) {
      $("#num" + i).addEventListener("click", (event) => {
         manage_event("num", event.target.dataset.number);
      });
   }

   // the dot for floats
   $("#dot").addEventListener("click", (event) => {
      manage_event("dot", event.target.dataset.symbol);
   });

   // specific event, because it also counts as a sign
   $("#sub").addEventListener("click", (event) => {
      manage_event("minus", event.target.dataset.symbol);
   });

   // other math operators that add only their symbols saved in the data attr
   const other_operators = ["#add", "#mul", "#div"];
   other_operators.forEach((op) => {
      $(op).addEventListener("click", (event) => {
         manage_event("operator", event.target.dataset.symbol);
      });
   });

   // equal to only evaluate
   $("#eq").addEventListener("click", (event) => {
      manage_event("equal", "");
   });

   // all clear
   $("#ac").addEventListener("click", (event) => {
      manage_event("all_clear", "");
   });
}

const calc_fsm = {
   transitions: {
      //#current state     new state      action to take
      //------------------------------------------------
      clear: {
         minus: ["int_1", "add_first_char_to_display"],
         num: ["int_1", "add_first_char_to_display"],
      },
      int_1: {
         operator: ["operator", "add_to_display"],
         minus: ["operator", "add_to_display"],
         num: ["int_1", "add_to_display"],
         dot: ["float_1", "add_to_display"],
         all_clear: ["clear", "clear_all"],
      },
      float_1: {
         operator: ["operator", "add_to_display"],
         minus: ["operator", "add_to_display"],
         num: ["float_1", "add_to_display"],
         all_clear: ["clear", "clear_all"],
      },
      operator: {
         minus: ["int_2", "add_to_display"],
         num: ["int_2", "add_to_display"],
         all_clear: ["clear", "clear_all"],
      },
      int_2: {
         operator: ["operator", "calculate"],
         equal: ["eval", "calculate"],
         num: ["int_2", "add_to_display"],
         dot: ["float_2", "add_to_display"],
         all_clear: ["clear", "clear_all"],
      },
      float_2: {
         operator: ["eval", "calculate"],
         equal: ["eval", "calculate"],
         num: ["float_2", "add_to_display"],
         all_clear: ["clear", "clear_all"],
      },
      eval: {
         operator: ["operator", "add_to_display"],
         minus: ["operator", "add_to_display"],
         all_clear: ["clear", "clear_all"],
      },
   },
   state: "clear",
   action: null,
   default_action: "ignore",
   accept_event(event) {
      [this.state, this.action] = this.transitions[this.state][event] ||
         this.transitions[this.state]["default"] || [this.state, this.default_action];
      return this.action;
   },
};

function manage_event(event, value) {
   const action = calc_fsm.accept_event(event);
   switch (action) {
      case calc_fsm.default_action:
         break;
      case "add_first_char_to_display":
         display.value = value;
         break;
      case "add_to_display":
         display.value += value;
         break;
      case "calculate":
         const [stat, result] = calculate(display.value);
         display.value = result + value;
         if (stat === "error") {
            calc_fsm.state = "clear";
         }
         break;
      case "clear_all":
         display.value = "";
         break;
      default:
         throw new Error(`No such case: "${action}"`);
         break;
   }
}

function calculate(string) {
   let [numbers, operator] = parse_math_operation(string);
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
         return error(`No case for "${operator}" operator`);
         break;
   }
   return Number.isFinite(result) ? ok(result) : error("Result is not a number");
}

function parse_math_operation(string) {
   //first regex matches first number with sign and second matches second number with sign if there is an operator already
   const numbers = string.match(/^-?\d*\.?\d+|(?<=[-+*/$])-?\d*\.?\d+/g).map(Number);
   // takes the first operator that is preceded by a number
   const operator = string.match(/(?<=\d)[-+*\/]/)[0];
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

function ok(result) {
   return ["ok", result];
}

function error(reason) {
   return ["error", reason];
}

function add_to_display(value) {
   add_to_output(value, display);
}

function add_to_output(value, node) {
   node.value += value;
}

function do_nothing() {
   //pass, to avoid calling error
}

bind_events();
