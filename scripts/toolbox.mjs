/**
 * Shortform of document.querySelector
 * @param {String} x The selector to specify the node
 * @returns a node if found
 */

export function $(x) {
   return document.querySelector(x);
}

/**
 * Shortform of document.querySelectorAll
 * @param {String} x The selector to specify the nodes
 * @returns an Array of nodes if found
 */

export function $all(x) {
   return document.querySelectorAll(x);
}

/**
 * Returns a random integer in the specified range
 * @param {Number} max The max value of the range which will be rounded down
 * @param {Number} [min] The min value of the range which will be rounded down
 *    Default is zero
 * @returns
 */
export function get_random_int(max, min = 0) {
   min = Math.floor(min);
   max = Math.ceil(max);
   return Math.floor(Math.random() * (max - min + 1) + min);
}
