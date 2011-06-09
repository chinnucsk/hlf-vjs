_.namespace(hlfPkg + '.util');
(function(hlf){
var Ut = hlf.util;
/**
 * @param {!string} prop Name of property.
 * @param {!Object} obj Must have x, y, and [prop].
 */
console.logAtPos = function (prop, obj) {
  var line = [prop,'at',obj.pos.x,obj.pos.y].join(' ');    
  if (obj[prop]) {
    console.log(obj[prop], line);
  } else {
    console.log(line);
  }
};
/**
 * @param {!Object} obj Must have angStart and angEnd.
 */
console.logArc = function (obj) {
  console.log(['arc from',obj.angStart,'to',obj.angEnd].join(' '));
};
})(_.namespace(hlfPkg));
