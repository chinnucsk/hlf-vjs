Namespace(pkg + 'util');
Namespace.use(pkg + '*', function () {
//---------------------------------------
// CLASSES
//---------------------------------------
// TODO - Refactor util.dist to util.Vector.magnitude
/**
 * @class 2D Vector
 * @augments hlf.util.BaseClass
 * @requires hlf.util.dist
 * @property {number} x Current x component.
 * @property {number} y Current y component.
 * @property {number} mag Current magnitude.
 * @param {number} x Starting x component, defaults to 0.
 * @param {number} y Starting y component, defaults to 0.
 */
util.Vector = util.BaseClass({
    /** @lends util.Vector# */
    x: undefined,
    y: undefined,
    mag: undefined,
    _construct: function (x, y) {
        this.x = x || 0;
        this.y = y || 0;
        this.getMagnitude();
    },
    /**
     * Gets the distance between x and y.
     * @param {?boolean=} fresh Update protected property.
     * @return {number}
     */
    getMagnitude: function (fresh) {
        if (!this.mag || fresh) {
            this.mag = util.dist(this.x, this.y);
        }
        return this.mag;
    },
    /**
     * Adds each component of target vector, or a scalar to each component.
     * @param {!hlf.util.Vector|number} v Target vector or scalar.
     * @param {number} dir Direction: 1 or -1.
     */
    add: function (v, dir) {
        dir = (dir !== undefined) ? dir : 1;
        var isVector = v.hasOwnProperty('x');
        this.x += dir * (isVector ? v.x : v);
        this.y += dir * (isVector ? v.y : v);
    },
    /**
     * Multiplies each component of target vector, or a scalar to each component.
     * @param {!hlf.util.Vector|number} v Target vector or scalar.
     * @param {?number=} dir Direction: 1 or -1.
     */
    mult: function (v, dir) {
        v = v || 1;
        dir = (dir !== undefined) ? dir : 1;
        var isVector = v.hasOwnProperty('x');
        this.x *= dir * (isVector ? v.x : v);
        this.y *= dir * (isVector ? v.y : v);
    },
    /**
     * Multiply itself with the inverse of the magnitude.
     */
    normalize: function () {
        this.mult(1 / this.getMagnitude(true));
    },
    /** @ignore */
    toString: function () {
        return pkg + 'util.Vector';
    }
}); 
}); // namespace