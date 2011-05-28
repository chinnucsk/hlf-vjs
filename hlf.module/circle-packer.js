/**
 * @fileoverview Mostly ported from moocirclepack.js
 * @author peng@pengxwang.com (Peng Wang)
 */
/** @exports util as hlf.util */
_.namespace(pkg + 'module');
_.using(pkg + '*', function () {
/**
 * @class Settings object of view-model methods and properties for CirclePacker.
 *      No construction procedure.
 * @augments hlf.util.BaseClass
 * @property {int} N_BASE Base circle number, if necessary.
 * @property {number} R_BASE Base circle radius.
 * @property {number} R_MIN Radius minimum.
 * @property {number} R_VARIATION Amount of variation between radii.
 * @property {int} N_PASS Number of 'packing' passes, default is 35.
 */
util.CirclePackerViewModel = util.BaseClass({
  /** @lends util.CirclePackerViewModel# */
  N_BASE: undefined,
  R_BASE: undefined,
  R_MIN: undefined,
  R_VARIATION: undefined,
  N_PASS: undefined,
  /**
   * Delegate accessor for generating a radius.
   * @param {number=} rel Some sort of amplifier or control.
   */
  getRad: function (rel) {},
  /**
   * Delegate accessor for generating a x position within canvas bounds.
   * @param {number=} rad Radius factor for the calculation.
   */
  getBX: function (rad) {},
  /**
   * Delegate accessor for generating a y position within canvas bounds.
   * @param {number=} rad Radius factor for the calculation.
   */
  getBY: function (rad) {},
  /**
   * Delegate accessor for intially positioning the circle.
   * @param {number=} rel Some sort of amplifier or control.
   * @param {number=} rad Radius factor for the calculation.
   */
  getPos: function (rel, rad) {},
  
  getOrigin: function () {},
  /** @ignore */
  toString: function () {
    return pkg + 'util.CirclePackerViewModel';
  }
});
/**
 * @class Representation of a circle.
 * @augments hlf.util.BaseClass
 * @property {number} rad Radius, default is 0.
 * @property {Object<number>} pos Position, default is 0, 0.
 * @param {?number=} rad
 * @param {?Object=} pos
 */
util.Circle = util.BaseClass({
  /** @lends util.Circle# */
  rad: undefined,
  pos: undefined,
  _construct: function (rad, pos) {
    this.rad = rad || 0;
    this.pos = pos || {x: 0, y: 0};
  },
  /**
   * Move with a vector, in distance and direction.
   * @param {!hlf.util.Vector|Object} v Modifying set of components, 
   *      typically a vector.
   */
  shiftAlong: function (v) {
    this.pos.x += v.x;
    this.pos.y += v.y;
  },
  /**
   * Move with a vector, in distance and direction.
   * @param {!hlf.util.Vector|Object} v Modifying set of components,
   *      typically a vector.
   */
  shiftAgainst: function (v) {
    this.pos.x -= v.x;
    this.pos.y -= v.y;
  },
  /**
   * Update to position to fit within the view as defined by the view model 
   *      delegate accessors for view bounds.
   * @param {!hlf.util.ViewModel} vm View model with the required accessors.
   * @deprecated until I refine this.
   */
  updateToView: function (vm) {
    this.pos.x = Math.min(vm.getBX(this.rad), this.pos.x);
    this.pos.y = Math.min(vm.getBY(this.rad), this.pos.y);
    this.pos.x = Math.max(0, this.pos.x);
    this.pos.y = Math.max(0, this.pos.y);
  },
  /** @ignore */
  toString: function () {
    return pkg + 'util.Circle';
  }
});
/**
 * @class This is a port of moocirclepack. The distance methods have been
 *      relocated from the Circle object.
 * @augments hlf.util.BaseClass
 * @augments hlf.module.EventMixin
 * @requires hlf.util.CirclePackerViewModel
 * @requires hlf.util.Circle
 * @requires hlf.util.dist
 * @author Joshua Gross <a href="mailto:josh@unwieldy.net">email</a> | 
 *      <a href="http://unwieldy.net">site</a>
 * @property {Array hlf.util.Circle} circles 
 * @property {util.CirclePackerViewModel} vm View model.
 * @property {Object number} origin Attractor position.
 * @property {number} damping Modifier for attracting distance to grow and cause
 *      settling effect.
 * @property {int} runner Interval id.
 * @property {int} passes Goal.
 * @property {int} pass Current.
 * @param {!Object mixed|Array hlf.util.Circle} arg1 View model, or circles.
 * @param {Object number=} arg2 If arg1 is circles, origin.
 * @param {Object number=} arg3 If arg1 is circles, passes.
 */
module.CirclePacker = util.BaseClass(util.extend({
  /** @lends module.CirclePacker# */
  circles: undefined,
  vm: undefined,
  origin: undefined,
  damping: undefined,
  runner: undefined,
  passes: undefined,
  pass: undefined,
  /**
   * Circle packer can work as an independent canvas agent through being 
   *      passed a view model, or it can work under a canvas agent / node 
   *      manager by having its circles map to the nodes.
   * @param {Array} arguments
   */
  _construct: function () {
    if (arguments.length > 1) {
      this.circles = arguments[0];
      this.origin = arguments[1];
      this.passes = arguments[2];
    } else if (arguments.length === 1) {
      this.vm = arguments[0];
      this.origin = this.vm.getOrigin();
      this.circles = [];
      this.passes = this.vm.N_PASS;
      var num = this.vm.N_BASE,
        rad, i;
      for (i = 0; i < num; i++) {
        rad = this.vm.getRad(i / num);
        pos = this.vm.getPos(i / num, rad);
        this.circles[i] = util.Circle.create(rad, pos);
      }
    }
  },
  /**
   * Attach a handler to this event to draw on a circle packer pass. 
   * @name module.CirclePacker#drawingSocket
   * @event
   * @param {Event} e
   */
  /**
   * @name module.CirclePacker#willSettle
   * @event
   * @param {Event} e
   */
  /**
   * @name module.CirclePacker#didSettle
   * @event
   * @param {Event} e
   */
  /**
   * Public API. Unfortunately, in browsers, it is currently impractical to run a for-loop
   *      on the circle packing algorithm. Instead, we do it with a timer which,
   *      while more sloppy, allows the processor to breathe and prevents the browser
   *      from locking up.
   * @param {?int=} pass Starting pass.
   */
  run: function (pass) {
    var _this = this;
    this.pass = pass ? pass : 0;
    this.damping = (pass ? Math.pow(0.98, pass) : 1) * 0.1; // TODO - refactor into const
    if (this.runner) {
      clearInterval(this.runner);
    }
    this.runner = setInterval(function () {
      _this.trigger('drawingSocket');
      _this._iterator(_this.pass += 1);
      if (_this.damping < 0.007) {
        clearInterval(_this.runner);
        _this.trigger('didSettle');
      }
    }, 30);
    this.trigger('willSettle');
  },
  /** 
   * Main calculator and iterator.
   * @param {?int=} pass Current.
   * @todo Fix porting hack for Function.bind
   */
  _iterator: function (pass) {
    var ci, cj, dx, dy, d, r, i, j,
      v = util.Vector.create(),
      _this = this;
    this.circles.sort(function (c1, c2) {
      return _this._compare(c1, c2);
    });
    for (i = 0, l = this.circles.length; i < l; i += 1) {
      ci = this.circles[i];
      for (j = i + 1; j < l; j += 1) {
        if (i == j) {
          continue;
        }
        cj = this.circles[j];
        dx = cj.pos.x - ci.pos.x;
        dy = cj.pos.y - ci.pos.y;
        d = (dx * dx) + (dy * dy);
        r = cj.rad + ci.rad;
        if (d < (r * r - 0.01)) {
          v.x = dx;
          v.y = dy;
          v.normalize();
          v.mult((r - Math.sqrt(d)) * 0.5);
          cj.shiftAlong(v);
          ci.shiftAgainst(v);
        }
      }
    }
    this.damping *= 0.98;
    this._contract(this.damping);
  },
  /**
   * Tweaks the circle's position based on the current damping value.
   * @param {!number} damping Current.
   */
  _contract: function (damping) {
    if (damping < 0.01) {
      return;
    }
    var x, y, ci;
    for (var i = 0, l = this.circles.length; i < l; i += 1) {
      ci = this.circles[i];
      x = (ci.pos.x - this.origin.x) * damping;
      y = (ci.pos.y - this.origin.y) * damping;
      ci.shiftAgainst(util.Vector.create(x, y));
    }
  },
  /** 
   * Compare distance vector with radius vector.
   * @param {!hlf.util.Circle} c1 Circle to pack.
   * @param {!hlf.util.Circle} c2 Circle for reference.
   * @return {boolean}
   */
  _compare: function (c1, c2) {
    var dist1 = this._distanceTo(c1.pos, this.origin);
    var dist2 = this._distanceTo(c2.pos, this.origin);
    if (dist1 < dist2) {
      return 1;
    } else if (dist1 > dist2) {
      return -1;
    } else {
      return 0;
    }
  },
  /**
   * Gets the distance from the differences between the positions' components. 
   * @param {Object number} pos1
   * @param {Object number} pos2
   */
  _distanceTo: function(pos1, pos2) {
    var dx = pos1.x - pos2.x,
      dy = pos1.y - pos2.y;
    return util.dist(dx, dy);
  },
  /** @ignore */
  toString: function () {
    return pkg + 'module.CirclePacker';
  }
}, module.EventMixin));
}); // namespace