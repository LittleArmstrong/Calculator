import { $ } from "./toolbox.mjs";
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
 * @property {function():bool}                                 is_tstate         Checks if the current state is a transition state
 * @property {function(string):undefined}                      set_state         Sets the current state to the given state
 * @property {function():undefined}                            reset             Sets the current state to the initial state
 */

/**
 * Bind the inputs and events with the functions
 */
function init_calculator() {
   const display = $("#display"); // textfield where the input and calculation is shown
   const num_inputs = [
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
   ];
   const op_inputs = [
      //inputs for the operation
      { key: "-", id: "#sub", value: "-" },
      { key: "+", id: "#add", value: "+" },
      { key: "*", id: "#mul", value: "*" },
      { key: "/", id: "#div", value: "/" },
      { key: "Enter=", id: "#eq", value: "=" },
   ];

   const del_inputs = [{ key: "Delete", id: "#ac", value: "a" }]; //inputs for deletion

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
            dot: ["float", "add_char"],
            base: ["base", "add_char"],
         },
         float: {
            num: ["float", "add_char"],
         },
         base: { minus: ["exp_sign", "add_char"], num: ["exp", "add_char"] },
         exp_sign: {
            num: ["exp", "add_char"],
         },
         exp: {
            num: ["exp", "add_char"],
         },
      },
      state: "init",
      init_state: "init",
      def_event: "def",
      def_action: "ignore",
      tstates: ["int", "float", "exp"],

      accept(event) {
         return (
            this.transitions[this.state][event] ??
            this.transitions[this.state][this.def_event] ?? [this.state, this.def_action]
         );
      },

      is_tstate(state) {
         return this.tstates.includes(state);
      },

      set_state(state) {
         this.state = state;
      },

      reset_state() {
         this.state = this.init_state;
      },
   };

   // bind calc function to the input buttons
   num_inputs.forEach((input) => {
      $(input.id).addEventListener("click", () => {
         const event = get_char_event(input.value);
         const [next_state, action] = num_fsm.accept(event);
         const expr = execute_action({
            action: action,
            char: input.value,
            expr: display.value,
         });
         display.value = expr;
         num_fsm.set_state(next_state);
      });
   });

   op_inputs.forEach((input) => {
      $(input.id).addEventListener("click", () => {
         //function for ops
      });
   });

   //simulate clicking the buttons with keypresses (keyup)
   document.onkeyup = (event) => {
      num_inputs.some((input) => {
         if (input.key.includes(event.key)) {
            $(input.id).click();
            return true;
         }
      });
      op_inputs.some((input) => {
         if (input.key.includes(event.key)) {
            $(input.id).click();
            return true;
         }
      });
   };
}

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
   const event = char_events.find((e) => e.regex.test(char));
   return event?.name ?? "";
}

// execute the given action
function execute_action({ action, char, expr }) {
   let new_expr = expr;
   switch (action) {
      case "ignore":
         break;
      case "add_char":
         new_expr += char;
         break;
      default:
         console.log("No such case:", action);
   }
   return new_expr;
}

//main
init_calculator();
