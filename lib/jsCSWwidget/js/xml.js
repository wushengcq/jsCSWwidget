/**
 * @package usgin.Xml
 * @desc	usgin.Xml provide a simple wrapper of XML parser for web browsers. 
 * @author	Wenwen Li <wenwen@asu.edu>
 * @author	Sheng Wu <wushengcq@gmail.com>
 * @organ	GeoDa Center for Geospatial Analysis and Computation
 *			School of Geographical Sciences and Urban Planning
 *			Arizona State University
 * @version	1.0.0
 * @license	https://github.com/usgin/jsCSWwidget/blob/master/LICENSE
 * @depend	usgin.Util
 */

usgin.Xml = {};
usgin.Xml.getXmlParser = function(browser, namespaces) {
	var parser = null;
	if (browser.name === 'MSIE' && browser.version < 9) {
		parser = new usgin.Xml.IE();
	}else{
		parser = new usgin.Xml.Base();
	}
	parser.setNamespaces(namespaces);
	return parser;
}

usgin.Xml.Base = function() {
	this.logger = new usgin.Logger();
	this.namespaces = {};
}

usgin.Xml.Base.prototype = {};

usgin.Xml.Base.prototype.setNamespaces = function(nss) {
	this.namespaces = nss;
}

usgin.Xml.Base.prototype.getNamespaces = function() {
	return this.namespaces;
}

usgin.Xml.Base.prototype.getNamespace = function(abbr) {
	return this.getNamespaces()[abbr];
}

usgin.Xml.Base.prototype.getNodeByAttr = function(xml, tag, attr, val) {
	var ns = this.getNodesByAttr(xml, tag, attr, val);
	return ns.length > 0 ? ns[0] : null;
}

usgin.Xml.Base.prototype.getNodesByAttr = function(xml, tag, attr, val) {
	var ns = this.getNodesByTag(xml, tag);
	var rslt = [];
	val = val.toUpperCase();
	for (var i=0; i<ns.length; i++) {
		if (ns[i].getAttribute(attr).toUpperCase() === val) {
			rslt.push(ns[i]);
		}
	}			
	return rslt;
}

usgin.Xml.Base.prototype.getNodeByTag = function(xml, tag) {
	var ns = this.getNodesByTag(xml, tag);	
	return ns.length > 0 ? ns[0] : null;
}

usgin.Xml.Base.prototype.getNodesByTag = function(xml, tag) {
	if (!usgin.Util.validVar([xml, tag])) return [];
	var path = tag.split("/");
	var p = xml;
	for(var i=1; i<=path.length; i++) {
		if (i == path.length) {
			return this._getNodesByTag(p, path[i-1]);
		}else{
			p = this._getNodesByTag(p, path[i-1]);
			if (p.length == 0){
				 return [];
			}else{
				p = p[0];
			}
		}
	}
}

usgin.Xml.Base.prototype.getNodeValByTag = function(xml, tag) {
	var n = this.getNodeByTag(xml, tag);
	return usgin.Util.validVar(n) && n.childNodes.length > 0 ? n.childNodes[0].nodeValue : null;
}

usgin.Xml.Base.prototype.getNodesValByTag = function(xml, tag) {
	var ns = this.getNodesByTag(xml, tag);
	var vals = new Array();
	for(var i=0; i<ns.length; i++) {
		if(ns[i].childNodes.length > 0) {
			vals.push(ns[i].childNodes[0].nodeValue);
		}
	}
	return vals;
}

usgin.Xml.Base.prototype._getNodesByTag = function(xml, tag) {
	var pt = tag.split(":");
	if (pt.length > 1) {
		return xml.getElementsByTagNameNS(this.getNamespace(pt[0]), pt[1]);
	}else{
		return xml.getElementsByTagName(pt[0]);
	}
}

usgin.Xml.IE = function() {
	this.id = "xml parser for ie";
}
usgin.Xml.IE.prototype = new usgin.Xml.Base();
usgin.Xml.IE.prototype._getNodesByTag = function(xml, tag) {
	return xml.getElementsByTagName(tag);
}
