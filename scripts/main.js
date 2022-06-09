import { $ } from "./toolbox.mjs";

class FSM {
   constructor(
      transitions,
      { init_state = "default", def_event = "default", def_action = "ignore" } = {}
   ) {
      this.transitions = transitions;
      this.init_state = this.state = init_state;
      this.def_event = def_event;
      this.def_action = def_action;
   }

   accept(event) {
      const [next_state, action] = this.transitions[this.state][event] ||
         this.transitions[this.state][this.def_event] || [this.state, this.def_action];
      this.state = next_state;
      return action;
   }

   reset() {
      this.state = this.init_state;
   }
}

const char_stream = {
   get: [],
   push(event, char) {
      const new_length = this.stream.push([event, char]);
      return new_length;
   },
   shift() {
      return this.stream.shift();
   },
   unshift(event, char) {
      return this.stream.unshift([event, char]);
   },
};

const supv_transitions = {
   first_num: {
      operator: ["last_num", "add_char"],
      all_clear: ["first_num", "clear_all"],
      default: ["first_num", "call_num_fsm"],
   },

   last_num: {
      operator: ["first_num", "calc_next"],
      all_clear: ["first_num", "clear_all"],
      eq: ["first_num", "calc"],
      default: ["last_num", "call_num_fsm"],
   },
};

const num_transitions = {
   initial: {
      minus: ["int", "add_char"],
      num: ["int", "add_char"],
   },
   int: {
      num: ["int", "add_char"],
      minus: ["initial", "as_operator"],
      dot: ["float", "add_char"],
   },
   float_1: {
      num: ["float_1", "add_char"],
      minus: ["initial", "as_operator"],
   },
};

const supv_fsm = new FSM(supv_transitions);
const num_fsm = new FSM(num_transitions);

const math_expr = {
   get: "",
   add_char(char) {
      this.get += char;
   },
   clear() {
      this.get = "";
   },
};

function handle_stream(stream, { expr, expr_fsm, num_fsm }) {
   let [event, char] = stream.shift();
   let action = expr_fsm.accept;
}

function handle_expr_fsm([event, char], { expr, expr_fsm, num_fsm }) {
   const action = expr_fsm.accept(event);
   let status = ok(char);
   switch (action) {
      case "add_char":
         expr.add_char(char);
         break;
      case "clear_all":
         expr.clear();
         break;
      case "call_num_fsm":
         status = handle_num_fsm([event, char], { expr: expr, fsm: num_fsm });
         break;
      case "calc":
         console.log("calc");
         break; //here
      case "calc_next":
         console.log("calc_next");
         break;
   }
   return status;
}

function handle_num_fsm([event, char], { expr, fsm }) {
   const action = fsm.accept(event);
   let status = ok(char);
   switch (action) {
      case "add_char":
         expr.add_char(char);
         break;
      default:
         status = error(char);
         break;
   }
   return status;
}

function ok(result) {
   return ["ok", result];
}
function error(reason) {
   return ["error", reason];
}
