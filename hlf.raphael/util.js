// intro
(function(hlf){
var Rl = hlf.raphael, Ut = hlf.util;

// paper methods

/**
 * TODO doc, refactor
 */
Raphael.fn.hlf.circle = function(xoff, yoff, r, dir){
  var x, y,
      a = this.w, b = this.h, c = this.w/2, d = this.h/2;
  switch (dir) {
    case 'n':  x = c; y = 0; xoff += 0;   yoff += r;  break;
    case 'e':  x = a; y = d; xoff += -r;  yoff += 0;  break;
    case 's':  x = c; y = b; xoff += 0;   yoff += -r; break;
    case 'w':  x = 0; y = d; xoff += r;   yoff += 0;  break;
    case 'nw': x = 0; y = 0; xoff += r;   yoff += r;  break;
    case 'ne': x = a; y = 0; xoff += -r;  yoff += r;  break;
    case 'sw': x = 0; y = b; xoff += r;   yoff += -r; break;
    case 'se': x = a; y = b; xoff += -r;  yoff += -r; break;
  }
  x += xoff;
  y += yoff;
  return this.circle(x, y, r);
};

/**
 * TODO doc
 */
Raphael.fn.hlf.init = function($width, $height){
  this.w = $width;
  this.h = $height;
  return this;
};

// element methods

/**
 * TODO doc
 */
Raphael.el.hlfAdd = function(el, xoff, yoff){
  xoff = typeof xoff !== 'undefined' ? xoff : 0;
  yoff = typeof yoff !== 'undefined' ? yoff : 0;
  switch (el.type) {
    case 'circle':
      yoff = xoff = 0;
      break;
  }
  el = el.attr({
    'cx': this.attr('cx') + xoff,
    'cy': this.attr('cy') + yoff
  });
  return this;
};

/**
 * TODO doc, refactor
 */
Raphael.el.hlfHover = function(cbEnter, waitEnter, cbLeave, waitLeave){
  var intentEnter = true, intentLeave = true;
  if (typeof cbEnter !== undefined) {
    waitEnter = (waitEnter || 1) * 1000;
    this.hlfBind('mouseenter', function(evt){
      if (intentEnter) {
        intentEnter = false;
        cbEnter.apply(this, [evt]);
        setTimeout(function(){
          intentEnter = true;
        }, waitEnter);
      }
    });
  } 
  if (typeof cbLeave !== undefined) {
    waitLeave = (waitLeave || 1) * 1000;
    this.hlfBind('mouseleave', function(evt){
      if (intentLeave) {
        intentLeave = false;
        cbLeave.apply(this, [evt]);
        setTimeout(function(){
          intentLeave = true;
        }, waitLeave);
      }
    });
  }
};

/**
 * TODO doc
 */
Raphael.el.hlfBind = function(events, cb) {
  var $el = $(this.node);
  $el.bind(events, $.proxy(cb, this));
  return this;
};

/**
 * TODO doc
 */
Raphael.el.hlfAnimate = function(name, duration, reps, el, opt){
  duration *= 1000 * reps;
  var run = $.proxy(el && true ? function(){ 
        return this.animate(keyframes, duration); 
      } : function(){ 
        return this.animateWith(el, keyframes, duration); 
      }, this),
      keyframes = Rl.sequences[name](this, opt || {}, reps);
  return run();
};

// sequences

Rl.sequences = {};
/**
 * TODO doc, abstract
 */
Rl.sequences.simplePulse = function(el, opt, reps){
  var scale = opt.scale || 2,
      s = {
        '0.5': {r: el.attr('r') * scale, easing: '>'},
        '1': {r: el.attr('r'), easing: '<', callback: opt.endCb}
      },
      seq = {};
  if (reps) {
    _s = $.extend({}, s);
    s = {};
    reps += 1;
    for (var i = 0; i < reps; i += 1) {
      s[(i+0.5)/reps +''] = _s['0.5'];
      s[(i+1)/reps +''] = _s['1'];
    }
  }
  $.each(s, function(k, v){
    seq[Ut.toInt(k * 100)+'%'] = v;
  });
  return seq;
};

// outro
})(_.namespace(hlfPkg));