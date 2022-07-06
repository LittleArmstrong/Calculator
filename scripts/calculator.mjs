//@ts-check
/**
 * Takes an input of chars, validates it and if applicable, evaluates it then returns it
 * @param {string} chars String of chars input to be evaluated
 * @param {object} settings Settings
 * @param {string} settings.expr Previous validated expression
 * @param {string} settings.num_state Current number FSM state
 * @param {string} settings.supv_state Current supervisor state
 * @param {object[]} settings.log Current log of events
 * @returns a validated and evaluated expression
 */
//{ expr = "", num_state = "init", supv_state = "init", log = [] } = {}
export function calculate(
   chars,
   { expr, num_state, supv_state, log } = {
      expr: "",
      num_state: "init",
      supv_state: "init",
      log: [],
   }
) {
   // run expr through calculate again to get states?
   const array_chars = chars.split("");
   let new_expr = expr;
   let next_num_state = num_state;
   let next_supv_state = supv_state;
   let new_log = log;

   while (array_chars.length !== 0) {
      const actions = [];
      let action = "";
      let char = array_chars.shift() ?? "";
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
               //do nothing
               break;
            case "add_char":
               //add the inputted char to the expression and log this event
               new_expr += char;
               new_log.push({
                  char: char,
                  event: char_event,
                  supv_state: supv_state,
                  num_state: num_state,
               });
               break;
            case "call_num_fsm":
               //call the num fsm to get the next action and state
               [next_num_state, action] = num_fsm.accept(char_event, next_num_state);
               actions.unshift(action);
               break;
            case "next_num":
               //start the creation of the second number and add the operator
               next_num_state = num_fsm.init_state;
               actions.unshift("add_char");
               break;
            case "new_num":
               //start the creation of the second number and add the operator
               next_num_state = num_fsm.init_state;
               actions.unshift("clear_all", "call_num_fsm");
               break;
            case "calc":
               //calculate the expression and reset log and number creation
               new_expr = "" + calc_expr(new_expr);
               next_num_state = num_fsm.init_state;
               new_log = [];
               break;
            case "calc_next":
               //combination of calculation the expression and adding the operator
               actions.unshift("calc", "add_char");
               break;
            case "clear_all":
               //clear the expression and reset number creation fsm
               new_expr = "";
               next_num_state = num_fsm.init_state;
               break;
            case "del_char":
               //delete the last char or if calculated the the calculated number
               //depending on the log
               let last_event_log = new_log.pop();
               new_expr = last_event_log ? new_expr.slice(0, -1) : "";
               next_num_state = last_event_log?.num_state ?? next_num_state;
               next_supv_state = last_event_log?.supv_state ?? next_supv_state;
               break;
            default:
               //show an error if there is no code for the given action
               console.error("No such case:", action);
         }
      }
   }
   return [new_expr, next_supv_state, next_num_state, new_log];

   //returns new expr and states
}

/**
 * A finite state machine
 * @typedef Num_FSM
 * @type {object}
 * @property {string} init_state - The initial state
 * @property {function(string, string):[string, string]} accept Returns the next action and state depending on the received event and state
 * @property {function(string):boolean} is_tstate Checks if the given state is a valid transitional state
 * @property {function(string):boolean} is_sign_state Checks if the given state accepts the minus char as a sign
 */

/**
 * An FSM for generating valid numbers
 * @type {Num_FSM}
 */
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
            base: ["base", "add_char"],
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

/**
 * A non determinisitic finite state machine to create valid math expression.s
 * @typedef Supv_NFSM
 * @type {object}
 * @property {function({event:string, state:string, num_state: string}):[string, string]} accept Returns the next action and state depending on the received event and state
 */

/**
 * An NFSM for generating valid math expressions
 * @type {Supv_NFSM}
 */

const supv_fsm = {
   accept({ event, state, num_state }) {
      const transitions = {
         init: {
            minus: [{ condition: () => true, step: ["call_num_fsm", "first_num"] }],
            num: [{ condition: () => true, step: ["call_num_fsm", "first_num"] }],
         },
         first_num: {
            ac: [{ condition: () => true, step: ["clear_all", "init"] }],
            base: [{ condition: () => true, step: ["call_num_fsm", "first_num"] }],
            del: [{ condition: () => true, step: ["del_char", "first_num"] }],
            dot: [{ condition: () => true, step: ["call_num_fsm", "first_num"] }],
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
            num: [{ condition: () => true, step: ["call_num_fsm", "first_num"] }],
            op: [
               {
                  condition: () => num_fsm.is_tstate(num_state),
                  step: ["next_num", "second_num"],
               },
            ],
         },
         second_num: {
            ac: [{ condition: () => true, step: ["clear_all", "init"] }],
            base: [{ condition: () => true, step: ["call_num_fsm", "second_num"] }],
            del: [{ condition: () => true, step: ["del_char", "first_num"] }],
            dot: [{ condition: () => true, step: ["call_num_fsm", "second_num"] }],
            eq: [{ condition: () => num_fsm.is_tstate(num_state), step: ["calc", "calc_num"] }],
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
            num: [{ condition: () => true, step: ["call_num_fsm", "second_num"] }],
            op: [
               {
                  condition: () => num_fsm.is_tstate(num_state),
                  step: ["calc_next", "second_num"],
               },
            ],
         },
         calc_num: {
            ac: [{ condition: () => true, step: ["clear_all", "init"] }],
            del: [{ condition: () => true, step: ["del_char", "first_num"] }],
            minus: [
               {
                  condition: () => num_fsm.is_tstate(num_state),
                  step: ["calc_next", "second_num"],
               },
            ],
            num: [{ condition: () => true, step: ["new_num", "first_num"] }],
            op: [
               {
                  condition: () => num_fsm.is_tstate(num_state),
                  step: ["calc_next", "second_num"],
               },
            ],
         },
      };
      const def_step = ["ignore", state];
      const def_event_name = "def";
      const def_event = [{ condition: () => true, step: def_step }];
      const next = (
         transitions[state][event] ??
         transitions[state][def_event_name] ??
         def_event
      ).find((step) => step.condition());
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

/**
 * Takes a mathematical expression and calculates the result
 *
 * @param {string} expr The math expression to be calculated
 * @returns {string} the result or ERR if there was an error
 */
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
         console.error(`No such case: "${operator}"`);
         result = "ERR";
   }
   return Number.isFinite(result) ? String(result) : "ERR";
}

/**
 * Parses a string expression for numbers and operators
 * @param {String} expr The math expression to be parsed
 * @returns {[number[], string]} the numbers and operator extracted from the expression
 */

function parse_math_expr(expr) {
   //first regex matches first number (with sign if present) and second matches second number (with sign if preceded by an operator)
   //converts the strings to numbers
   const first_num = expr?.match(/^-?\d*\.?\d+(?:e[-+]?\d+)?/)?.map(Number)?.[0] ?? NaN;
   const second_num = expr?.match(/(?<=[-+*/])-?\d*\.?\d+(?:e[-+]?\d+)?$/)?.map(Number)?.[0] ?? NaN;
   const numbers = [first_num, second_num];
   // const numbers = expr
   //    ?.match(/^-?\d*\.?\d+(?:e[-+]?\d+)?|(?<=[-+*/])-?\d*\.?\d+(?:e[-+]?\d+)?/g)
   //    ?.map(Number) ?? [NaN, NaN];
   // takes the first operator that is preceded by a number
   const operator = expr?.match(/(?<=\d.?)[-+*\/]/)?.[0] ?? "none";
   return [numbers, operator];
}

/**
 * Adds two numbers together and returns the result
 * @param {number[]} param0 Numbers for the addtiion
 * @returns {number} the result
 */
function add([num1, num2]) {
   return num1 + num2;
}

/**
 * Subtracts the second number from the first and returns the result
 * @param {number[]} param0 Numbers for the subtraction
 * @returns {number} the result
 */
function sub([num1, num2]) {
   return num1 - num2;
}

/**
 * Multiplicates two numbers and returns the result
 * @param {number[]} param0 Numbers for the multiplication
 * @returns the result
 */
function mul([num1, num2]) {
   return num1 * num2;
}

/**
 * Divides the first number with the second one and returns the result
 * @param {number[]} param0 Numbers for the division
 * @returns the result
 */

function div([num1, num2]) {
   return num1 / num2;
}
