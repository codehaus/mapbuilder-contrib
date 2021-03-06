/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
Dependancies: Context
$Id: WfsGetFeature.js 3703 2007-12-10 00:48:43Z rdewit $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/widget/ButtonBase.js");
mapbuilder.loadScript(baseDir+"/util/openlayers/OpenLayers.js");
/**
 * Builds then sends a WFS GetFeature GET request based on the WMC
 * coordinates and click point.
 * @constructor
 * @base ButtonBase
 * @author Cameron Shorter
 * @param widgetNode The XML node in the Config file referencing this object.
 * @param model The Context object which this tool is associated with.
 */
function WfsGetFeature(widgetNode, model) {
  // Extend ButtonBase
  ButtonBase.apply(this, new Array(widgetNode, model));

  this.widgetNode = widgetNode;
  // id of the transactionResponseModel
  this.trm = widgetNode.selectSingleNode("mb:transactionResponseModel").firstChild.nodeValue
  this.httpPayload = new Object({
    method: "get",
    postData: null
  });
  var typeNameNode = widgetNode.selectSingleNode('mb:typeName');
  if (typeNameNode != null) {
    this.typeName = typeNameNode.firstChild.nodeValue;
  }
  this.maxFeatures = widgetNode.selectSingleNode('mb:maxFeatures');
  this.maxFeatures = this.maxFeatures ? this.maxFeatures.firstChild.nodeValue : 1;
  this.webServiceUrl= widgetNode.selectSingleNode('mb:webServiceUrl').firstChild.nodeValue;
  this.webServiceUrl += this.webServiceUrl.indexOf("?") > -1 ? '&' : '?';
  
  // override default cursor by user
  // cursor can be changed by spefying a new cursor in config file
  this.cursor = "pointer"; 

  this.createControl = function(objRef) {
  	var transactionResponseModel = config.objects[objRef.trm];
  	
    var Control = OpenLayers.Class( OpenLayers.Control, {
      CLASS_NAME: 'mbControl.WfsGetFeature',
      type: OpenLayers.Control.TYPE_TOOL, // constant from OpenLayers.Control
  	  tolerance: new Number(objRef.widgetNode.selectSingleNode('mb:tolerance').firstChild.nodeValue),
  	  httpPayload: objRef.httpPayload,
  	  maxFeatures: objRef.maxFeatures,
  	  webServiceUrl: objRef.webServiceUrl,
  	  transactionResponseModel: transactionResponseModel,
  	  
      draw: function() {
        this.handler = new OpenLayers.Handler.Box( this,
          {done: this.selectBox}, {keyMask: this.keyMask} );
      },
      
      selectBox: function (position) {
        var bounds, minXY, maxXY;
        if (position instanceof OpenLayers.Bounds) {
        // it's a box
          minXY = this.map.getLonLatFromPixel(
            new OpenLayers.Pixel(position.left, position.bottom));
          maxXY = this.map.getLonLatFromPixel(
            new OpenLayers.Pixel(position.right, position.top));
        } else {
        // it's a pixel
          minXY = this.map.getLonLatFromPixel(
            new OpenLayers.Pixel(position.x-this.tolerance, position.y+this.tolerance));
          maxXY = this.map.getLonLatFromPixel(
            new OpenLayers.Pixel(position.x+this.tolerance, position.y-this.tolerance));
        }
        bounds = new OpenLayers.Bounds(minXY.lon, minXY.lat, maxXY.lon, maxXY.lat);

      var typeName = objRef.typeName;

      if (!typeName) {
        var queryList=objRef.targetModel.getQueryableLayers();
        if (queryList.length==0) {
          alert(mbGetMessage("noQueryableLayers"));
          return;
        }
        else {
          typeName = "";
          for (var i=0; i<queryList.length; ++i) {
            var layerNode = queryList[i];
            
            // Get the name of the layer
            var layerName = layerNode.selectSingleNode("wmc:Name");layerName=(layerName)?layerName.firstChild.nodeValue:"";

            // Get the layerId. Fallback to layerName if non-existent
            var layerId = layerNode.getAttribute("id") || layerName;

            var hidden = objRef.targetModel.getHidden(layerId);
            if (hidden == 0) { //query only visible layers
              if (typeName != "") {
                typeName += ",";
              }
              typeName += layerName;
            }
          }
        }
      }

      if (typeName=="") {
        alert(mbGetMessage("noQueryableLayersVisible"));
        return;
      }

        // now create request url
        this.httpPayload.url = this.webServiceUrl+OpenLayers.Util.getParameterString({
          SERVICE: "WFS",
          VERSION: "1.0.0",
          REQUEST: "GetFeature",
          TYPENAME: typeName,
          MAXFEATURES: this.maxFeatures,
          BBOX: bounds.toBBOX()
        });
        this.transactionResponseModel.newRequest(this.transactionResponseModel, this.httpPayload);
      }
    });
    return Control;
  }
}
