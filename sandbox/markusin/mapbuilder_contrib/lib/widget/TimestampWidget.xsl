<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<!--
Description: Output a form for display of the cursor coordinates
Author:      Markus Innerebner
Licence:     LGPL as per: http://www.gnu.org/copyleft/lesser.html

$Id: TimestampWidget.xsl 2576 2007-02-19 09:14:01Z markusin $
-->

  <xsl:output method="xml" encoding="utf-8"/>

  <!-- The common params set for all widgets -->
  <xsl:param name="lang">en</xsl:param>
  
  <!-- text value params -->
  <xsl:param name="showDate">false</xsl:param>
	<xsl:param name="timeStampLabel">Current Timestamp: </xsl:param>
  
  <!-- The name of the form for the output of the current timestamp -->
  <xsl:param name="formName"/>

  <!-- Main html -->
  <xsl:template match="/">
    <div>
    	<form name="{$formName}" id="{$formName}">
        <xsl:if test="$showDate='true'">
          <xsl:value-of select="$timeStampLabel"/><input name="timeStamp" type="text" size="16" readonly="readonly"/>
        </xsl:if>     
    	</form>
    </div>
  </xsl:template>

</xsl:stylesheet>