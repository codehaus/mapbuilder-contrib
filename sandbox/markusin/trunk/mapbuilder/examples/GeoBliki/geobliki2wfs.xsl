<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:gml="http://www.opengis.net/gml" xmlns:eo1="http://eo1.gsfc.nasa.gov/" xmlns:wfs="http://www.opengis.net/wfs"> 
<!--
Description: A stylesheet to convert strange geobliki wfs to standards-compliant wfs.
Author:      Andreas Hocevar andreas.hocevarATgmail.com
Licence:     LGPL as per: http://www.gnu.org/copyleft/lesser.html

$Id: geobliki2wfs.xsl 2957 2007-07-09 12:21:10Z steven $
-->
  <xsl:template match="gml:featureMember">
    <wfs:FeatureCollection>
      <xsl:for-each select="eo1:ali">
        <xsl:call-template name="featureMember"/>
      </xsl:for-each>
      <xsl:for-each select="eo1:hyperion">
        <xsl:call-template name="featureMember"/>
      </xsl:for-each>
    </wfs:FeatureCollection>
  </xsl:template>

  <xsl:template name="featureMember">
    <gml:featureMember>
      <xsl:copy-of select="current()"/>
    </gml:featureMember>
  </xsl:template>
</xsl:stylesheet>

