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
		typeNames: this.getParamOpts(op, 'typeNames')[0], // csw:Record, gmd:MD_Metadata
		ElementSetName: 'full', // this.getParamOpts(op, 'ElementSetName')[0],
		resultType: this.getParamOpts(op, 'resultType')[0], // results, hits, validate
		outputFormat: this.getParamOpts(op, 'outputFormat')[0], // application/xml, text/xml
		outputSchema: this.getParamOpts(op, 'outputSchema')[0], // http://www.opengis.net/cat/csw/2.0.2, http://www.isotc211.org/2005/gmd
		maxRecords: this.pageSize,
		startPosition: (usgin.Util.validVar(startPosition)  && parseInt(startPosition) > 0)? startPosition : 1,
	};

	if( usgin.Util.validVar(literal) && literal.trim() != '' && literal.trim() != '%' && literal.trim() != '?') {
		params.CONSTRAINTLANGUAGE = "FILTER"; // this.getParamOpts(op, 'CONSTRAINTLANGUAGE')[0],
       	params.CONSTRAINT_LANGUAGE_VERSION = '1.1.0';
        params.Constraint = this.buildFilter(literal, property, bbox);
	}
	var w = this;
	this.request(params, function(xml){
		var rslts = w.toJsRecords(xml);
		success(rslts);
	}, error);
}

usgin.CSW.prototype.buildFilter = function(literal, property, bbox) {
	var b = usgin.Util.validVar(bbox) || literal.indexOf('wms') >= 0 || literal.indexOf('wfs') >= 0;
	var c = "<ogc:Filter xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml'>";
	c += b ? "<ogc:And>" : "";
	//c += "<ogc:And><ogc:PropertyIsLike wildCard='%' singleChar='_' escape='\\'>"
	//	+ "<ogc:PropertyName>protocol</ogc:PropertyName>"
	//	+ "<ogc:Literal>%wms%</ogc:Literal></ogc:PropertyIsLike>" 
	c += literal.indexOf('wms') < 0 ? "" : "<ogc:PropertyIsLike wildCard='%' singleChar='_' escape='\\'>"
		+ "<ogc:PropertyName>subject</ogc:PropertyName>"
		+ "<ogc:Literal>%wms%</ogc:Literal></ogc:PropertyIsLike>";
	c += literal.indexOf('wfs') < 0 ? "" : "<ogc:PropertyIsLike wildCard='%' singleChar='_' escape='\\'>"
		+ "<ogc:PropertyName>subject</ogc:PropertyName>"
		+ "<ogc:Literal>%wfs%</ogc:Literal></ogc:PropertyIsLike>";
	c += "<ogc:PropertyIsLike wildCard='%' singleChar='_' escape='\\'>"
		+ "<ogc:PropertyName>" + (usgin.Util.validVar(property) ? property : "AnyText") + "</ogc:PropertyName>"
		+ "<ogc:Literal>" + literal + "</ogc:Literal></ogc:PropertyIsLike>";
	c += usgin.Util.validVar(bbox) ? "<ogc:BBOX><ogc:PropertyName>ows:BoundingBox</ogc:PropertyName><gml:Envelope>"
		+ "<gml:lowerCorner>" + bbox.minx + " " + bbox.miny + "</gml:lowerCorner>"
		+ "<gml:upperCorner>" + bbox.maxx + " " + bbox.maxy + "</gml:upperCorner>"
		+ "</gml:Envelope></ogc:BBOX>" : "";
	c += b ? "</ogc:And>" : "";
	//c += "</ogc:And></ogc:Filter>"
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
			references: this.xml.getNodesValByTag(rs[i], 'dct:references'),
			wsg84BoundingBox : this.getBoundingBox(rs[i], "ows:WGS84BoundingBox"),
			boundingBox: this.getBoundingBox(rs[i], "ows:BoundingBox"),
		}
		results.records.push(r);
	}	
	return results;
}

usgin.CSW.prototype.getBoundingBox = function(rs, node) {
	var box = this.xml.getNodeByTag(rs, node);
	if (usgin.Util.validVar(box)) {
		var lower = this.xml.getNodeValByTag(box, 'ows:LowerCorner').split(" ");
		var upper = this.xml.getNodeValByTag(box, 'ows:UpperCorner').split(" ");
		return [parseFloat(lower[0]), parseFloat(lower[1]), parseFloat(upper[0]), parseFloat(upper[1])];
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
		//ElementSetName: this.getParamOpts(op, 'ElementSetName')[0],
		ElementSetName: 'full',
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

