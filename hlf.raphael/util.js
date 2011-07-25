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
Raphael.fn.hlf.init = function($width, $height){
  this.w = $width;
  this.h = $height;
  return this;
};

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