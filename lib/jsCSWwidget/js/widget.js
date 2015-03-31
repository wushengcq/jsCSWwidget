/**
 * @package usgin.CSWwidget
 * @desc    usgin.CSWwidget create the Web UI component, provide user interface and handle user interaction. 
 * @author	Wenwen Li <wenwen@asu.edu>
 * @author	Sheng Wu <wushengcq@gmail.com>
 * @organ	GeoDa Center for Geospatial Analysis and Computation
 *			School of Geographical Sciences and Urban Planning
 *			Arizona State University
 * @version	1.0.0
 * @license	https://github.com/usgin/jsCSWwidget/blob/master/LICENSE
 * @depend	usgin.CSW, usgin.Xml, usgin.Ajax, usgin.Looger
 */


usgin.CSWwidget = function(container, conf) {
	this.container = $("#" + container);
	this.logger = new usgin.Logger();

	this.owner = null;
	this.title = null;
	this.pageSize = null;	
	this.proxy = null;
	this.csws = null;
	this.results = null;

	this.titleBar = null;	
	this.closeBtn = null;
	this.fieldSelector = null;
	this.findInput = null;
	this.pageSizeSelector = null;
	this.cswSelector = null;
	this.findBtn = null;
	this.wmsCheck = null;
	this.wfsCheck = null;
	this.extentBtn = null;
	this.minxInput = null;
	this.minyInput = null;
	this.maxxInput = null;
	this.maxyInput = null;
	this.clearBBoxBtn = null;
	this.recordSelector = null;

	this.pagePanel = null;
	this.totalLabel = null;
	this.prePageBtn = null;
	this.nextPageBtn = null;
	this.pageLabel = null;

	this.spinner = null;

	this.infoBoard = null;
	this.serviceTypeLabel = null;
	this.abstractBtn = null;
	this.subjectBtn = null;
	this.spatialBtn = null;

	this.agents = {};
	
	var w = this;
	this.loadConf(conf, function(){
		w.init();
	});
}

usgin.CSWwidget.prototype.init = function() {
	this.logger.debug("CSWwidget initializing");
	var ctn = this.container.addClass("csw-panel").css("position","absolute");
	var frm = $("<table><tr><th class='title' colspan=4></th></tr></table>").addClass('csw-table');	
	frm.find("th").append(this.getTitleBar());
	frm.find("th").append(this.getCloseBtn());
	frm.append($("<tr>")
		.append($("<th colspan='2'>").text("Find:"))
		.append($("<th width='50em'>").text("Maximum:"))
	).append($("<tr>")
		.append($("<td>").append(this.getFieldSelector()))
		.append($("<td>").append(this.getFindInput()))
		.append($("<td>").append(this.getPageSizeSelector()))
	).append($("<tr>")
		.append($("<th colspan='3'>").text("In Catalog:"))
	).append($("<tr>")
		.append($("<td colspan='2'>").append(this.getCswSelector()))
		.append($("<td>").append(this.getFindBtn()))
	).append($("<tr>")
		.append($("<td colspan='3'>").append($("<label for='wmsCheck'>").html("wms&nbsp;").css("cursor","pointer")).append(this.getWmsCheck())
		.append("&nbsp;&nbsp;&nbsp;")
		.append($("<label for='wfsCheck'>").html("wfs&nbsp;").css("cursor","pointer")).append(this.getWfsCheck())
		.append(this.getExtentBtn().css("float","right")))
	).append($("<tr>")
		.append($("<td colspan=3>").append($("<div id='extentInput'>").css("display","none")
		.append($("<label>").html("minx&nbsp;&nbsp;")).append(this.getMinxInput())
		.append($("<label>").html("&nbsp;&nbsp;miny&nbsp;&nbsp;")).append(this.getMinyInput())
		.append($("<label>").html("&nbsp;&nbsp;maxx&nbsp;&nbsp;")).append(this.getMaxxInput())
		.append($("<label>").html("&nbsp;&nbsp;maxy&nbsp;&nbsp;")).append(this.getMaxyInput())
		.append(this.getClearBBoxBtn())
		))
	).append($("<tr>")
		.append($("<td colspan='3'>").append($("<hr class='csw-hr'>").append(this.getSpinner())))
	).append($("<tr>")
		.append($("<th>").html("Results:"))
		.append($("<td colspan='2'>")
			.append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
		.append(this.getPagePanel().append(this.getTotalLabel()).append(this.getPrePageBtn()).append(this.getPageLabel()).append(this.getNextPageBtn())))
	).append($("<tr>")
		.append($("<td colspan='3'>").append(this.getRecordSelector()))
	).append($("<tr>")
		.append($("<th colspan='3'>").text("Information:").append("&nbsp;&nbsp;&nbsp;&nbsp;")
		.append(this.getServiceTypeLabel())
		.append(this.getSpatialBtn()).append(this.getSubjectBtn()).append(this.getAbstractBtn()))
	).append($("<tr>")
		.append($("<td colspan='3'>").append($("<div class='csw-infoboard-box'>").append(this.getInfoBoard())))
	).append($("<tr>")
		.append($("<td colspan='3'>").append($("<div>")))
	);	
	ctn.append(frm);
}

usgin.CSWwidget.prototype.loadConf = function(url, func) {
	var parser = new usgin.Xml.getXmlParser(usgin.Util.getBrowserInfo(),{});
	var w = this;
	var ajax = new usgin.Ajax(url, true, {}).get(function(xml){
		w.owner = parser.getNodeValByTag(xml, 'usgin/jsCSWwidget/owner');	
		w.title = parser.getNodeValByTag(xml, 'usgin/jsCSWwidget/title');
		w.proxy = parser.getNodeValByTag(xml, 'usgin/jsCSWwidget/proxy');
		w.pageSize = parseInt(parser.getNodeValByTag(xml, 'usgin/jsCSWwidget/pageSize'));
		w.csws = parser.getNodesValByTag(xml, 'usgin/jsCSWwidget/services/csw');
		w.logger.debug(w);
		func();
	}, function(msg){
		w.logger.error(msg);	
	});
}

usgin.CSWwidget.prototype.getTitleBar = function() {
	if(this.titleBar == null) {
		var tb = $.parseHTML("<div class='csw-draggable csw-titlebar' movetarget='" + this.container.attr("id") + "'>" 
					+ "<div class='csw-org'> " + this.owner + "</div>" + this.title + "</div>");
		this.enableDrag(tb);
		this.titleBar = tb;
	}
	return this.titleBar;
}

usgin.CSWwidget.prototype.getCloseBtn = function() {
	if(this.closeBtn == null) {
		var btn = $($.parseHTML("<div class='csw-cross'>x</div>"));
		var w =this;
		btn.click(function(e){
			w.close();
		});
		this.closeBtn = btn;
	}
	return this.closeBtn;
}

usgin.CSWwidget.prototype.getFieldSelector = function() {
	if(this.fieldSelector == null) {
		var fs = $($.parseHTML("<select name='fieldSelector' class='csw-select'>"));
		var flds = ["AnyText", "Title", "Abstract"];
		for(var i=0; i<flds.length; i++) {
			fs.append($.parseHTML("<option value='" + flds[i] + "'>" + flds[i] + "</option>"));
		}
		this.fieldSelector = fs;
	}
	return this.fieldSelector;
}

usgin.CSWwidget.prototype.getFindInput = function() {
	if(this.findInput == null) {
		var ipt = $($.parseHTML("<input type='text' class='csw-input'>"));
		var w = this;
		ipt.keypress(function(event) {
			var keycode = (event.keyCode ? event.keyCode : event.which);
			if(keycode == '13') {
				w.find();
			}
		});
		ipt.val("land use");
		this.findInput = ipt;
	}
	return this.findInput;
}

usgin.CSWwidget.prototype.getPageSizeSelector = function() {
	if(this.pageSizeSelector == null) {
		var ps = $($.parseHTML("<select name='pageSize' class='csw-select'/>"));
		for(var i=0; i<=6; i++) {
			$(ps).append($.parseHTML("<option value='" + (this.pageSize + i*10) + "'>&nbsp;&nbsp;&nbsp;&nbsp; "
						+ (this.pageSize + i*10)+"</option>"));
		}
		this.pageSizeSelector = ps;
	}
	return this.pageSizeSelector;
}

usgin.CSWwidget.prototype.getCswSelector = function() {
	if(this.cswSelector == null) {
		var cs = $($.parseHTML("<select name='cswSelector' class='csw-select' />"));
		for(var i=0; i<this.csws.length; i++) {
			$(cs).append($.parseHTML("<option value='"+this.csws[i]+"'>"+this.csws[i]+"</option>"));
		}
		this.cswSelector = cs;
	}
	return this.cswSelector;
} 

usgin.CSWwidget.prototype.getFindBtn = function() {
	if (this.findBtn == null) {
		var btn = $($.parseHTML("<input type='button' value='Find' class='csw-button' />"));
		var w = this;
		btn.click(function(e){
			w.find();
		});
		this.findBtn = btn;
	}
	return this.findBtn;
}

usgin.CSWwidget.prototype.getWmsCheck = function() {
	if (this.wmsCheck == null) {
		var wc = $($.parseHTML("<input type='checkbox' class='csw-check' id='wmsCheck' checked>")); 
		this.wmsCheck = wc;
	}
	return this.wmsCheck;
}

usgin.CSWwidget.prototype.getWfsCheck = function() {
	if (this.wfsCheck == null) {
		var wc = $($.parseHTML("<input type='checkbox' class='csw-check' id='wfsCheck'>")); 
		this.wfsCheck = wc;
	}
	return this.wfsCheck;
}

usgin.CSWwidget.prototype.getExtentBtn = function() {
	if (this.extentBtn == null) {
		var eb = $($.parseHTML("<a class='csw-linkbutton'>extent</a>"));
		var w = this;
		eb.click(function(e){
			$("#extentInput").toggle()			
		});
		this.extentBtn = eb;
	}
	return this.extentBtn;
}

usgin.CSWwidget.prototype.getMinxInput = function() {
	if (this.minxInput == null) {
		var w = $($.parseHTML("<input type='text' class='csw-bbox-input'>"));
		this.minxInput = w;
	}
	return this.minxInput;
}
usgin.CSWwidget.prototype.getMinyInput = function() {
	if (this.minyInput == null) {
		var w = $($.parseHTML("<input type='text' class='csw-bbox-input'>"));
		this.minyInput = w;
	}
	return this.minyInput;
}
usgin.CSWwidget.prototype.getMaxxInput = function() {
	if (this.maxxInput == null) {
		var w = $($.parseHTML("<input type='text' class='csw-bbox-input'>"));
		this.maxxInput = w;
	}
	return this.maxxInput;
}
usgin.CSWwidget.prototype.getMaxyInput = function() {
	if (this.maxyInput == null) {
		var w = $($.parseHTML("<input type='text' class='csw-bbox-input'>"));
		this.maxyInput = w;
	}
	return this.maxyInput;
}


usgin.CSWwidget.prototype.getClearBBoxBtn = function() {
	if (this.clearBBoxBtn == null) {
		var btn = $($.parseHTML("<i class='fa fa-trash fa-fw csw-bbox-clear' title='clear input envelope'>"));
		var w = this;
		btn.click(function(e){
			w.getMinxInput().val("");
			w.getMinyInput().val("");
			w.getMaxxInput().val("");
			w.getMaxyInput().val("");
		});
		this.clearBBoxBtn = btn;
	}
	return this.clearBBoxBtn;
}


usgin.CSWwidget.prototype.getPagePanel = function() {
	if (this.pagePanel == null) {
		var pp = $($.parseHTML("<div class='csw-pager'/>"));
		this.pagePanel = pp;
	}
	return this.pagePanel;
}

usgin.CSWwidget.prototype.getTotalLabel = function() {
	if (this.totalLabel == null) {
		var tl = $($.parseHTML("<i class='csw-pager-total'>"));
		this.totalLabel = tl;
	}
	return this.totalLabel;
}

usgin.CSWwidget.prototype.getPrePageBtn = function() {
	if (this.prePageBtn == null) {
		var btn = $($.parseHTML("<i class='fa fa-chevron-left csw-btn-disabled' />"));
		var w = this;
		btn.css("padding-right", "0.5em");
		btn.click(function(e){
			if(btn.hasClass("csw-btn-enabled")) {
				w.findPage(btn.startPosition);
			}
		});
		this.prePageBtn = btn;
	}
	return this.prePageBtn;
}

usgin.CSWwidget.prototype.getNextPageBtn = function() {
	if (this.nextPageBtn == null) {
		var btn = $($.parseHTML("<i class='fa fa-chevron-right csw-btn-disabled' />"));
		var w = this;
		btn.css("padding-left", "0.5em");
		btn.click(function(e){
			if(btn.hasClass("csw-btn-enabled")) {
				w.findPage(btn.startPosition);
			}
		});
		this.nextPageBtn = btn;
	}
	return this.nextPageBtn;
}

usgin.CSWwidget.prototype.getPageLabel = function() {
	if (this.pageLabel == null) {
		var btn = $($.parseHTML("<span></span>"));
		this.pageLabel = btn;
	}
	return this.pageLabel;
}

usgin.CSWwidget.prototype.getRecordSelector = function() {
	if(this.recordSelector == null) {
		var rs = $($.parseHTML("<select name='recordSelector' class='csw-select' size='10'/>"));
		var w = this;
		rs.change(function () {
			w.showInfo();
		});
		this.recordSelector = rs;
	}
	return this.recordSelector;
}

usgin.CSWwidget.prototype.getInfoBoard = function() {
	if(this.infoBoard == null) {
		var ib = $($.parseHTML("<div class='csw-infoboard-content'/>"));
		ib.currentTheme = 'abstract';
		$(ib).html("&nbsp;")
		this.infoBoard = ib;
	}
	return this.infoBoard;
}

usgin.CSWwidget.prototype.getServiceTypeLabel = function() {
	if(this.serviceTypeLabel == null) {
		var stl = $($.parseHTML("<i class='csw-infoboard-type'/>"));
		this.serviceTypeLabel = stl;
	}
	return this.serviceTypeLabel;
}

usgin.CSWwidget.prototype.getAbstractBtn = function() {
	if(this.abstractBtn == null) {
		var btn = $($.parseHTML("<i class='fa fa-file-text fa-fw csw-infoboard-btn csw-infoboard-btn-disabled' title='Abstract'/>"));
		var w = this;
		btn.click(function(e) {
			w.showInfo('abstract');
		});
		this.abstractBtn = btn;
	}
	return this.abstractBtn;
}

usgin.CSWwidget.prototype.getSubjectBtn = function() {
	if(this.subjectBtn == null) {
		var btn = $($.parseHTML("<i class='fa fa-tags fa-fw csw-infoboard-btn csw-infoboard-btn-disabled' title='Subject'/>"));
		var w = this;
		btn.click(function(e) {
			w.showInfo('subjects');
		});
		this.subjectBtn = btn;
	}
	return this.subjectBtn;
}

usgin.CSWwidget.prototype.getSpatialBtn = function() {
	if (this.spatialBtn == null) {
		var btn = $($.parseHTML("<i class='fa fa-globe fa-fw csw-infoboard-btn csw-infoboard-btn-disabled' title='Spatial Parameters'/>"));
		var w = this;
		btn.click(function(e) {
			w.showInfo('spatial');
		});
		this.spatialBtn = btn;
	}
	return this.spatialBtn;
}

usgin.CSWwidget.prototype.getSpinner = function() {
	if (this.spinner == null) {
		var s = $($.parseHTML("<i class='fa fa-circle-o-notch fa-spin csw-spinner'>")).hide();
		this.spinner = s;
	}
	return this.spinner;
}

/* ================================================================================= */


usgin.CSWwidget.prototype.enableDrag = function(obj) {
	var s = 'csw-dragging';
	$(obj).mousedown(function(e){
		var t = $("#" + $(this).attr("movetarget"));
		var y = e.pageY - t.position().top;
		var x = e.pageX - t.position().left;
		t.addClass(s).parents().on("mousemove", function(e) {
			if (!t.hasClass(s)) return;
			t.offset({
				top:e.pageY-y, left:e.pageX-x
			}).on('mouseup', function(e){
				t.removeClass(s);
			});
			e.preventDefault();
		});
	}).mouseup(function(e){
		$('.'+s).removeClass(s);
	});	
}

usgin.CSWwidget.prototype.close = function() {
	this.container.hide("slow");
}

usgin.CSWwidget.prototype.show = function() {
	this.container.show("slow");
}

usgin.CSWwidget.prototype.showAt = function(x, y) {
	this.container.show("slow");
	this.container.offset({top:y, left:x});
}

usgin.CSWwidget.prototype.setSize = function(width, height) {
	this.container.height(height);
	this.container.width(width);
}

usgin.CSWwidget.prototype.find = function() {
	this.findPage(0);
}

usgin.CSWwidget.prototype.findPage = function(startPosition) {
	var w = this;
	var url = this.getCswSelector().val();
	var key = this.getFindInput().val();

	var csw = this.agents[url];
	if (!usgin.Util.validVar(csw)) {
		csw = new usgin.CSW(url, this.proxy);
		this.agents[url] = csw;
	}

	csw.setPageSize(this.getPageSizeSelector().val());
	csw.init(function(xml){
		w.loading();
		csw.getRecords("%" + key + "%", w.getFieldSelector().val(), w.getBBoxFilter(), startPosition, function(results) {
			w.results = results;
			w.displayResults();
		}, function(msg) {
			w.logger.error(msg);
			w.results = {
				elementSet: 'full',
				nextRecord: 0,
				numberOfRecordsMatched: 0,
				numberOfRecordsReturned: 0,
				records: new Array()
			};
			w.displayResults();
			w.getTotalLabel().html("<span class='csw-infoboard-error'>Server response error<span>");
		});
	});
}

usgin.CSWwidget.prototype.displayResults = function() {
	this.finish();
	var slct = this.getRecordSelector();
	slct.find("option").remove();
	for(var i=0; i<this.results.records.length; i++){
		var rc = this.results.records[i];
		slct.append($.parseHTML("<option value='"+rc.identifier+"'>"+"* "+rc.title+"</option>"));	
	}
	slct.find('option:first').prop('selected', 'selected');
	this.showInfo();
	this.updatePager(this.results);
}

usgin.CSWwidget.prototype.getRecordById = function(id) {
	for(var i=0; i<this.results.records.length; i++) {
		var rc = this.results.records[i];
		if(rc.identifier == id) {
			return rc;
		}
	}
	return null;
}

usgin.CSWwidget.prototype.showInfo = function(theme) {
	var opt = this.getRecordSelector().find("option:selected");
	if (usgin.Util.validVar(opt) && opt.length > 0) {
		var rc = this.getRecordById(opt.val());
		var cnt = "";
		var color = "";
		if (usgin.Util.validVar(rc)) {
			theme = usgin.Util.validVar(theme) ? theme : this.getInfoBoard().currentTheme;
			if (theme == 'abstract') {
				cnt = rc[theme];	
				color = "#a1ec21";
			} else if (theme == 'subjects') {
				for (var i=0; i<rc[theme].length; i++) {
					cnt += (i >0 ? ", " : "") + rc[theme][i];
				}
				color = "#f8ce0d";
			} else if (theme == 'spatial') {
				cnt += "<li>BoundingBox(wgs84): " + rc.wsg84BoundingBox + "<br/>";
				cnt += "<li>BoundingBox: " + rc.boundingBox + "<br/>";
				color = "#2bece5";
			}
			this.getInfoBoard().html(cnt);
			this.getInfoBoard().css("color", color);
			this.getInfoBoard().currentTheme = theme;
			this.getServiceTypeLabel().html(rc.type);
			$(".csw-infoboard-btn").removeClass("csw-btn-disabled").addClass("csw-btn-enabled");
		}
	}else{
		this.clearInfo();
	}
}

usgin.CSWwidget.prototype.clearInfo = function() {
	$(".csw-infoboard-btn").removeClass("csw-btn-enabled").addClass("csw-btn-disabled");
	this.getInfoBoard().html("");
	this.getServiceTypeLabel().html("");
}

usgin.CSWwidget.prototype.updatePager = function(rs) {
	var pl = this.getPageLabel();	
	var ps = this.getPageSizeSelector().val();
	
	if (rs.numberOfRecordsMatched > 0) { 
		var cu = (rs.nextRecord == 0) ? Math.ceil(rs.numberOfRecordsMatched/ps) : Math.ceil((rs.nextRecord-1)/ps);
		var tt = Math.ceil(rs.numberOfRecordsMatched / ps);
		pl.html(cu + " / " + tt);
		this.getTotalLabel().html("Total: " + rs.numberOfRecordsMatched + " hits");
	} else {
		pl.html("");
		this.getTotalLabel().html("Total: 0 hits");
	}
	if(rs.nextRecord == 0 || rs.nextRecord >= rs.numberOfRecordsMatched) {
		this.getNextPageBtn().removeClass('csw-btn-enabled').addClass('csw-btn-disabled');
	} else {
		this.getNextPageBtn().removeClass('csw-btn-disabled').addClass('csw-btn-enabled');
		this.getNextPageBtn().startPosition = rs.nextRecord;
	}
	if(rs.nextRecord - ps <= 1) {
		this.getPrePageBtn().removeClass('csw-btn-enabled').addClass('csw-btn-disabled');
	} else {
		this.getPrePageBtn().removeClass('csw-btn-disabled').addClass('csw-btn-enabled');
		this.getPrePageBtn().startPosition = rs.nextRecord - ps*2;
	}
}

usgin.CSWwidget.prototype.getBBoxFilter = function() {
	var reg =  /^[-+]?[0-9]+\.?[0-9]*$/;  
	var minx = this.getMinxInput().val().replace(/\s+/g, "");
	var miny = this.getMinyInput().val().replace(/\s+/g, "");
	var maxx = this.getMaxxInput().val().replace(/\s+/g, "");
	var maxy = this.getMaxyInput().val().replace(/\s+/g, "");
	return (reg.test(minx) && reg.test(miny) && reg.test(maxx) && reg.test(maxy)) ?
		{minx:minx, miny:miny, maxx:maxx, maxy:maxy} : null
}

usgin.CSWwidget.prototype.loading = function() {
	//this.getFindBtn().disable();
	this.getSpinner().show();
}

usgin.CSWwidget.prototype.finish = function() {
	//this.getFindBtn().enable();
	this.getSpinner().hide();
}
