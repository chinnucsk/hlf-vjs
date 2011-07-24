// ----------------------------------------
// INTRO
// ----------------------------------------
(function(hlf){
var Ut = hlf.util, Mod = hlf.module;
/**
 * @class Mixin to allow the observer pattern. Current aliased to 
 *      {@link Backbone.Events}.
 */
Mod.EventMixin = Backbone.Events;
/**
 * TODO doc
 */
Mod.EventMixin.bind_ = function(event, callback, context, arguments_){
  context = context || this;
  if (typeof arguments_ !== 'undefined') { // curry
    this.bind(event, _.bind(callback, context, arguments_));
  } else {
    this.bind(event, _.bind(callback, context));
  }
};
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
// ----------------------------------------
// OUTRO
// ----------------------------------------
})(_.namespace(hlfPkg));