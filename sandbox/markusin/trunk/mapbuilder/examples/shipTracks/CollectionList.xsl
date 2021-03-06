<?xml version="1.0" encoding="ISO-8859-1"?>

<!--
Description: parses an OGC context collection document to generate a context pick list
Author:      adair
Licence:     LGPL as specified in http://www.gnu.org/copyleft/lesser.html .

$Id: CollectionList.xsl 2957 2007-07-09 12:21:10Z steven $
$Name:  $
-->

<xsl:stylesheet version="1.0" 
    xmlns:wmc="http://www.opengis.net/context" 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:xlink="http://www.w3.org/1999/xlink"
    exclude-result-prefixes="wmc xlink">

  <xsl:output method="xml" omit-xml-declaration="yes" encoding="utf-8"/>
  <xsl:strip-space elements="*"/>

  <!-- The common params set for all widgets -->
  <xsl:param name="lang">en</xsl:param>

  <!-- Text params for this widget -->
  <xsl:param name="title"/>

  <!-- The coordinates of the DHTML Layer on the HTML page -->
  <!-- xsl:param name="jsfunction">config.loadModel('</xsl:param -->
  <xsl:param name="widgetId"/>
  <xsl:param name="targetModel"/>

  <!-- template rule matching source root element -->
  <xsl:template match="/wmc:ViewContextCollection">

    <ul>
      <xsl:apply-templates select="wmc:ViewContextReference"/>
    </ul>

  </xsl:template>

  <xsl:template match="wmc:ViewContextReference">
    <xsl:param name="linkUrl">config.objects.<xsl:value-of select="$widgetId"/>.switchMap(config.objects.<xsl:value-of select="$widgetId"/>,'<xsl:value-of select="wmc:ContextURL/wmc:OnlineResource/@xlink:href"/>')</xsl:param>
    <xsl:param name="name"><xsl:value-of select='wmc:Title'/></xsl:param>
    <input type='button' value="{$name}"  onClick="{$linkUrl}" />
  </xsl:template>
  
</xsl:stylesheet>
