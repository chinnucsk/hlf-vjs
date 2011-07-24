// ----------------------------------------
// INTRO
// ----------------------------------------
(function(hlf){
var Ut = hlf.util;
//---------------------------------------
// CONVERSIONS
//---------------------------------------
/** 
 * Conversion function.
 * @param {!number} num Frames per second.
 * @return {number} Millis for each frame.
 */
Ut.millisPerFrame = function(num){
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
Ut.dist = function(a, b){
  return Math.sqrt((a * a) + (b * b));
};
/**
 * Limits a number to the markers.
 * @param {!number} num
 * @param {!number} min
 * @param {!number} max
 * @return {number}
 */
Ut.constrain = function(num, min, max){
  return Math.min(Math.max(num, min), max);
};
/**
 * Gets a random point between the two markers.
 * @param {!number} to
 * @param {number=} from
 * @return {number}
 */
Ut.simpleRandom = function(to, from){
  from = (from !== undefined) ? from : 0;
  return (to - from) * Math.random() + from;
};
/**
 * Returns either -1 or 1.
 * @return {number} 
 */
Ut.simpleDirection = function(){
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
Ut.bufferedRandom = function(num, buffer){
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
Ut.curvingBufferedRandom = function(num, buffer, pow){
  buffer = (buffer !== undefined) ? buffer : 1;
  pow = (pow !== undefined) ? pow : 2;
  return num / (buffer + 1) * (Math.pow(Math.random(), pow) + buffer);
};
// ----------------------------------------
// EASING
// ----------------------------------------
/**
 * Uses the ease-in-out-cubic easing equation to get the d(change in value).
 * @param {!int} t Current time, in millis.
 * @param {!number} b Beginning value.
 * @param {!number} c Overall change in value.
 * @param {!int} d Duration, in millis.
 * @return {number} Size of current step.
 */
Ut.easeInOutCubic = function(t, b, c, d){
  if ((t /= d / 2) < 1) {
    return c / 2 * t * t * t + b;
  }
  return c / 2 * ((t -= 2) * t * t + 2) + b; 
};
// ----------------------------------------
// OUTRO
// ----------------------------------------
})(_.namespace(hlfPkg));