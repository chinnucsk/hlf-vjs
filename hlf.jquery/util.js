/** @exports Ut as hlf.util */
// ----------------------------------------
// INTRO
// ----------------------------------------
(function(hlf){
var Ut = hlf.util, Mod = hlf.module;

Ut.createJQPluginForModule = function(name){
  var class_ = Mod[name];
  if (!class_) {
    throw 'No such module.';
    return;
  }
  if ($.fn[name]) {
    throw 'Plugin already exists.';
    return;
  }
  $.fn[name] = function(options){  
    if (this.length > 1) {
      return;
    }
    var nsName = 'hlf'+ Ut.titleCase(name);
    // return existing instance
    var instance = this.data(nsName);
    if (instance) {
     return instance;
    }
    // create, boilerplate, and store instance
    var opt = $.extend(true, {}, class_.defaults, options);
    instance = new class_(name, this, opt);
    this.data(nsName, instance);
    return this;
  };
};
/**
 * TODO doc
 */
Mod.DomBased = Mod.Mixable.extend({
  _init: function(name, $root, opt){
    this._super.apply(this, arguments);
    this.name = name;
    this.$root = $root;
    this.opt = opt;
  }
});
// ----------------------------------------
// OUTRO
// ----------------------------------------
})(_.namespace(hlfPkg));