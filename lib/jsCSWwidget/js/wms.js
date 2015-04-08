/**
 * @package usgin.WMS
 * @desc    usgin.WMS can interact with WMS server, parse WMS protocol and provide information for ui widiget.
 * @author  Wenwen Li <wenwen@asu.edu>
 * @author  Sheng Wu <wushengcq@gmail.com>
 * @organ   GeoDa Center for Geospatial Analysis and Computation
 *          School of Geographical Sciences and Urban Planning
 *          Arizona State University
 * @version 1.0.0
 * @license https://github.com/usgin/jsCSWwidget/blob/master/LICENSE
 * @depend  usgin.Xml, usgin.Ajax, usgin.Looger
 */
 
usgin.WMS = function(url, proxy) {
    this.url = url;
    this.proxy = proxy;
    this.logger = new usgin.Logger();
	this.capxml = null; 
	this.xml = new usgin.Xml.getXmlParser(usgin.Util.getBrowserInfo(), {});
}

usgin.WMS.prototype.loading = function(success, error) {
	var w = this;
    if(w.capxml == null) {
        var ajax = new usgin.Ajax(w.proxy, true, {endpoint: w.url}).get(
            function(xml) {
				w.capxml = xml;
				if(usgin.Util.isFunction(success)) {
					success(xml);
				}
            },
            function(msg){
                this.logger.error("get WMS capabilities failed");
				error(msg);
            }
        );
    } else {
		success(w.capxml);
	}
}

usgin.WMS.prototype.getLayers = function(callback) {
	var w = this;
	this.loading (function(xml) {
		var lys = w.xml.getNodesByTag(xml, "Capability/Layer/Layer");
		var rslt = [];
		for (var i=0; i<lys.length; i++) {
			rslt.push({
				"linkURL": w.getWMSEndpoint(),
				"APILabel": "OGC:WMS",
				"linkParameters": [{
					"linkParameterLabel": "layerName",
					"linkParameterValue": w.xml.getNodeValByTag(lys[i], "Title")
				}]
			});
		}
		callback(rslt);
	});
}

usgin.WMS.prototype.getWMSEndpoint = function() {
	if (this.url.indexOf("?") < 0) {
		return this.url;
	} else {
		return this.url.substring(0, this.url.indexOf("?"))
	}
}
