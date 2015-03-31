/**
 * @package	usgin.Logger
 * @desc	usgin.Logger is a configurable log controller which can provide the running details at different level, 
 *			such as DEBUG, INFO, WARN and ERROR, according to the programmer's setting.
 * @author	Wenwen Li <wenwen@asu.edu>
 * @author	Sheng Wu <wushengcq@gmail.com>
 * @organ	GeoDa Center for Geospatial Analysis and Computation
 *			School of Geographical Sciences and Urban Planning
 *			Arizona State University
 * @version	1.0.0
 * @license	https://github.com/usgin/jsCSWwidget/blob/master/LICENSE
 */


usgin.Logger = function(lv) {
	var level = lv ? lv : 1;
	this.getLevel = function() {return level;}
	this.setLevel = function(v) {level = v;}
}
usgin.Logger.LEVELS = {
	DEBUG:1, INFO:2, WARN:3, ERROR:4
};
usgin.Logger.prototype.out = function(msg, level) {
	if(this.getLevel() <= level && window.console) {
		switch(level) {
		case usgin.Logger.LEVELS.DEBUG:
			console.log(msg); break;
		case usgin.Logger.LEVELS.INFO:
			console.info(msg); break;
		case usgin.Logger.LEVELS.WARN:
			console.warn(msg); break;
		case usgin.Logger.LEVELS.ERROR:
			console.error(msg); break;
		default:
			console.log(msg);
		}
		return true;
	}
	return false;
}
usgin.Logger.prototype.debug = function(msg) {
	return this.out(msg, usgin.Logger.LEVELS.DEBUG);
}
usgin.Logger.prototype.info = function(msg) {
	return this.out(msg, usgin.Logger.LEVELS.INFO);
}
usgin.Logger.prototype.warn = function(msg) {
	return this.out(msg, usgin.Logger.LEVELS.WARN);
}
usgin.Logger.prototype.error = function(msg) {
	return this.out(msg, usgin.Logger.LEVELS.ERROR);
}
