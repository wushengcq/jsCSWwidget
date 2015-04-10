#! /bin/sh

out_file=usgin.csw.widget.min.js

rm $out_file

echo "/**" >> $out_file
echo " * @package USGIN CSW Web Client Widget" >> $out_file
echo " * @author  Wenwen Li <wenwen@asu.edu>" >> $out_file
echo " * @author  Sheng Wu <wushengcq@gmail.com>" >> $out_file
echo " * @organ   GeoDa Center for Geospatial Analysis and Computation" >> $out_file
echo " *          School of Geographical Sciences and Urban Planning" >> $out_file
echo " *          Arizona State University" >> $out_file
echo " * @version 1.0.0" >> $out_file
echo " * @license https://github.com/usgin/jsCSWwidget/blob/master/LICENSE" >> $out_file
echo " */" >> $out_file

for f in usgin.js util.js logger.js ajax.js xml.js csw.js wms.js wfs.js widget.js 
do
	cat $f | egrep -v '^\s\*|\*\*|^\s//|^$' >> $out_file
done
