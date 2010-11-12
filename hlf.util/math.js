_.namespace(pkg + 'util');
_.using(pkg + '*', function () {
//---------------------------------------
// CONVERSIONS
//---------------------------------------
/** 
 * Conversion function.
 * @param {!number} num Frames per second.
 * @return {number} Millis for each frame.
 */
util.millisPerFrame = function (num) {
    return parseInt(1000 / num, 10);
};
//---------------------------------------
// CALCULATION
//---------------------------------------
/** 
 * Pythagoras theorem.
 * @param {!number} a
 * @param {!number} b
 * @return {number} c
 */
util.dist = function (a, b) {
    return Math.sqrt((a * a) + (b * b));
};
/**
 * Limits a number to the markers.
 * @param {!number} num
 * @param {!number} min
 * @param {!number} max
 * @return {number}
 */
util.constrain = function (num, min, max) {
    return Math.min(Math.max(num, min), max);
};
/**
 * Gets a random point between the two markers.
 * @param {!number} to
 * @param {number=} from
 * @return {number}
 */
util.simpleRandom = function (to, from) {
    from = (from !== undefined) ? from : 0;
    return (to - from) * Math.random() + from;
};
/**
 * Returns either -1 or 1.
 * @return {number} 
 */
util.simpleDirection = function () {
    return Math.random() < 0.5 ? -1 : 1;
};
/** 
 * A simple pseudo-random generator, where the random component takes up
 *      <strong>1 / buffer</strong> of the result.
 * @param {!number} num Base number.
 * @param {number=} buffer Ratio to keep outside of random, defaults to 1.
 * @return {number}
 * @example util.bufferedRandom(100) // more likely to return 50+
 */
util.bufferedRandom = function (num, buffer) {
    buffer = (buffer !== undefined) ? buffer : 1;
    return num / (buffer + 1) * (Math.random() + buffer);
};
/**
 * Extension of {@link hlf.util.bufferedRandom} exponentiating random component.
 * @param {!number} num Base number.
 * @param {number=} buffer Ratio to keep outside of random, defaults to 1.
 * @param {number=} pow Power, defaults to 2.
 * @return {number}
 * @see {hlf.util.bufferedRandom}
 */
util.curvingBufferedRandom = function (num, buffer, pow) {
    buffer = (buffer !== undefined) ? buffer : 1;
    pow = (pow !== undefined) ? pow : 2;
    return num / (buffer + 1) * (Math.pow(Math.random(), pow) + buffer);
};
}); // namespace