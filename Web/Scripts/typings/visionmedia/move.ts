interface Move {

    /**
     * Set duration to `n`.
     *
     * @param {Number|String} n
     * @return {Move} for chaining
     * @api public
     */
    duration(n: number | string): Move;

    /**
     * Set transition easing function to to `fn` string.
     *
     * When:
     *
     *   - null "ease" is used
     *   - "in" "ease-in" is used
     *   - "out" "ease-out" is used
     *   - "in-out" "ease-in-out" is used
     *
     * @param {String} fn
     * @return {Move} for chaining
     * @api public
     */
    ease(fn: string): Move;
    ease(): Move;

    /**
     * Start animation, optionally calling `fn` when complete.
     *
     * @param {Function} fn
     * @return {Move} for chaining
     * @api public
     */
    end(): Move;
    end(callback: Function): Move;

    /**
     * Translate `x` and `y` axis.
     *
     * @param {Number} x
     * @param {Number} y
     * @return {Move} for chaining
     * @api public
     */
    to(x: number, y: number): Move;

    /**
     * Translate on the x axis to `n`.
     *
     * @param {Number} n
     * @return {Move} for chaining
     * @api public
     */
    x(n: number): Move;

    /**
     * Translate on the y axis to `n`.
     *
     * @param {Number} n
     * @return {Move} for chaining
     * @api public
     */
    y(n: number): Move;

    /**
     * Set `prop` to `value`, deferred until `.end()` is invoked
     * and adds the property to the list of transition props.
     *
     * @param {String} prop
     * @param {String} val
     * @return {Move} for chaining
     * @api public
     */
    'set'(prop: string, val: string): Move;

    then(): Move

    reset(): Move

}
 
declare function move(selector: string | HTMLElement): Move;
declare module "move" {



    export = move;
}

//function move(selector: string|HTMLElement);