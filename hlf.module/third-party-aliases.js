_.namespace(pkg + 'module');
_.using(pkg + '*', function () {

/**
 * @class Mixin to allow the observer pattern. Current aliased to 
 *      {@link Backbone.Events}.
 */
module.EventMixin = Backbone.Events;
/** 
 * @name hlf.module.EventMixin#bind 
 * @function
 */
/** 
 * @name hlf.module.EventMixin#trigger 
 * @function
 */
/** 
 * @name hlf.module.EventMixin#unbind 
 * @function
 */
});