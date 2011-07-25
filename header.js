/**
 * This library follows the <a href="http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml#show_hide_all_button">
 *      Google JavaScript style guide</a>, but uses all of the current JsDoc tags as needed.<br/>
 *      Only common abbreviation patterns are used in names when appropriate:
 *      <code>pos:position, cb:callback, ns:namespace, init:initialize, args:arguments, 
 *      i/idx:index, l/len:length, vm: viewModel, v:view, b:boundary, k:key, 
 *      v/val:value, anim:animation, rad:radius, num:count, mag:magnitude,
 *      d:delta, t:theta, dir:direction, util:utility, M:Math, C:constants, 
 *      opt:options, params:parameters</code>.<br/>
 *      Encapsulation convention is <code>publicMethod</code> and <code>_protectedMethod</code>.<br/>
 *      Delegation convention is <code>onDoSomething</code>, <code>willDoSomething</code>, 
 *      <code>didDoSomething</code> and <code>actionSocket</code>.<br/>
 * @author peng@pengxwang.com (Peng Wang)
 * @name hlf
 * @namespace Main namespace. Shorthand alternative to <code>com.pengxwang</code>.
 */
/** @name window */
/** Shorthand for app package namespace. */
var hlfPkg = 'hlf';
/** @exports com.pengxwang as hlf */
// hlfPkg = 'com.pengxwang'; // use if really necessary
/**
 * Utility methods, mixins, and classes. Categories include console, 
 *      core, geom, math, etc.
 * @name hlf.util
 * @namespace 
 */
_.namespace(hlfPkg + '.util');
/**
 * @name hlf.module
 * @namespace Module classes and mixins.
 */
_.namespace(hlfPkg + '.module');
/**
 * @name hlf.jquery
 * @namespace Custom jQuery events and data.
 */
_.namespace(hlfPkg + '.jquery');
/**
 * @name Raphael.fn.hlf
 * @namespace Custom Raphael extensions.
 */
Raphael.fn.hlf = {};
/**
 * @name Backbone
 * @namespace Tool to control models and provide simple evented objects. 
 *      <a href="http://documentcloud.github.com/backbone/">github</a>
 */
/**
 * @name Backbone.Events
 * @class Mixin to allow the observer pattern.
 */
/**
 * @name _
 * @namespace UnderscoreJS. General tools, some of which are redundant. 
 *      Required by {@link Backbone}. 
 *      <a href="http://documentcloud.github.com/underscore/">github</a>
 */
/**
 * @name jQuery
 * @namespace jQuery factory, class, and namespace for static methods. It is
 *      only documented here as static because it can't be documented as a class
 *      and a namespace. <a href="http://api.jquery.com/">api.jquery.com</a>
 */
/**
 * @name jQuery.fn
 * @namespace General instance methods and namespace for custom plugins.
 */
/**
 * @name console
 * @namespace Built-in debugger.
 */