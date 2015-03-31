/**
 * @package usgin.Util
 * @desc    usgin.Util provide all the common useful tools. 
 * @author  Wenwen Li <wenwen@asu.edu>
 * @author  Sheng Wu <wushengcq@gmail.com>
 * @organ   GeoDa Center for Geospatial Analysis and Computation
 *          School of Geographical Sciences and Urban Planning
 *          Arizona State University
 * @version 1.0.0
 * @license https://github.com/usgin/jsCSWwidget/blob/master/LICENSE
 */

usgin.Util = {}

usgin.Util.isFunction = function(fun) {
	return (typeof fun === 'function');
}

usgin.Util.validVar = function(obj) {
	if( obj instanceof Array) {
		var b = true;
		for(var i=0; i<obj.length; i++){
			b = b && !(typeof obj[i] === 'undefined' || obj[i] === null);
		}
		return b;
	}else{
		return !(typeof obj === 'undefined' || obj === null);
	}
}

usgin.Util.getBrowserInfo = function() {
	var ua=navigator.userAgent, tem, M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
	if (/trident/i.test(M[1])) {
		tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
		return 'IE '+(tem[1]||'');
	}   
	if (M[1]==='Chrome') {
		tem=ua.match(/\bOPR\/(\d+)/)
		if(tem!=null)   {return 'Opera '+tem[1];}
	}   
	M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
	if ((tem=ua.match(/version\/(\d+)/i))!=null) { M.splice(1,1,tem[1]); }
	return {
		name: M[0],
		version: M[1]
	};
}

usgin.Util.toType = function(obj) {
	return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
}
