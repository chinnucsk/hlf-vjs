/**
 * @fileoverview Canvas module.
 * @author peng@pengxwang.com (Peng Wang)
 */
/** @exports util as hlf.util */
/** @exports module as hlf.module */
Namespace(pkg + 'module');
Namespace.use(pkg + '*', function () {
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
module.Canvas = util.BaseClass(util.extend({
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
    _construct: function (id, type) {
        this.canvas = document.getElementById(id);
        if (!this.canvas.getAttribute('width')) {
            this.canvas.setAttribute('width', this.canvas.clientWidth);
            this.canvas.setAttribute('height', this.canvas.clientHeight);
        }
        this.context = this.canvas.getContext(type) || this.canvas.getContext('2d');
        this._plotter = { 'pos': { 'x': 0, 'y': 0 } };
        this._plotters = [];
        this._animations = [];
        this._animationTimers = [];
        this.animationState = module.Canvas.AnimationState.STOPPED;
        this.anticlockwise = true;
    },
    //---------------------------------------
    // ACCESSORS
    //---------------------------------------
    /** Accessor. */
    getWidth: function () {
        return this.canvas.width;
    },
    /** Accessor. */
    getHeight: function () {
        return this.canvas.height;
    },
    /** Plotter position accessor. */
    getX: function () {
        return this._plotter.pos.x;
    },
    /** Plotter position accessor. */
    getY: function () {
        return this._plotter.pos.y;
    },
    /** For arcs, converts counterclockwise to -1. */
    getAngDir: function () {
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
    movePlotter: function (x, y, isShift) {
        isShift = isShift || false;
        this._plotter.pos = isShift ? 
            {'x': this._plotter.pos.x + x, 'y': this._plotter.pos.y + y} :
            {'x': x, 'y': y};
        if (!isShift) {
            this.context.moveTo(x, y);
        }
        return this;
    },
    shiftPlotter: function (x, y) {
        return this.movePlotter(x, y, true);
    },
    /** 
     * Shorthand for drawing a sequence of something.
     * @param {?Object=} opt Parameters.
     * @param {function(Object, CanvasRenderingContext, number)} 
     *      cb Step callback.
     * @return {hlf.module.Canvas} Chains.
     */
    sequence: function (opt, cb) {
        var plotter = this._plotter,
            context = this.context;
        opt = opt || {'x': 10, 'y': 10, 'num': 10};
        for (var idx = 0; idx < opt.num; idx += 1) {
            cb({
                'x': plotter.pos.x + opt.x * idx,
                'y': plotter.pos.y + opt.y * idx
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
    circle: function (rad, noFill, noStroke) {
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
    line: function (x1, y1, x2, y2) {
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
    connect: function (pos1, pos2) {
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
    arc: function (x, y, r, start, end, offset) {
        offset = offset || 0;
        this.context.arc(x, y, r, start + offset, end + offset, this.anticlockwise);
    },
    /**
     * Save overall context and state, wraps native API.
     */
    save: function () {
        this._plotters.push(this._plotter);
        this.context.save();
    },
    /**
     * Restore overall context and state, wraps native API.
     */
    restore: function () {
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
     * @param {?number=} idx Id of animation and timer. Always should be same.
     * @return {number} The id.
     */
    animate: function (opt, cb, idx) {
        opt = opt || {'fps': 24};
        var anim = {'opt': opt, 'cb': cb};
        this._startAnimation(anim, idx);
        if (!idx) {
            this._animations.push(anim);
            return this._animations.length - 1; 
        }
    },
    /** 
     * Resets a timer, updates the index slot, and sets state to playing.
     * @param {!Object} anim Animation.
     * @param {?number=} idx Id of animation.
     * @requires hlf.util.millisPerFrame
     */
    _startAnimation: function (anim, idx) {
        var _this = this;
        idx = idx || this._animationTimers.length;
        if (this._animationTimers[idx]) {
            clearInterval(this._animationTimers[idx]);
        }
        this._animationTimers[idx] = setInterval(function () {
            _this.clear();
            anim.cb();
        }, util.millisPerFrame(anim.opt.fps));
        this.animationState = module.Canvas.AnimationState.PLAYING;
    },
    /** 
     * Clears the timer and sets state to paused.
     * @param {!number} idx Id of timer.
     */
    _stopAnimation: function (idx) {
        clearInterval(this._animationTimers[idx]);
        this.animationState = module.Canvas.AnimationState.PAUSED;
    },
    /** 
     * Removes the timer and animation from the respective indexes.
     * @param {!number} idx Id of animation and timer.
     * @todo Return to original frame.
     */
    _deleteAnimation: function (idx) {
        this._stopAnimation(idx);
        this._animationTimers.splice(idx, 1);
        this._animations.splice(idx, 1);
        this.animationState = module.Canvas.AnimationState.STOPPED;
    },
    /**
     * Temporary, for now.
     */
    clearAnimations: function () {
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
    changeAnimationStateTo: function (key, idx) {
        if (!this.AnimationState[key]) {
            return;
        }
        var anim = this._animations[idx || this._animations.length - 1];
        switch (this.AnimationState[key]) {
            case module.Canvas.AnimationState.PLAYING:
                this._startAnimation(anim, idx);
                break;
            case module.Canvas.AnimationState.PAUSED:
                this._stopAnimation(idx);
                break;
            case module.Canvas.AnimationState.STOPPED:
                this._deleteAnimation(idx);
                break;
        }
    },
    /**
     * Play command. Animation API.
     * @param {?number=} idx Id of animation and timer.
     */
    playAnimation: function (idx) {
        idx = idx || this._animations.length - 1;
        this.changeAnimationStateTo('PLAYING', idx);
    },
    /**
     * Pause command. Animation API.
     * @param {?number=} idx Id of animation and timer.
     */
    pauseAnimation: function (idx) {
        idx = idx || this._animations.length - 1;
        this.changeAnimationStateTo('PAUSED', idx);
    },
    /**
     * Smart play command. Animation API.
     * @param {?number=} idx Id of animation and timer.
     */
    togglePauseAndPlay: function (idx) {
        if (this.animationState === module.Canvas.AnimationState.PLAYING) {
            this.changeAnimationStateTo('PAUSED', idx);
        } else {
            this.changeAnimationStateTo('PLAYING', idx);
        }
    },
    /**
     * Draws a fade over the screen. For blanking use {@link #clear}.
     * @param {string} color 
     */
    background: function (color) {
        this.context.save();
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.getWidth(), this.getHeight());
        this.context.restore();
    },
    /**
     * Simple clearing rectangle over everything.
     */
    clear: function () {
        this.context.clearRect(0, 0, this.getWidth(), this.getHeight());
    },
    // ----------------------------------------
    // MISC
    // ----------------------------------------
    /**
     * Saved as png by default, and is lossless. Opens a new window / tab
     *      with the url being the resulting 'dataURL' of the image.
     */
    exportAsImage: function () {
        window.open(this.canvas.toDataURL('image/png'));
    },
    /** @ignore */
    toString: function () {
        return pkg + 'module.Canvas';
    }
}, module.EventMixin));
/**
 * Enum: PLAYING, PAUSED, STATIC.
 * @type {Object int}
 * @static 
 */
module.Canvas.AnimationState = {
    PLAYING: 1,
    PAUSED: 2,
    STOPPED: 3
};
/**
 * @class Event handling for canvas using jQuery event API.
 * @requires jQuery
 * @requires For now, requires the class to have a $canvas property.
 */
util.CanvasEventMixin = {
    /** @lends util.CanvasEventMixin# */
    /** Sets up responsiveness for mouse events. */
    bindMouse: function () {
        var _this = this;
        this.$canvas.bind({
            mousemove: function (evt) { _this.onMouseMove(evt); },
            mousedown: function (evt) { _this.onMouseDown(evt); },
            mouseup: function (evt) { _this.onMouseUp(evt); },
            mouseenter: function (evt) { _this.onMouseEnter(evt); },
            mouseleave: function (evt) { _this.onMouseLeave(evt); }
        });
    },
    /**#@+
       Event handler.
       @param {MouseEvent} evt
    */
    onMouseMove: function (evt) {},
    onMouseDown: function (evt) {},
    onMouseUp: function (evt) {},
    onMouseEnter: function (evt) {},
    onMouseLeave: function (evt) {}
    /**#@-*/
};
}); // namespace