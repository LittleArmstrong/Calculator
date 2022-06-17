import { $ } from "./toolbox.mjs";

/**
 * Groups certain characters and gives them an event name
 * @typedef {[{name: string, regex: regex}]} char_events
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
         minus: ["initial", "as_op"],
         dot: ["float", "add_char"],
         base: ["base", "add_char"],
      },
      float: {
         num: ["float", "add_char"],
         minus: ["initial", "as_op"],
      },
      base: { minus: ["exp_sign", "add_char"], num: ["exp", "add_char"] },
      exp_sign: {
         num: ["exp", "add_char"],
      },
      exp: {
         num: ["exp", "add_char"],
         minus: ["initial", "as_op"],
      },
   },
   init_state: "init",
   state: "init",
   def_event: "def",
   def_action: "ignore",
   tstates: ["int", "float", "exp"],

   accept(event) {
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

const expr_nfsm = {
   init_state: "init",
   state: "init",
   def_FSMs: [],
   def_event: "def",
   def_action: "ignore",
   FSMs: { num: num_fsm },
   transitions: {
      init: {
         op: {
            FSMs: ["num"],
            action: "next_num",
            next: "next_num",
         },
         def: { FSMs: [], action: "call_num_fsm", next: "init" },
      },
      next_num: {
         op: {
            FSMs: ["num"],
            action: "calc_next",
            next: "next_num",
         },
         eq: {
            FSMs: ["num"],
            action: "calc",
            next: "next_num",
         },
         def: {
            FSMs: ["num"],
            action: "call_num_fsm",
            next: "next_num",
         },
      },
   },
   accept(event) {
      let { FSMs, action, next } = this.transitions[this.state][event] ||
         this.transitions[this.state][this.def_event] || [
            this.def_FSMs,
            this.def_action,
            this.state,
         ];
      console.log(FSMs);
      if (!FSMs.every((FSM) => this.FSMs[FSM].is_tstate())) {
         action = this.def_action;
      } else {
         this.state = next;
      }
      return action;
   },
   reset() {
      this.state = this.init_state;
   },
};

function calc_expr(str) {
   const stream = parse_expr(str, defined_events);
   const expr = handle_stream(stream, expr_nfsm);
   return expr;
}

/**
 * Parses the string expression and creates an event stream based on the given events
 *
 * @param {String} str                               The expression to be parsed
 * @param {{event:String, regex: RegExp}[]} events   An Array of the events and the corresponding regex the expr should contain
 * @returns {[event:string, char:string][]}                     an event stream with the event and corresponding char
 */
function parse_expr(str, events) {
   const chars = str.split("");
   const stream = [];
   chars.forEach((char) => {
      events.some((event) => {
         return event.regex.test(char) ? stream.push([event.name, char]) : false;
      });
   });
   return stream;
}

const event_stream = {
   get: [],
   push([event, char], ...rest) {
      const new_length = this.stream.push([event, char], ...rest);
      return new_length;
   },
   shift() {
      return this.stream.shift();
   },
   unshift([event, char], ...rest) {
      return this.stream.unshift([event, char], ...rest);
   },
};

function handle_stream(event_stream, nfsm) {
   let expr = ""; // new valid expr to return
   const stream = [...event_stream]; // the events to work through
   const actions = []; // the actions caused from one event to work through
   console.table(stream);
   while (stream.length !== 0) {
      //check which action to take depending on the state and event
      let [event, char] = stream.shift();
      actions.push(nfsm.accept(event));
      //execute the action
      while (actions.length !== 0) {
         let action = actions.shift();
         switch (action) {
            case "ignore":
               break;
            case "add_char":
               expr += char;
               break;
            case "call_num_fsm": // create valid num with fsm
               actions.push(nfsm.fsms.num.accept(event));
               break;
            case "next_num":
               nfsm.fsms.num.reset();
               actions.push("add_char");
               break;
            case "calc": // calculate the result of expr
               console.log("calc");
               //calculate expr
               break; //here
            case "calc_next": // calculate the expr and add the chosen operator
               //calculate and add char op/create event
               console.log("calc_next");
               break;
         }
      }
   }
   return expr;
}

console.log(calc_expr("1+2="));
