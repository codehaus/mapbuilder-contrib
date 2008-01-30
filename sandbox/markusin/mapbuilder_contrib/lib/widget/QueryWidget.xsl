<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
    xmlns:mb="http://mapbuilder.sourceforge.net/mapbuilder" 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<!--
Description: Search form
Author:      Markus Innerebner
Licence:     LGPL as per: http://www.gnu.org/copyleft/lesser.html

$Id: QueryWidget.xsl 2546 2007-01-23 12:07:39Z gjvoosten $
-->

  <xsl:output method="xml" encoding="utf-8"/>

  <!-- The common params set for all widgets -->
  <xsl:param name="lang">en</xsl:param>
  <xsl:param name="modelId"/>
  <xsl:param name="modelTitle"/>
  <xsl:param name="targetModel"/>
  <xsl:param name="widgetId"/>

  <!-- Text params for this widget -->
  <xsl:param name="title"/>
  <xsl:param name="load"/>

    <!-- The name of the form for coordinate output -->
  <xsl:param name="defaultUrl"/>
  <xsl:param name="formName">SearchInputForm</xsl:param>
		<xsl:param name="fromDate"/>
		<xsl:param name="toDate"/>

  <!-- Main html -->
  <xsl:template match="/">
			<div>
   	<form id="{$formName}" name="{$formName}">
    	<table border="1" width="100%">
     	<tr>
	      <td>
	      	<div align="left">Please choose one of the following bus lines (moving points): 
									<select name="feature" id="feature">
	         <!-- TBD load them automatically -->
	         <option value="linea10a">Linea10a</option>
         </select>
        </div>
	      </td>
	    	</tr>
      <tr>
	      <td>
	      	<div style="color:red; float: left;">
	        <input id="fromDateField" name="fromDateField" type="text" value="{$fromDate}"/> 
									<img alt="" src="images/calendar.gif" onclick="c3.popup('fromDateField');"/> 
									<input id="toDateField" name="toDateField" type="text" value="{$toDate}"/> 
									<img alt="" src="images/calendar.gif" onclick="c3.popup('toDateField');"/>
        </div>
	       <div style="text-align: right; float: right;">
	        <input name="Retrieve" onclick="javascript:config.objects.webServiceForm.submitForm();" type="button" value="Start Query"/>
        </div>
	      </td>
      </tr>
	     <tr><td></td></tr>
     </table>
    </form>
   </div>
	  <div>
	   <form name="{$formName}" id="{$formName}" onsubmit="return config.objects.{$widgetId}.submitForm()">
	     <input name="defaultUrl" type="text" size="30" value="{$defaultUrl}"/>
	     <input type="button" onclick="javascript:config.objects.{$widgetId}.submitForm();" value="Search" />
	   </form>
  	</div>
  </xsl:template>
</xsl:stylesheet>
