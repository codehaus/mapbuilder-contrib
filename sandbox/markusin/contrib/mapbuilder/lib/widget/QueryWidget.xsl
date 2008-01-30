<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
		xmlns:wmc="http://www.opengis.net/context"
    xmlns:mb="http://mapbuilder.sourceforge.net/mapbuilder" 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<!--
Description: Search form
Author:      Markus Innerebner
Licence:     LGPL as per: http://www.gnu.org/copyleft/lesser.html

$Id: QueryWidget.xsl 2546 2007-01-23 12:07:39Z markusin $
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
  <xsl:param name="formName"/>
	<xsl:param name="formId"/>
	<xsl:param name="fromDateId"/>
	<xsl:param name="toDateId"/>

  <!-- Main html -->
  <xsl:template match="/wmc:OWSContext">
  	<!--<xsl:variable name="srs" select="//ows:BoundingBox/@crs"/>-->
		<div>
	   	<form id="{$formName}" name="{$formName}">
	    	<table width="100%">
	     	<tr>
		      <td>
		      	<div align="left">
		      		<select name="feature" id="feature">
		      			<xsl:apply-templates select="wmc:ResourceList/wmc:DynamicLayer"/>
							</select>
						</div>
		      </td>
		    	</tr>
	      <tr>
		      <td>
			      <div style="color:red; float: left;">
			      	From Date:<br/>
		      		<input type="text" name="fromDate" id="{$fromDateId}" value="2006-11-20T06:00"/><br/>
	 						To Date:<br/>
							<input type="text" name="toDate" id="{$toDateId}" value="2006-11-20T06:30"/>
		        </div>
			      <div style="text-align: left; float: none;">
			        <input name="Retrieve" onclick="javascript:config.objects.{$formId}.submitForm();" type="button" value="Start Query"/>
		        </div>
		      </td>
	      </tr>
	     </table>
	    </form>
	   </div>
  </xsl:template>
	
	
	<xsl:template match="wmc:ResourceList/wmc:DynamicLayer" >
		<xsl:if test="current()[@queryable='1']">
			<option>
			  <xsl:attribute name="value">
	   			<xsl:value-of select="current()/wmc:Name" />
				</xsl:attribute> 
				<xsl:value-of select="current()/wmc:Title"/>
			</option>
		</xsl:if>
	</xsl:template>
	
</xsl:stylesheet>