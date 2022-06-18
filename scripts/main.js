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
   let action = "";
   chars.forEach((char) => {
      event = get_char_event(char, defined_events);
      action = num_fsm.accept(event);
      curr_expr = exe_action(action, char, curr_expr);
   });

   return curr_expr;
}

/**
 * Checks if the char matches one of the given events
 * @param {String} char           The char to be checked
 * @param {char_events} events    An Array of the events and the corresponding regex the expr should contain
 * @returns {string}              the event stream of the corresponding char
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

/**
 * A finite state machine
 * @typedef  {object}                                          FSM
 * @property {{state_1:
 *    {event_1: [next_state:string, action: string]}}}         transitions       The accepted events in a state, the next state and following action
 * @property {string}                                          init_state        The initial / beginning state of the FSM
 * @property {string}                                          state             The actual state of the FSM
 * @property {string}                                          def_event         Default event in case other events aren't valid
 * @property {string}                                          def_action        Defeault action in case there is no default event accepted
 * @property {string[]}                                        tstates           Includes transition states where the created value is in a valid state
 * @property {function(string):string}                         accept            Accepts an event, possibly changes its state and returns an action
 * @property {function():undefined}                            reset             Sets the current state to the initial state
 * @property {function():bool}                                 is_tstate         Checks if the current state is a transition state
 */

/**
 * An FSM for creating a number
 * @type {FSM}
 */

const num_fsm = {
   transitions: {
      init: {
         minus: ["num_sign", "add_char"],
         num: ["int", "add_char"],
      },
      num_sign: {
         num: ["int", "add_char"],
      },
      int: {
         num: ["int", "add_char"],
         minus: ["init", "as_op"],
         dot: ["float", "add_char"],
         base: ["base", "add_char"],
      },
      float: {
         num: ["float", "add_char"],
         minus: ["init", "as_op"],
      },
      base: { minus: ["exp_sign", "add_char"], num: ["exp", "add_char"] },
      exp_sign: {
         num: ["exp", "add_char"],
      },
      exp: {
         num: ["exp", "add_char"],
         minus: ["init", "as_op"],
      },
   },
   init_state: "init",
   state: "init",
   def_event: "def",
   def_action: "ignore",
   tstates: ["int", "float", "exp"],

   accept(event) {
      console.log(event, this.state);
      const [next_state, action] = this.transitions[this.state][event] ||
         this.transitions[this.state][this.def_event] || [this.state, this.def_action];
      this.state = next_state;
      return action;
   },

   reset() {
      this.state = this.init_state;
   },

   is_tstate() {
      return this.tstates.includes(this.state);
   },
};

// execute the given action
function exe_action(action, char, expression) {
   let expr = expression;
   switch (action) {
      case "ignore":
         break;
      case "add_char":
         expr += char;
         break;
      default:
         console.log("No such case:", action);
   }
   return expr;
}

//main
bind_events();
