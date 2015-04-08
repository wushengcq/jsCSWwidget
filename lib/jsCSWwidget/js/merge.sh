#! /bin/sh

rm usgin.csw.min.js

hr="\n/* --------------------------------------------------------------- */"
for f in usgin.js util.js logger.js ajax.js xml.js csw.js wms.js wfs.js widget.js 
do
	cat $f >> usgin.csw.widget.min.js
	echo $hr >> usgin.csw.widget.min.js
done
