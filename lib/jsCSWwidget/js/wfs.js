/**
 * @package usgin.WFS
 * @desc    usgin.WFS can interact with WFS server, parse WFS protocol and provide information for ui widiget.
 * @author  Wenwen Li <wenwen@asu.edu>
 * @author  Sheng Wu <wushengcq@gmail.com>
 * @organ   GeoDa Center for Geospatial Analysis and Computation
 *          School of Geographical Sciences and Urban Planning
 *          Arizona State University
 * @version 1.0.0
 * @license https://github.com/usgin/jsCSWwidget/blob/master/LICENSE
 * @depend  usgin.Xml, usgin.Ajax, usgin.Looger
 */
 
usgin.WFS = function(url, proxy) {
    this.url = url;
    this.proxy = proxy;
    this.logger = new usgin.Logger();
	this.capxml = null; 
	this.xml = new usgin.Xml.getXmlParser(usgin.Util.getBrowserInfo(), {
		'wfs': 'http://www.opengis.net/wfs', 
		'ogc': 'http://www.opengis.net/ogc',
		'gml': 'http://www.opengis.net/gml', 
		'ows': 'http://www.opengis.net/ows',
		'xsi': 'http://www.w3.org/2001/XMLSchema-instance', 
		'xlink': 'http://www.w3.org/1999/xlink', 
		'aasg': 'http://stategeothermaldata.org/uri-gin/aasg/xmlschema/bhlithinterval/0.9'
	});
}

usgin.WFS.prototype.loading = function(success, error) {
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
                w.logger.error("get WFS capabilities failed");
				error(msg);
            }
        );
    } else {
		success(w.capxml);
	}
}

usgin.WFS.prototype.getBbox = function(xml) {
	var low = this.xml.getNodeValByTag(xml, "ows:WGS84BoundingBox/ows:LowerCorner").split(" ");	
	var up  = this.xml.getNodeValByTag(xml, "ows:WGS84BoundingBox/ows:UpperCorner").split(" ");	
	return [parseFloat(low[0]), parseFloat(low[1]), parseFloat(up[0]), parseFloat(up[1])];
}

usgin.WFS.prototype.getLayers = function(callback) {
	var w = this;
	this.loading (function(xml) {
		var lys = w.xml.getNodesByTag(xml, "wfs:FeatureTypeList/FeatureType");
		var rslt = [];
		for (var i=0; i<lys.length; i++) {
			rslt.push({
				"linkURL": w.getWFSEndpoint(),
				"APILabel": "OGC:WFS",
				"linkParameters": [
					{"linkParameterLabel":"featureType", "linkParameterValue": w.xml.getNodeValByTag(lys[i], "wfs:Name")},
					{"linkParameterLabel":"title", "linkParameterValue": w.xml.getNodeValByTag(lys[i], "wfs:Title")},
					{"linkParameterLabel":"defaultSRS", "linkParameterValue": w.xml.getNodeValByTag(lys[i], "wfs:DefaultSRS")},
					{"linkParameterLabel":"wgs84bbox", "linkParameterValue": w.getBbox(lys[i])}
				]
			});
		}
		callback(rslt);
	}, function(err_msg){
		callback([]);
	});
}

usgin.WFS.prototype.getWFSEndpoint = function() {
	if (this.url.indexOf("?") < 0) {
		return this.url;
	} else {
		return this.url.substring(0, this.url.indexOf("?"))
	}
}
