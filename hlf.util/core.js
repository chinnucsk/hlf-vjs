/** @exports Ut as hlf.util */
// ----------------------------------------
// INTRO
// ----------------------------------------
_.namespace(hlfPkg + '.util');
(function(hlf){
var Ut = hlf.util;
// ----------------------------------------
// LANGUAGE
// ----------------------------------------
/**
 * @param {number} num
 * @return {int}
 */
Ut.toInt = function(num){
  return parseInt(num, 10);
};
/**
 * Useful for key conversion.
 * @param {string} num
 * @return {string}
 */
Ut.camelCase = function(name){
  if (arguments.length > 0) {
    name = arguments.join('-');
  } 
  return name.replace(/([-_][a-z])/g, function($1){
    return $1.toUpperCase().replace(/[-_]/, '');
  });
};
/**
 * @param {mixed} obj
 * @return {boolean}
 */
Ut.isNumber = function(obj){
  return (obj === +obj) || (toString.call(obj) === '[object Number]');
};
/** 
 * @param {mixed} obj
 * @return {boolean}
 */
Ut.isFunction = function(obj){
  return !!(obj && obj.constructor && obj.call && obj.apply) || 
    (toString.call(obj) === "[object Function]");
};
/** 
 * @function
 * @param {mixed} obj
 * @return {boolean}
 */
Ut.isArray = Array.prototype.isArray || function(obj){
  return !!(obj && obj.concat && obj.unshift && !obj.callee);
};
/** 
 * @param {mixed} obj
 * @return {boolean}
 * @see <a href="http://api.jquery.com/jQuery.isPlainObject/">api.jquery.com</a>
 */
Ut.isPlainObject = function(obj){
  // Must be an Object.
  // Because of IE, we also have to check the presence of the constructor property.
  // Make sure that DOM nodes and window objects don't pass through, as well
  if (!obj || toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval) {
    return false;
  }
  // Not own constructor property must be Object
  if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
    return false;
  }
  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.
  var key;
  for (key in obj) {}
  return key === undefined || hasOwn.call(obj, key);        
};
/**
 * @param {Object|boolean} arg1 Use an empty object to clone. True for deep.
 * @param {!Object} arg2 The target. If deep, use an empty object to clone.
 * @param {Object=} arg3 If deep, the target. Unlimited targets.
 * @return {Object} 
 * @see <a href="http://api.jquery.com/jQuery.extend/">api.jquery.com</a>
 */
Ut.extend = function(){
  // copy reference to target object
  var target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      deep = false,
      options, name, src, copy;
  // Handle a deep copy situation
  if (typeof target === "boolean") {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }
  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== "object" && !Ut.isFunction(target)) {
    target = {};
  }
  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    if ((options = arguments[i]) != null) {
      // Extend the base object
      for (name in options) {
        src = target[name];
        copy = options[name];
        // Prevent never-ending loop
        if (target === copy) {
          continue;
        }
        // Recurse if we're merging object literal values or arrays
        if (deep && copy && (Ut.isPlainObject(copy) || Ut.isArray(copy))) {
          var clone = src && (Ut.isPlainObject(src) || Ut.isArray(src)) ? src : Ut.isArray(copy) ? [] : {};
          // Never move original objects, clone them
          target[name] = Ut.extend(deep, clone, copy);
          // Don't bring in undefined values
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }
  // Return the modified object
  return target;
};
/**
 * Map a set of elements to a callback and result the resulting copy.
 * @param {Array} elem
 * @param {function(Array.<argument>)} callback
 * @param {Array} arg Arguments for callback.
 * @return {Array}
 * @see <a href="http://api.jquery.com/jQuery.map/">api.jquery.com</a>
 */
Ut.map = function(elems, callback, arg){
  var ret = [],
    value;

  // Go through the array, translating each of the items to their
  // new value (or values).
  for (var i = 0, length = elems.length; i < length; i++) {
    value = callback(elems[i], i, arg);

    if (value != null) {
      ret[ret.length] = value;
    }
  }

  return ret.concat.apply([], ret);
};
/** 
 * Basic iterator. Use for objects, or at the expense of speed for arrays.
 * @param {!Object} object The collection to loop through.
 * @param {!function(number, mixed)} callback Callback, key and value as parameters.
 * @return {Object}
 * @see <a href="http://api.jquery.com/jQuery.each/">api.jquery.com</a>
 */
Ut.each = function(object, callback, args){
  var name, i = 0,
    length = object.length,
    isObj = length === undefined || Ut.isFunction(object);
  if (args) {
    if (isObj) {
      for (name in object) {
        if (callback.apply(object[name], args) === false) {
          break;
        }
      }
    } else {
      for (; i < length;) {
        if (callback.apply(object[i++], args) === false) {
          break;
        }
      }
    }
    // A special, fast, case for the most common use of each
  } else {
    if (isObj) {
      for (name in object) {
        if (callback.call(object[name], name, object[name]) === false) {
          break;
        }
      }
    } else {
      for (var value = object[0];
      i < length && callback.call(value, i, value) !== false; value = object[++i]) {}
    }
  }
  return object;
};
// ----------------------------------------
// OOP
// ----------------------------------------
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
/**
 * The base Class implementation (does nothing)
 * @class
 */
Ut.Class = function(){};
// Inspired by base2 and Prototype
(function(){
  var initializing = false, 
      fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  /**
   * Create a new Class that inherits from this class
   * @static
   */
  Ut.Class.extend = function(prop){
    var _super = this.prototype;
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    // Copy the properties over onto the new prototype
    for (var name in prop){
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function(){
            var tmp = this._super;
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    // The dummy class constructor
    var Class = function(){
      // All construction is actually done in the init method
      if ( !initializing && this._init )
        this._init.apply(this, arguments);
    };
    // Populate our constructed prototype object
    Class.prototype = prototype;
    // Enforce the constructor to be what we expect
    Class.constructor = Class;
    // And make this class extendable
    Class.extend = arguments.callee;
    return Class;
  };
})();
// ----------------------------------------
// OUTRO
// ----------------------------------------
})(_.namespace(hlfPkg));