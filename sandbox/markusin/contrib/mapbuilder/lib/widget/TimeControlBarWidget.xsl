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
	<xsl:param name="timeEnvelopeForm"/>
	<xsl:param name="startTimeInputField"/>
	<xsl:param name="endTimeInputField"/>
	
	<xsl:template match="/">
		<div>
			<form name="{$timeEnvelopeForm}" id="{$timeEnvelopeForm}">
				<div style="position: relative; float: left;">
					<input name="{$startTimeInputField}" type="text" size="8" readonly="readonly"/>
				</div>
				<div style="position: relative; float: right;">
					<input name="{$endTimeInputField}" type="text" size="8" readonly="readonly"/>
				</div>
			</form>
		</div>
  </xsl:template>

</xsl:stylesheet>