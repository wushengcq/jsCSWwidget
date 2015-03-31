/**
 * @package	usgin.Ajax
 * @desc	usgin.Ajax object wrap the HttpXmlRequest object for asynchronous data loading.
 * @author	Wenwen Li <wenwen@asu.edu>
 * @author	Sheng Wu <wushengcq@gmail.com>
 * @organ	GeoDa Center for Geospatial Analysis and Computation
 * 			School of Geographical Sciences and Urban Planning
 * 			Arizona State University
 * @version	1.0.0
 * @license	https://github.com/usgin/jsCSWwidget/blob/master/LICENSE
 * @depend  usgin.Looger
 */

usgin.Ajax = function(url, enable_cache, params) {
	this.url = url;
	this.cached = enable_cache;
	this.params = params;
	this.logger = new usgin.Logger();
	return this;
};

usgin.Ajax.prototype.assembleParams = function(params) {
	var kvps = [];
	var ec = encodeURIComponent;
	for (var key in params) {
		if (params[key] !== null) {
			kvps.push(ec(key) + '=' + ec(params[key]));
		}
	}
	return kvps.join('&');
}

usgin.Ajax.prototype.get = function(success, error) {
	var request = this.url + "?" + this.assembleParams(this.params);
	request += this.cached ? '' : '&_t='+(new Date()).getTime(); 
	this.logger.info(request);
	var xhr = this.xhrWrap('GET', request, null, success, error);
}

usgin.Ajax.prototype.post = function(success, error, cached) {
	var data = this.assembleParams(this.params);
	data += this.cached ? '' : '&_t='+(new Date()).getTime(); 
	this.logger.info(data);
	this.xhrWrap('POST', this.url, data, success, error);
}

usgin.Ajax.prototype.xhrWrap = function(method, url, data, success, error) {
	var xhr = this.getXHR();
	if (!xhr) return false;
	xhr.open(method, url, true);
	xhr.setRequestHeader('X-Request-With', 'XMLHttpRequest');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.onreadystatechange = function() {
		if (xhr.readyState > 3 && success) {
			if (xhr.status === 200 ) {
				success(xhr.responseXML, xhr);
			} else {
				error(xhr.responseText, xhr);		
			}
		}
	}
	xhr.send(data);
	return xhr;
}

usgin.Ajax.prototype.getXHR = function() {
	var root = ('undefined' == typeof window) ? this : window;
	for( a=4; a--; ){
		try{
			return new(root.XMLHttpRequest || root.ActiveXObject)([
				"Mxxml2.XMLHTTP",
				"Msxml2.XMLHTTP.3.0",
				"Msxml2.XMLHTTP.6.0",
				"Microsoft.XMLHTTP"][a]);
		}catch(e){}
	}
	return false;
}

