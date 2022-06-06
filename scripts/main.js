import { $ } from "./toolbox.mjs";

const display = $("#display");
const char_stream = {
   init(handler, fsm) {
      this.handler = handler;
      this.fsm = fsm;
   },
   events: [],
   handler: null,
   fsm: null,
   push(event, value = event) {
      this.events.push([event, value]);
      this.handler(this, calc_fsm);
   },
   shift() {
      return this.events.shift();
   },
};

function bind_events() {
   const char_inputs = [
      { key: "-", id: "#sub" },
      { key: "+", id: "#add" },
      { key: "*", id: "#mul" },
      { key: "/", id: "#div" },
      { key: ".", id: "#dot" },
      { key: "Enter=", id: "#eq" },
      { key: "Delete", id: "#ac" },
   ];
   //add the number 0-9 events
   for (let i = 0; i < 10; i++) {
      char_inputs.push({ key: "" + i, id: "#num" + i });
   }
   //add the events/chars to stream if clicked
   char_inputs.forEach((input) => {
      $(input.id).addEventListener("click", (event) => {
         const data = event.target.dataset;
         char_stream.push(data.event, data.value);
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

const calc_fsm = {
   transitions: {
      //#current state     new state      action to take
      //------------------------------------------------
      clear: {
         minus: ["sign_1", "add_first_char"],
         num: ["int_1", "add_first_char"],
      },
      sign_1: {
         num: ["int_1", "add_char"],
      },
      int_1: {
         operator: ["operator", "add_char"],
         minus: ["operator", "add_char"],
         num: ["int_1", "add_char"],
         dot: ["float_1", "add_char"],
         all_clear: ["clear", "clear_all"],
      },
      float_1: {
         operator: ["operator", "add_char"],
         minus: ["operator", "add_char"],
         num: ["float_1", "add_char"],
         all_clear: ["clear", "clear_all"],
      },
      operator: {
         minus: ["sign_2", "add_char"],
         num: ["int_2", "add_char"],
         all_clear: ["clear", "clear_all"],
      },
      sign_2: {
         num: ["int_2", "add_char"],
      },
      int_2: {
         operator: ["operator", "calc"],
         minus: ["operator", "calc"],
         equal: ["eval", "calc"],
         num: ["int_2", "add_char"],
         dot: ["float_2", "add_char"],
         all_clear: ["clear", "clear_all"],
      },
      float_2: {
         operator: ["eval", "calc"],
         minus: ["operator", "calc"],
         equal: ["eval", "calc"],
         num: ["float_2", "add_char"],
         all_clear: ["clear", "clear_all"],
      },
      eval: {
         operator: ["operator", "add_char"],
         minus: ["operator", "add_char"],
         all_clear: ["clear", "clear_all"],
      },
   },
   state: "clear",
   action: null,
   default_event: "default",
   default_action: "ignore",
   accept(event) {
      [this.state, this.action] = this.transitions[this.state][event] ||
         this.transitions[this.state][this.default_event] || [this.state, this.default_action];
      return this.action;
   },
};

function handle_events(stream, fsm) {
   const [event, value] = stream.shift();
   const action = fsm.accept(event);
   switch (action) {
      case fsm.default_action:
         break;
      case "add_first_char":
         display.value = value;
         break;
      case "add_char":
         display.value += value;
         break;
      case "calc":
         const [stat, result] = calculate(display.value);
         display.value = result;
         stat === "ok" ? (display.value += value) : (fsm.state = "clear");
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
         return error(`No such case: "${operator}"`);
         break;
   }
   return Number.isFinite(result) ? ok(result) : error("NaN");
}

function parse_math_operation(string) {
   //first regex matches first number (with sign if present) and second matches second number (with sign if preceded by an operator)
   //converts the strings tu numbers
   const numbers = string
      .match(/^-?\d*\.?\d+(?:e[-+]?\d+)?|(?<=[-+*/])-?\d*\.?\d+(?:e[-+]?\d+)?/g)
      .map(Number);
   // takes the first operator that is preceded by a number
   const operator = string.match(/(?<=\d.?)[-+*\/]/)[0];
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

bind_events();
char_stream.init(handle_events, calc_fsm);
