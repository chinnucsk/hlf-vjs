/** @exports util as hlf.util */
_.namespace(pkg + 'util');
_.using(pkg + '*', function () {
// ----------------------------------------
// LANGUAGE
// ----------------------------------------
/**
 * @param {number} num
 * @return {int}
 */
util.toInt = function (num) {
    return parseInt(num, 10);
};
/**
 * Useful for key conversion.
 * @param {string} num
 * @return {string}
 */
util.camelCase = function (name) {
    if (arguments.length > 0) {
        name = arguments.join('-');
    } 
    return name.replace(/([-_][a-z])/g, function ($1) {
        return $1.toUpperCase().replace(/[-_]/, '');
    });
};
/**
 * @param {mixed} obj
 * @return {boolean}
 */
util.isNumber = function (obj) {
    return (obj === +obj) || (toString.call(obj) === '[object Number]');
};
/** 
 * @param {mixed} obj
 * @return {boolean}
 */
util.isFunction = function (obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply) || 
        (toString.call(obj) === "[object Function]");
};
/** 
 * @function
 * @param {mixed} obj
 * @return {boolean}
 */
util.isArray = Array.prototype.isArray || function(obj) {
    return !!(obj && obj.concat && obj.unshift && !obj.callee);
};
/** 
 * @param {mixed} obj
 * @return {boolean}
 * @see <a href="http://api.jquery.com/jQuery.isPlainObject/">api.jquery.com</a>
 */
util.isPlainObject = function (obj) {
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
util.extend = function () {
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
    if (typeof target !== "object" && !util.isFunction(target)) {
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
                if (deep && copy && (util.isPlainObject(copy) || util.isArray(copy))) {
                    var clone = src && (util.isPlainObject(src) || util.isArray(src)) ? src : util.isArray(copy) ? [] : {};
                    // Never move original objects, clone them
                    target[name] = util.extend(deep, clone, copy);
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
util.map = function (elems, callback, arg) {
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
util.each = function (object, callback, args) {
    var name, i = 0,
        length = object.length,
        isObj = length === undefined || util.isFunction(object);
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
/**
 * Copies the object to the prototype of a one-shot constructor.
 * @param {!Object} object The target.
 * @return {Object} One-shot constructor instance.
 */
util.clone = function (object) {
    var OneShotConstructor = function () {};
    OneShotConstructor.prototype = object;
    return new OneShotConstructor();
};
/**
 * All classes should extend this class. It works like a factory for new classes.
 *      It is a superclass in name only and works more as a bridge between MyClass
 *      and Class.
 * @class 
 * @constructor
 * @augments hlf.util.Class
 * @return {hlf.util.BaseClass}
 */
util.BaseClass = function (object) {
    var Class = new util.Class();
    return Class.extend(object);
};
/**
 * OOP extension of Object. Part of process to create new class.
 * @class
 * @constructor
 */
util.Class = function () {};
util.Class.prototype = {
    /**
     * Instantiation API. Creates a clone of the class and calls _construct.
     * @return {mixed} Instance.
     */
    create: function () {
        var object = util.clone(this);
        if (util.isFunction(object._construct)) {
            object._construct.apply(object, arguments);
        }
        return object;
    }, 
    /**
     * Subclassing API.
     * @param {!Object} object Properties and methods.
     * @return {mixed} Subclass.
     */
    extend: function (object) {
        var sub = util.clone(this); // this = super
        util.each(object, function (name, value) {
            sub[name] = value;
        });
        return sub;
    },
    /**
     * Allows a class to identify superclasses.
     * @param {!Object} object Properties and methods.
     * @return {boolean}
     */
    is: function (prototype) {
        var DummyConstructor = function () {};
        DummyConstructor.prototype = prototype;
        return this instanceof DummyConstructor;
    }
};
}); // namespace