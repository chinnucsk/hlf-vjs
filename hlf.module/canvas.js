/**
 * @fileoverview Canvas module.
 * @author peng@pengxwang.com (Peng Wang)
 */
/** @exports Ut as hlf.util */
/** @exports Mod as hlf.module */
_.namespace(hlfPkg + '.module');
(function(hlf){
var Ut = hlf.util, Mod = hlf.module;
/**
 * TODO doc
 */
Ut.CanvasStyleMixin = {
  palette: {},
  backgroundColor: undefined,
  foregroundColor: undefined,
  _augmentStyle: function(){
    Ut.extend(this.palette, {
      black: new Ut.Color(0,0,0),
      white: new Ut.Color(255,255,255)
    });
  }
};
/**
 * @class A custom wrapper class for the HTMLCanvasElement and its API. Its
 *      purpose is to simplify common tasks and provide an object-oriented API
 *      for the otherwise declarative canvas API, and to add a more robust 
 *      handling of canvas state and canvas-wide events.
 * @augments hlf.util.BaseClass
 * @augments hlf.module.EventMixin
 * @property {Element} canvas Associated canvas element.
 * @property {CanvasRenderingContext} context Associated canvas context/API.
 * @property {Object} _plotter Metaphorical pen.
 * @property {Array Object} _plotters Collection of pens, useful for changing contexts.
 * @property {hlf.module.Canvas.AnimationState} animationState
 * @property {Array number} _animationTimers List of interval ids.
 * @property {Array Object} _animations List of generally a step lambda and settings.
 * @property {boolean} anticlockwise Setting for all future arcs drawn.
 * @param {!string} id Canvas DOM element id.
 * @param {?string=} type Canvas context/API type.
 */
Mod.Canvas = Ut.Class.extend(Ut.extend({
  /** @lends module.Canvas# */
  // ----------------------------------------
  // PROPERTIES
  // ----------------------------------------
  canvas: undefined,
  context: undefined,
  _plotter: undefined,
  _plotters: undefined,
  animationState: undefined,
  _animationTimers: undefined,
  _animations: undefined,
  anticlockwise: undefined,
  // ----------------------------------------
  // METHODS
  // ----------------------------------------
  /**
   * Gets the element by id and sets the dimension properties via existing 
   *      CSS properties.
   */
  _init: function(id, type){
    this.canvas = document.getElementById(id);
    if (!this.canvas.getAttribute('width')) {
      this.canvas.setAttribute('width', this.canvas.clientWidth);
      this.canvas.setAttribute('height', this.canvas.clientHeight);
    }
    this.context = this.canvas.getContext(type) || this.canvas.getContext('2d');
    this._plotter = { pos: {x: 0, y: 0}};
    this._plotters = [];
    this._animations = [];
    this._animationTimers = [];
    this.animationState = AnimationState.STOPPED;
    this.anticlockwise = true;
    if (this._augmentStyle) {
      this._augmentStyle();
    }
  },
  //---------------------------------------
  // ACCESSORS
  //---------------------------------------
  /** Accessor. */
  getWidth: function(){
    return this.canvas.width;
  },
  /** Accessor. */
  getHeight: function(){
    return this.canvas.height;
  },
  /** Plotter position accessor. */
  getX: function(){
    return this._plotter.pos.x;
  },
  /** Plotter position accessor. */
  getY: function(){
    return this._plotter.pos.y;
  },
  /** For arcs, converts counterclockwise to -1. */
  getAngDir: function(){
    return this.anticlockwise ? -1 : 1;
  },
  //---------------------------------------
  // PLOTTING
  //---------------------------------------
  /** 
   * Update pen position.
   * @param {!number} x Horizontal offset.
   * @param {!number} y Vertical offset.
   * @param {?boolean=} isShift Increment from current offset.
   * @return {hlf.module.Canvas} Chains.
   */
  movePlotter: function(x, y, isShift){
    isShift = isShift || false;
    this._plotter.pos = isShift ? {
        x: this._plotter.pos.x + x, 
        y: this._plotter.pos.y + y
      } : {
        x: x, 
        y: y
      };
    if (!isShift) {
      this.context.moveTo(x, y);
    }
    return this;
  },
  shiftPlotter: function(x, y){
    return this.movePlotter(x, y, true);
  },
  /** 
   * Shorthand for drawing a sequence of something.
   * @param {?Object=} opt Parameters.
   * @param {function(Object, CanvasRenderingContext, number)} 
   *      cb Step callback.
   * @return {hlf.module.Canvas} Chains.
   */
  sequence: function(opt, cb){
    var plotter = this._plotter,
        context = this.context;
    opt = opt || {
      x: 10, 
      y: 10, 
      num: 10
    };
    for (var idx = 0; idx < opt.num; idx += 1) {
      cb({
        x: plotter.pos.x + opt.x * idx,
        y: plotter.pos.y + opt.y * idx
      }, context, idx);
    }
    return this;
  },
  /** 
   * Shortcut to drawing a circle, and by default sets fill and stroke.
   * @param {!number} rad Radius.
   * @param {?boolean=} noFill Defaults to false.
   * @param {?boolean=} noStroke Defaults to false.
   */
  circle: function(rad, noFill, noStroke){
    var plotter = this._plotter,
        context = this.context;
    context.beginPath();
    context.arc(plotter.pos.x + rad + 1, 
          plotter.pos.y + rad + 1, 
          rad, 0, Math.PI * 2, 
          this.anticlockwise);
    if (!noFill) { context.fill(); }
    if (!noStroke) { context.stroke(); }
    context.closePath();
  },
  /**
   * Shortcut to drawing a straight line.
   * @param {!number} x1
   * @param {!number} y1
   * @param {!number} x2
   * @param {!number} y2
   */
  line: function(x1, y1, x2, y2){
    var context = this.context;
    context.beginPath();
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
  },
  /**
   * Shortcut to drawing a straight line between nodes.
   * @param {!Object number} pos1
   * @param {!Object number} pos2
   */
  connect: function(pos1, pos2){
    this.line(pos1.x, pos1.y, pos2.x, pos2.y);
  },
  /**
   * Shortcut to drawing an arc.
   * @param {!number} x
   * @param {!number} y
   * @param {!number} r
   * @param {!number} start
   * @param {!number} end
   * @param {!number} offset Hack for rotation.
   */
  arc: function(x, y, r, start, end, offset){
    offset = offset || 0;
    this.context.arc(x, y, r, start + offset, end + offset, this.anticlockwise);
  },
  /**
   * Save overall context and state, wraps native API.
   */
  save: function(){
    this._plotters.push(this._plotter);
    this.context.save();
  },
  /**
   * Restore overall context and state, wraps native API.
   */
  restore: function(){
    this._plotter = this._plotters.pop();
    this.context.restore();
  },
  //---------------------------------------
  // ANIMATION
  //---------------------------------------
  /** 
   * Sets up an animation. Animation API.
   * @param {?Object=} opt Parameters.
   * @param {function} cb Frame callback.
   * @param {?int=} duration Default is infinite.
   * @param {?int=} idx Id of animation and timer. Always should be same.
   * @return {number} The id.
   */
  animate: function(opt, cb, duration, idx){
    opt = opt || {fps: 24};
    var anim = {
          opt: opt, 
          cb: cb
        };
    if (duration) {
      anim.duration = duration;
    }
    this._startAnimation(anim, idx);
    if (!idx || !idx in this._animations) {
      this._animations.push(anim);
      return this._animations.length - 1; 
    } else {
      return idx;
    }
  },
  /** 
   * Resets a timer, updates the index slot, and sets state to playing.
   * @param {!Object} anim Animation.
   * @param {?number=} idx Id of animation.
   * @param {?int=} duration Default is infinite.
   * @requires hlf.util.millisPerFrame
   */
  _startAnimation: function(anim, idx){
    idx = idx || this._animationTimers.length;
    if (this._animationTimers[idx]) { // reset
      clearInterval(this._animationTimers[idx]);
    }
    if (anim.duration) {
      var start, elapsed, complete,
          reset = _.bind(function(){
            start = this.millis();
            elapsed = 0;
            complete = false;
          }, this);
      reset();
      this._animationTimers[idx] = setInterval(_.bind(function(){
        // on each frame
        elapsed = this.millis() - start;
        if (elapsed >= anim.duration) {
          complete = true;
        } else {
          this.clear();
        }
        anim.cb(elapsed, complete);
        if (complete && anim.opt.repeat) {
          this.clear();
          reset();
          anim.cb(elapsed, complete);
        }
      }, this), Ut.millisPerFrame(anim.opt.fps));  
    } else {
      this._animationTimers[idx] = setInterval(_.bind(function(){
        // on each frame
        this.clear();
        anim.cb();
      }, this), Ut.millisPerFrame(anim.opt.fps));  
    }
    this.animationState = AnimationState.PLAYING;
  },
  /** 
   * Clears the timer and sets state to paused.
   * @param {!number} idx Id of timer.
   */
  _stopAnimation: function(idx){
    if (!this._animationTimers[idx]) {
      throw {
        message: 'Stopping animation failed',
        idx: idx
      };
    }
    clearInterval(this._animationTimers[idx]);
    this.animationState = AnimationState.PAUSED;
  },
  /** 
   * Removes the timer and animation from the respective indexes.
   * @param {!number} idx Id of animation and timer.
   * @todo Return to original frame.
   */
  _deleteAnimation: function(idx){
    this._stopAnimation(idx);
    this._animationTimers.splice(idx, 1);
    this._animations.splice(idx, 1);
    this.animationState = AnimationState.STOPPED;
  },
  /**
   * Temporary, for now.
   */
  clearAnimations: function(){
    for (var i = 0, l = this._animationTimers.length; i < l; i += 1) {
      clearInterval(this._animationTimers[i]);
    }
    this._animations = [];
    this._animationTimers = [];
  },
  /** 
   * State controller. Animation API.
   * @param {!hlf.module.Canvas.AnimationState} key 
   * @param {?number=} idx Id of animation and timer.
   */
  changeAnimationStateTo: function(key, idx){
    if (!AnimationState[key]) {
      return;
    }
    var anim = this._animations[idx || this._animations.length - 1];
    switch (AnimationState[key]) {
      case AnimationState.PLAYING:
        this._startAnimation(anim, idx);
        break;
      case AnimationState.PAUSED:
        this._stopAnimation(idx);
        break;
      case AnimationState.STOPPED:
        this._deleteAnimation(idx);
        break;
    }
  },
  /**
   * Play command. Animation API.
   * @param {?number=} idx Id of animation and timer.
   */
  playAnimation: function(idx){
    idx = idx || this._animations.length - 1;
    this.changeAnimationStateTo('PLAYING', idx);
  },
  /**
   * Pause command. Animation API.
   * @param {?number=} idx Id of animation and timer.
   */
  pauseAnimation: function(idx){
    idx = idx || this._animations.length - 1;
    this.changeAnimationStateTo('PAUSED', idx);
  },
  /**
   * Smart play command. Animation API.
   * @param {?number=} idx Id of animation and timer.
   */
  togglePauseAndPlay: function(idx){
    if (this.animationState === AnimationState.PLAYING) {
      this.changeAnimationStateTo('PAUSED', idx);
    } else {
      this.changeAnimationStateTo('PLAYING', idx);
    }
  },
  /**
   * Draws a fade over the screen. For blanking use {@link #clear}.
   * @param {hlf.util.Color} color 
   */
  background: function(color){
    color = color || this.backgroundColor;
    this.context.save();
    this.context.fillStyle = color;
    this.context.fillRect(0, 0, this.getWidth(), this.getHeight());
    this.context.restore();
  },
  /**
   * Simple clearing rectangle over everything.
   */
  clear: function(){
    this.context.clearRect(0, 0, this.getWidth(), this.getHeight());
  },
  /**
   * Simple way to get current time signature.
   * @return {int}
   */
  millis: function(){
    return new Date().getTime();
  },
  // ----------------------------------------
  // MISC
  // ----------------------------------------
  /**
   * TODO doc
   */
  randomLocation: function(){
    var pos = {};
    pos.x = Ut.toInt(Ut.simpleRandom(this.getWidth())); 
    pos.y = Ut.toInt(Ut.simpleRandom(this.getHeight())); 
    return pos;
  },
  /**
   * Saved as png by default, and is lossless. Opens a new window / tab
   *      with the url being the resulting 'dataURL' of the image.
   */
  exportAsImage: function(){
    window.open(this.canvas.toDataURL('image/png'));
  },
  /** @ignore */
  toString: function(){
    return hlfPkg + 'module.Canvas';
  }
}, Mod.EventMixin, Ut.CanvasStyleMixin));
/**
 * Enum: PLAYING, PAUSED, STATIC.
 * @type {Object int}
 * @static 
 */
var AnimationState = Mod.Canvas.AnimationState = {
  PLAYING: 1,
  PAUSED: 2,
  STOPPED: 3
};
/**
 * @class Event handling for canvas using jQuery event API.
 * @requires jQuery
 * @requires For now, requires the class to have a $canvas property.
 */
Ut.CanvasEventMixin = {
  /** @lends Ut.CanvasEventMixin# */
  /** Sets up responsiveness for mouse events. */
  bindMouse: function(){
    this.$canvas.bind('mousemove mousedown mouseup mouseenter mouseleave',
      _.bind(function(evt){
        this['onMouse'+evt.type.substr(5,1).toUpperCase()+evt.type.substr(6)](evt); 
        evt.stopPropagation();
      }, this));
  },
  /**#@+
     Event handler.
     @param {MouseEvent} evt
  */
  onMouseMove: function(evt){},
  onMouseDown: function(evt){},
  onMouseUp: function(evt){},
  onMouseEnter: function(evt){},
  onMouseLeave: function(evt){}
  /**#@-*/
};
/**
 * TODO doc
 */
Ut.Color = Ut.Class.extend({
  red: undefined,
  blue: undefined,
  green: undefined,
  alpha: undefined,
  _init: function(){
    if (arguments.length >= 3) {
      this.red = arguments[0];
      this.green = arguments[1];
      this.blue = arguments[2];
      this.alpha = arguments[3] ? arguments[3] : 1;
    }
  },
  rgbWithAlpha: function(a){
    var values = [this.red, this.blue, this.green];
    if (a) {
      values.push(a);
    }
    return values;
  },
  stringWithAlpha: function(a){
    return 'rgb'+(a?'a':'')+'('+this.rgbWithAlpha(a).join(',')+')';
  }
});
/**
 * TODO doc
 * Also known as sketch
 */
Mod.CanvasApplication = Ut.Class.extend(Ut.extend({
  /**
   * jQuery object resulting from the toolbar plugin. Has buttons including:
   *      #stop-animation and #export-canvas. Own id is #the-canvas-toolbar.
   * @requires jQuery.fn.toolbar
   * @type {jQuery}
   */
  $toolbar: null,
  $stopper: null,
  $exporter: null,
  canvas: null,
  opt: {},
  _init: function(opt){
    this.opt = Ut.extend(this.opt, opt);
  },
  setup: function(){
    this.$exporter = $('#export-canvas')
      .bind('click', $.proxy(function(evt){
        this.canvas.exportAsImage();
        evt.preventDefault();
      }, this));
    this.$stopper = $('#stop-animation')
      .bind('click', $.proxy(function(evt){
        var $elem = $(this);
        this.canvas.togglePauseAndPlay();
        $elem.text(($elem.text() === 'stop') ? 'play' : 'stop');
        evt.preventDefault();
      }, this));
    this.$toolbar = $('#the-canvas-toolbar').hlfToolbar();
  },
  teardown: function(){},
  start: function(){
    $(document).bind('on off', $.proxy(this._toggleControlHandler, this));
  },
  stop: function(){},
  manager: function(){},
  _toggleControlHandler: function(evt, type){
    type = type.split('-');
    var handlerName = (evt.type === 'on') ? 'start' : 'stop',
        mainType = type.pop(),
        subType = type.join('-'),
        typeConstant = this.constants()[Ut.constantCase(mainType)][Ut.constantCase(subType)];
    handlerName += Ut.titleCase(mainType);
    if (handlerName in this.manager()) {
      this.manager()[handlerName](typeConstant);
    }
  }
}, Mod.EventMixin));
// ----------------------------------------
// OUTRO
// ----------------------------------------
})(_.namespace(hlfPkg));