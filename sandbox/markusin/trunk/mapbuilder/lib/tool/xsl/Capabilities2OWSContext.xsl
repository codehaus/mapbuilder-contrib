<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns="http://www.opengis.net/ows-context/0.2.1"
  xmlns:wmc="http://www.opengis.net/context" 
  xmlns:wms="http://www.opengis.net/wms"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:ows="http://www.opengis.net/ows">

  <xsl:output method="xml" indent="yes"/>

  <xsl:param name="width">600</xsl:param>
  <xsl:param name="selectedLayer"/>
  <xsl:param name="styleName">composite</xsl:param>

  <xsl:template match="/WMT_MS_Capabilities">
    <xsl:param name="wmsVersion" select="@version"/>    
    <xsl:param name="wmsTitle" select="Service/Title"/>
    <xsl:param name="wmsOnlineResource" select="Capability/Request/GetMap/DCPType/HTTP/Get/OnlineResource/@xlink:href"/>    
    <OWSContext version="0.2.1" id="ows-context"
    	xmlns="http://www.opengis.net/ows-context/0.2.1"
    	xmlns:xlink="http://www.w3.org/1999/xlink"
			xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
			xmlns:sld="http://www.opengis.net/sld" 
			xmlns:ogc="http://www.opengis.net/ogc" 
			xmlns:ows="http://www.opengis.net/ows" 
			xmlns:param="http://www.opengis.net/param" 
			xsi:schemaLocation="http://www.opengis.net/ows-context/0.2.1 ../../schemas/owsContext.xsd">
			<General>
				<xsl:apply-templates select="Service">
            <xsl:with-param name="latLonBoundingBox" select="Capability/Layer/LatLonBoundingBox"/>
        </xsl:apply-templates>
			</General>
      <ResourceList>
        <xsl:choose>
        	<xsl:when test="string-length($selectedLayer)>0">
	          <xsl:apply-templates select="Capability/Layer/Layer[normalize-space(Name)=normalize-space($selectedLayer)]">
	            <xsl:with-param name="version" select="$wmsVersion"/>
	            <xsl:with-param name="title" select="$wmsTitle"/>
	            <xsl:with-param name="url" select="$wmsOnlineResource"/>
	          </xsl:apply-templates>
        	</xsl:when>
        	<xsl:otherwise>
	          <xsl:apply-templates select="Capability/Layer/Layer">
	            <xsl:with-param name="version" select="$wmsVersion"/>
	            <xsl:with-param name="title" select="$wmsTitle"/>
	            <xsl:with-param name="url" select="$wmsOnlineResource"/>
	          </xsl:apply-templates>
        	</xsl:otherwise>
        </xsl:choose>
      </ResourceList>
    </OWSContext>
  </xsl:template>
  
  <!-- Service -->
  <xsl:template match="Service">
  	<xsl:param name="latLonBoundingBox"/>
  	<xsl:param name="url"/>
    <xsl:variable name="minx" select="number($latLonBoundingBox/@minx)"/>
    <xsl:variable name="maxx" select="number($latLonBoundingBox/@maxx)"/>
    <xsl:variable name="miny" select="number($latLonBoundingBox/@miny)"/>
    <xsl:variable name="maxy" select="number($latLonBoundingBox/@maxy)"/>
    <xsl:variable name="dy" select=" $maxy - $miny "/>
    <xsl:variable name="dx" select=" $maxx - $minx "/>
    <xsl:variable name="height" select="round(($dy div $dx)*$width)"/>
    
		<Window width="{$width}" height="{$height}"/>
    <ows:BoundingBox crs="EPSG:4326">
    	<ows:LowerCorner>
    		<xsl:value-of select="$minx"/>&#160;<xsl:value-of select="$miny"/>
    	</ows:LowerCorner>
    	<ows:UpperCorner>
    		<xsl:value-of select="$maxx"/>&#160;<xsl:value-of select="$maxy"/>
   		</ows:UpperCorner>
		</ows:BoundingBox>
	  <ows:Title><xsl:value-of select="Title"/></ows:Title>
	  <ows:Abstract>
	  	<xsl:value-of select="./Abstract"/>
	  </ows:Abstract>
	  <ows:Keywords>
    	<xsl:for-each select="./KeywordList/Keyword">
    		<ows:Keyword><xsl:value-of select="."/></ows:Keyword>
    	</xsl:for-each>
		</ows:Keywords>
		<DescriptionURL format="text/html">
			<xsl:copy-of select="./OnlineResource"/>
		</DescriptionURL>
		<xsl:apply-templates select="ContactInformation">
	  </xsl:apply-templates>
  </xsl:template>
  
  <!-- ContactInformation -->
  <xsl:template match="ContactInformation">
		<ows:ServiceProvider>
			<ows:ProviderName>
				<xsl:value-of select="./ContactPersonPrimary/ContactOrganization"/>
			</ows:ProviderName>
			<ows:ProviderSite xlink:type="simple" xlink:href="http://www.ec.gc.ca/"/>
			<ows:ServiceContact>
				<ows:IndividualName>
					<xsl:value-of select="./ContactPersonPrimary/ContactPerson"/>
				</ows:IndividualName>
				<ows:PositionName>
					<xsl:value-of select="./ContactPosition"/>
				</ows:PositionName>
				<ows:ContactInfo>
					<ows:Phone>
						<ows:Voice>
							<xsl:value-of select="./ContactVoiceTelephone"/>
						</ows:Voice>
						<ows:Facsimile>
							<xsl:value-of select="./ContactFacsimileTelephone"/>
						</ows:Facsimile>
					</ows:Phone>
					<ows:Address>
						<ows:DeliveryPoint>
							<xsl:value-of select="./ContactAddress/Address"/>
						</ows:DeliveryPoint>
						<ows:City>
							<xsl:value-of select="./ContactAddress/City"/>
						</ows:City>
						<ows:AdministrativeArea>
							<xsl:value-of select="./ContactAddress/StateOrProvince"/>
						</ows:AdministrativeArea>
						<ows:PostalCode>
							<xsl:value-of select="./ContactAddress/PostCode"/>
						</ows:PostalCode>
						<ows:Country>
							<xsl:value-of select="./ContactAddress/Country"/>
						</ows:Country>
						<ows:ElectronicMailAddress>
							<xsl:value-of select="./ContactElectronicMailAddress"/>
						</ows:ElectronicMailAddress>
					</ows:Address>
					<ows:OnlineResource xlink:type="simple" xlink:href="http://www.ec.gc.ca/"/>
					<ows:HoursOfService>@TODO</ows:HoursOfService>
					<ows:ContactInstructions>@TODO</ows:ContactInstructions>
				</ows:ContactInfo>
				<ows:Role>
					<xsl:value-of select="./ContactPosition"/>
				</ows:Role>
			</ows:ServiceContact>
		</ows:ServiceProvider>
  </xsl:template>

  <!-- Layer -->
  <xsl:template match="Layer">
    <xsl:param name="version"/>
    <xsl:param name="title"/>
    <xsl:param name="url"/>
    
    <xsl:element name="Layer" namespace="http://www.opengis.net/ows-context/0.2.1">
      <xsl:attribute name="queryable">
        <xsl:value-of select="@queryable"/>
      </xsl:attribute>
      <xsl:attribute name="hidden">
        <xsl:text>0</xsl:text>
      </xsl:attribute>
      <xsl:attribute name="group">
      	<xsl:text>Layers</xsl:text>
      </xsl:attribute>
      <ows:Title><xsl:value-of select="Title"/></ows:Title>
      <ows:Abstract><xsl:value-of select="Abstract"/></ows:Abstract>
      <ows:Identifier><xsl:value-of select="Name"/></ows:Identifier>
      <xsl:for-each select="./FormatList/Format">
      	<ows:OutputFormat><xsl:value-of select="."/></ows:OutputFormat>
      </xsl:for-each>
      <ows:AvailableCRS><xsl:value-of select="SRS"/></ows:AvailableCRS>
      <xsl:element name="Server" namespace="http://www.opengis.net/context">
        <xsl:attribute name="service">
          <xsl:text>OGC:WMS</xsl:text>
        </xsl:attribute>
        <xsl:attribute name="version">
          <xsl:value-of select="$version"/>
        </xsl:attribute>
        <xsl:attribute name="title">
          <xsl:value-of select="$title"/>
        </xsl:attribute>
        <xsl:element name="OnlineResource" namespace="http://www.opengis.net/context">
          <xsl:attribute name="type">
            <xsl:text>simple</xsl:text>
          </xsl:attribute>
          <xsl:attribute name="xlink:href">
            <xsl:value-of select="$url"/>
          </xsl:attribute>
        </xsl:element>
      </xsl:element>
      <StyleList xmlns="http://www.opengis.net/context">
        <Style xmlns="http://www.opengis.net/context" current="1">
        		<xsl:copy-of select="./Style/*"/>
        </Style>
      </StyleList>
    </xsl:element>
  </xsl:template>
  
  <!-- duplicate everything with namespace prefix for WMS 1.3.x -->
  <xsl:template match="/wms:WMS_Capabilities">
    <xsl:param name="wmsVersion" select="/wms:WMS_Capabilities/@version"/>    
    <xsl:param name="wmsTitle" select="/wms:WMS_Capabilities/wms:Service/wms:Title"/>    
    <xsl:param name="wmsOnlineResource" select="/wms:WMS_Capabilities/wms:Capability/wms:Request/wms:GetMap/wms:DCPType/wms:HTTP/wms:Get/wms:OnlineResource/@xlink:href"/>    
  
    <xsl:param name="defLayers" select="wms:Capability//wms:Layer[wms:Name=$selectedLayer]"/>    
    <xsl:param name="defLayer" select="$defLayers[1]"/>
    <xsl:param name="bbox" select="//wms:BoundingBox"/> <!-- use first bbox encountered, override as a param -->
    <xsl:variable name="abstract" select="$defLayer/wms:Abstract"/>
    <xsl:variable name="title" select="$defLayer/wms:Title"/>
    <xsl:variable name="infoLink" select="$defLayer/wms:MetadataURL/wms:OnlineResource/@xlink:href"/>
    <xsl:variable name="logoLink" select="$defLayer/wms:Attribution/wms:LogoURL/wms:OnlineResource/@xlink:href"/>
    <xsl:variable name="providerName" select="wms:Service/wms:Title"/>
    <ViewContext version="1.0.0"
			    id="autoGeneratedContext_"
          xmlns="http://www.opengis.net/context">
      <LayerList>
        <xsl:choose>
        	<xsl:when test="string-length($selectedLayer)>0">
          	<xsl:apply-templates select="$defLayer">
            	<xsl:with-param name="version" select="$wmsVersion"/>
            	<xsl:with-param name="title" select="$wmsTitle"/>
            	<xsl:with-param name="url" select="$wmsOnlineResource"/>
          	</xsl:apply-templates>
        	</xsl:when>
        	<xsl:otherwise>
          	<xsl:apply-templates select="wms:Capability/wms:Layer/*">
            	<xsl:with-param name="version" select="$wmsVersion"/>
            	<xsl:with-param name="title" select="$wmsTitle"/>
            	<xsl:with-param name="url" select="$wmsOnlineResource"/>
          	</xsl:apply-templates>
        	</xsl:otherwise>
       	</xsl:choose>
     	</LayerList>
   	</ViewContext>
  </xsl:template>

  <!-- Layer -->
  <xsl:template match="wms:Layer">
    <xsl:param name="version"/>
    <xsl:param name="title"/>
    <xsl:param name="url"/>
    <xsl:element name="Layer" namespace="http://www.opengis.net/context">
      <xsl:attribute name="queryable">
        <xsl:value-of select="@queryable"/>
      </xsl:attribute>
      <xsl:attribute name="hidden">
        <xsl:text>0</xsl:text>
      </xsl:attribute>
      <xsl:element name="Server" namespace="http://www.opengis.net/context">
        <xsl:attribute name="service">
          <xsl:text>OGC:WMS</xsl:text>
        </xsl:attribute>
        <xsl:attribute name="version">
          <xsl:value-of select="$version"/>
        </xsl:attribute>
        <xsl:attribute name="title">
          <xsl:value-of select="$title"/>
        </xsl:attribute>
        <xsl:element name="OnlineResource" namespace="http://www.opengis.net/context">
          <xsl:attribute name="type">
            <xsl:text>simple</xsl:text>
          </xsl:attribute>
          <xsl:attribute name="xlink:href">
            <xsl:value-of select="$url"/>
          </xsl:attribute>
        </xsl:element>
      </xsl:element>
      <Name xmlns="http://www.opengis.net/context"><xsl:value-of select="wms:Name"/></Name>
      <Title xmlns="http://www.opengis.net/context"><xsl:value-of select="wms:Title"/></Title>
      <Abstract xmlns="http://www.opengis.net/context"><xsl:value-of select="wms:Abstract"/></Abstract>
      <FormatList xmlns="http://www.opengis.net/context">
        <Format current="1" xmlns="http://www.opengis.net/context">image/png</Format>
      </FormatList>
      <StyleList xmlns="http://www.opengis.net/context">
        <Style xmlns="http://www.opengis.net/context" current="1">
          <Name xmlns="http://www.opengis.net/context"><xsl:value-of select="$styleName"/></Name>
          <xsl:if test="wms:Style/wms:LegendURL">
          <LegendURL xmlns="http://www.opengis.net/context">
            <OnlineResource xmlns="http://www.opengis.net/context">
              <xsl:attribute name="xlink:href">
                <xsl:value-of select="wms:Style/wms:LegendURL/wms:OnlineResource/@xlink:href"/>
              </xsl:attribute>
            </OnlineResource>
          </LegendURL>
          </xsl:if>
        </Style>
      </StyleList>
      <xsl:if test="wms:Dimension[@name='time']">
        <DimensionList xmlns="http://www.opengis.net/context">
          <Dimension name="time" units="ISO8601"><xsl:value-of select="wms:Dimension[@name='time']"/></Dimension>
        </DimensionList>
      </xsl:if>
    </xsl:element>
  </xsl:template>
  
  <!-- WFS part -->
  <xsl:template match="/WFS_Capabilities">
    <xsl:param name="wmsVersion" select="@version"/>    
    <xsl:param name="wmsTitle" select="Service/Title"/>    
    <xsl:param name="wmsOnlineResource" select="Capability/Request/GetMap/DCPType/HTTP/Get/OnlineResource/@xlink:href"/>    
    <OWSContext version="1.0.0" id="ows-context" xmlns="http://www.opengis.net/ows-context/0.2.1">
    </OWSContext>
  </xsl:template>
</xsl:stylesheet>
