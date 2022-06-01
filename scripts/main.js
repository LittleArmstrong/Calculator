let current_operation = "";

function calculate_operation() {
   let str = "10+10";
   if (!is_valid_operation(str)) return error("Invalid expression");
   let [status, result] = calculate(str);
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

function is_valid_operation(string) {
   const n_operands = 2;
   const n_operators = 1;
   const is_two_numbers = string.match(/\d*\.?\d+/g)?.length === n_operands;
   const is_one_operator = string.match(/[-+*\/]/g)?.length === n_operators;
   return is_two_numbers && is_one_operator;
}

function parse_math_operation(string) {
   const numbers = string.match(/\d*\.?\d+/g).map(Number);
   const operator = string.match(/[-+*\/]/)[0];
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
