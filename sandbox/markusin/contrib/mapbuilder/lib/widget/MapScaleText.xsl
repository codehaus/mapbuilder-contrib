<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
    xmlns:mb="http://mapbuilder.sourceforge.net/mapbuilder" 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<!--
Description: Output a form for displaying and setting the map scale denominator
Author:      Mike Adair
Licence:     LGPL as per: http://www.gnu.org/copyleft/lesser.html

$Id: MapScaleText.xsl 1608 2005-08-03 19:07:09Z mattdiez $
-->

  <xsl:output method="xml" encoding="utf-8"/>

  <!-- The common params set for all widgets -->
  <xsl:param name="lang">en</xsl:param>
  <xsl:param name="modelId"/>
  <xsl:param name="widgetId"/>

  <!-- The name of the form for coordinate output -->
  <xsl:param name="mapScale"/>
  <xsl:param name="mapScaleLabel">scale 1:</xsl:param>
  <xsl:param name="formName">MapScaleTextForm</xsl:param>

  <!-- Main html -->
  <xsl:template match="/">
    <div>
      <form name="{$formName}" id="{$formName}" onsubmit="return config.objects.{$widgetId}.submitForm()">
        <xsl:value-of select="$mapScaleLabel"/><input name="mapScale" type="text" size="10" value="{$mapScale}"/>
        <!--input type="submit" value="set scale"/-->
        <!--a href="javascript:config.{$modelId}.{$widgetId}.submitForm();">set new scale</a-->
      </form>
    </div>
  </xsl:template>
  
</xsl:stylesheet>
