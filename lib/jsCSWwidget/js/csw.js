/**
 * @package usgin.CSW
 * @desc    usgin.CSW can interact with CSW server, parse CSW protocol and provide information for ui widiget.
 * @author  Wenwen Li <wenwen@asu.edu>
 * @author  Sheng Wu <wushengcq@gmail.com>
 * @organ   GeoDa Center for Geospatial Analysis and Computation
 *          School of Geographical Sciences and Urban Planning
 *          Arizona State University
 * @version 1.0.0
 * @license https://github.com/usgin/jsCSWwidget/blob/master/LICENSE
 * @depend  usgin.Xml, usgin.Ajax, usgin.Looger
 */
 
usgin.CSW = function(url, proxy) {
    this.url = url;
    this.proxy = proxy;
    this.logger = new usgin.Logger();
	this.capxml = null; 
	this.xml = new usgin.Xml.getXmlParser(usgin.Util.getBrowserInfo(), {
		'csw': 'http://www.opengis.net/cat/csw/2.0.2',
		'ogc': 'http://www.opengis.net/ogc',
		'ows': 'http://www.opengis.net/ows',
		'xlink': 'http://www.w3.org/1999/xlink',
		'dc': 'http://purl.org/dc/elements/1.1/',
		'dct': 'http://purl.org/dc/terms/'
	});

	this.pageSize = 20; 
}

usgin.CSW.prototype.init = function(callback) {
	var c = this;
    if(c.capxml == null) {
        var ajax = new usgin.Ajax(c.proxy, false, {
            endpoint: c.url,
            service: 'CSW',
            acceptVersions: '2.0.2',
            request: 'GetCapabilities'}).get(
            function(xml){
				c.capxml = xml;
				if(usgin.Util.isFunction(callback)) {
					callback(xml);
				}
            },
            function(msg){
                this.logger.error("get csw capabilities failed");
            }
        );
    } else {
		callback(c.capxml);
	}
}

usgin.CSW.prototype.setCapabilities = function(xml) {
	this.capxml = xml;
}

usgin.CSW.prototype.getCapabilities = function() {
	if (this.capxml == null) {
		throw new Error("CSW object not ready, please execute init() function first. from prototype");
	}
	return this.capxml;
}

usgin.CSW.prototype.setPageSize = function(size) {
	this.pageSize = size;
}

usgin.CSW.prototype.getRecords = function(literal, property, bbox, startPosition, success, error) {
	var op = this.xml.getNodeByAttr(this.getCapabilities(),'ows:OperationsMetadata/ows:Operation','name','GetRecords');
	var params = {
		endpoint: this.url,
		service: 'CSW',
		version: this.getVersion(),
		REQUEST: op.getAttribute('name'),
		typeNames: this.getParamOpts(op, 'typeNames')[0],
		ElementSetName: 'full', //ElementSetName: this.getParamOpts(op, 'ElementSetName')[0],
		resultType: 'results',
		outputFormat: 'application/xml',
		maxRecords: this.pageSize,
		startPosition: (usgin.Util.validVar(startPosition)  && parseInt(startPosition) > 0)? startPosition : 1,
		CONSTRAINTLANGUAGE: "FILTER", // this.getParamOpts(op, 'CONSTRAINTLANGUAGE')[0],
		CONSTRAINT_LANGUAGE_VERSION: '1.1.0',
		Constraint: this.buildFilter(literal, property, bbox)
	};
	var w = this;
	this.request(params, function(xml){
		var rslts = w.toJsRecords(xml);
		success(rslts);
	}, error);
}

usgin.CSW.prototype.buildFilter = function(literal, property, bbox) {
	var b = usgin.Util.validVar(bbox);
	var c = "<ogc:Filter xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml'>";
	c += b ? "<ogc:And>" : "";
	c += "<ogc:PropertyIsLike wildCard='%' singleChar='_' escape='\\'>"
		+ "<ogc:PropertyName>" + (usgin.Util.validVar(property) ? property : "AnyText") + "</ogc:PropertyName>"
		+ "<ogc:Literal>" + literal + "</ogc:Literal></ogc:PropertyIsLike>";
	//c += b ? "<ogc:BBOX><ogc:PropertyName>ows:WGS84BoundingBox</ogc:PropertyName><gml:Envelope srsName='EPSG:4326'>"
	c += b ? "<ogc:BBOX><ogc:PropertyName>ows:BoundingBox</ogc:PropertyName><gml:Envelope>"
		+ "<gml:lowerCorner>" + bbox.minx + " " + bbox.miny + "</gml:lowerCorner>"
		+ "<gml:upperCorner>" + bbox.maxx + " " + bbox.maxy + "</gml:upperCorner>"
		+ "</gml:Envelope></ogc:BBOX>" : "";
	c += b ? "</ogc:And>" : "";
	c += "</ogc:Filter>"
	this.logger.debug(c);
	return c;	
}

usgin.CSW.prototype.toJsRecords = function(xml) {
	var n = this.xml.getNodeByTag(xml, "csw:SearchResults");
	var results = {
		elementSet: n.getAttribute('elementSet'),
		nextRecord: parseInt(n.getAttribute('nextRecord')),
		numberOfRecordsMatched: parseInt(n.getAttribute('numberOfRecordsMatched')),
		numberOfRecordsReturned: parseInt(n.getAttribute('numberOfRecordsReturned')),
		records: new Array()
	}
	var rs = this.xml.getNodesByTag(n, "csw:Record");
	for(var i=0; i<rs.length; i++) {
		var r = {
			identifier: this.xml.getNodeValByTag(rs[i], "dc:identifier"),
			title: this.xml.getNodeValByTag(rs[i], 'dc:title'),
			abstract: this.xml.getNodeValByTag(rs[i], 'dct:abstract'),
			subjects: this.xml.getNodesValByTag(rs[i], 'dc:subject'),
			type: this.xml.getNodeValByTag(rs[i], 'dc:type'),
			references: this.xml.getNodeValByTag(rs[i], 'dct:references'),
			wsg84BoundingBox : this.getBoundingBox(rs[i], "ows:WGS84BoundingBox"),
			boundingBox: this.getBoundingBox(rs[i], "ows:BoundingBox")
		}
		results.records.push(r);
	}	
	return results;
}

usgin.CSW.prototype.getBoundingBox = function(rs, node) {
	var box = this.xml.getNodeByTag(rs, node);
	if (usgin.Util.validVar(box)) {
		var lower = this.xml.getNodeValByTag(box, 'ows:LowerCorner');
		var upper = this.xml.getNodeValByTag(box, 'ows:UpperCorner');
		return lower + ", " + upper;
	} else {
		return "unknown";
	}
}

usgin.CSW.prototype.getRecordById = function(id, success, error) {
	var op = this.xml.getNodeByAttr(this.getCapabilities(), 'ows:OperationsMetadata/ows:Operation', 'name', 'GetRecordById');
	var params = {
		endpoint: this.url,
		service: 'CSW',
		version: this.getVersion(),
		REQUEST: op.getAttribute('name'),
		ElementSetName: this.getParamOpts(op, 'ElementSetName')[0],
		outputFormat: 'application/xml',
		Id: id
	};
	this.request(params, success, error);
}

usgin.CSW.prototype.getVersion = function() {
	var v = this.xml.getNodeByTag(this.getCapabilities(), 'ows:ServiceIdentification/ows:ServiceTypeVersion');
	return v.childNodes[0].nodeValue;
}

usgin.CSW.prototype.getParamOpts = function(op, pname) {
	var param = this.xml.getNodeByAttr(op, 'ows:Parameter', 'name', pname);
	var opts = this.xml.getNodesByTag(param, 'ows:Value');
	var rslt = [];
	for(var i=0; i<opts.length; i++) {
		rslt.push(opts[i].childNodes[0].nodeValue);
	}
	return rslt;
}

usgin.CSW.prototype.request = function(params, success, error) {
	var c = this;
	var ajax = new usgin.Ajax(this.proxy, false, params).get(function(xml){
		var ex = c.xml.getNodeByTag(xml, 'ows:Exception');
		if (!usgin.Util.validVar(ex)) {
			success(xml);
		}else{
			error(xml);
		}
	}, error);
}
