/*
Author:       Markus Innerebner markus.innerebnerATgmail.com
License:      LGPL as per: http://www.gnu.org/copyleft/lesser.html

$Id: DynamicFeatureRendererOL.js 3091 2007-08-09 12:21:54Z gjvoosten $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/widget/GmlRendererBase.js");

/**
 * Render dynamic feature into HTML using Openlayer
 * this.targetModel references the context model for the map
 * where the content of this widget should be rendered to.
 * 
 * 
 * If the model doc is not wfs compliant, a stylesheet
 * property has to be set for this widget. The xsl file
 * referenced in this property transforms the model doc to
 * a wfs FeatureCollection.
 * @constructor
 * @base GmlRendererBase
 * @param widgetNode  The widget's XML object node from the configuration document.
 * @param model       The model object that this widget belongs to.
 */
function DynamicFeatureRendererOL(widgetNode, model) {
  GmlRendererBase.apply(this,new Array(widgetNode, model));
  
  /** OpenLayers GML layer which renders the model doc */
  this.olLayer = null;
  
  // set the hover cursor.
  var hoverCursorNode = widgetNode.selectSingleNode("mb:hoverCursor");
  this.hoverCursor = hoverCursorNode ? hoverCursorNode.firstChild.nodeValue : "pointer";
	
  var iconURLNode = widgetNode.selectSingleNode("mb:iconURL");
  this.iconURL = iconURLNode ? iconURLNode.firstChild.nodeValue : "http://www.inf.unibz.it/dis/bz10m/images/bus.gif";
	
	var sizeNode = widgetNode.selectSingleNode('mb:iconSize');
	this.size = sizeNode ? sizeNode.firstChild.nodeValue.split(",") : new Array("10,10");
	
	var opacityNode = widgetNode.selectSingleNode("mb:iconOpacity");
	this.opacity = opacityNode ? opacityNode.firstChild.nodeValue : "0.8";
	
	this.markers = new OpenLayers.Layer.Markers("Markers", {calculateInRange: function(){return true}});
	var	iconSize = new OpenLayers.Size(this.size[0],this.size[1]);
	this.icon = new OpenLayers.Icon(this.iconURL, iconSize, new OpenLayers.Pixel(-(iconSize.w/2), -iconSize.h));
	this.allMarkers = new Hashtable(); // for each featureMember an own marker
	this.allPopups = new Hashtable(); // for each featureMember an own popup
	
	/**
	 * 
	 * @param {Object} objRef
	 */
	this.init = function(objRef){
		objRef.proj = new Proj4js.Proj("EPSG:258320");
    objRef.epsg4326 = new Proj4js.Proj("EPSG:900913");
	}
	this.model.addListener("loadModel", this.init, this );
	

	/**
	 * 
	 * @param {Object} objRef
	 */
  this.init = function(objRef) {
  	if (objRef.olLayer) {
			objRef.model.setParam('gmlRendererLayer', null);
			if (objRef.targetModel.map == objRef.map) {
        objRef.olLayer.destroy();
        objRef.olLayer = null;
      }
		}
		
		objRef.olLayer = new OpenLayers.Layer.Markers("Markers", {calculateInRange: function(){return true}});
		objRef.targetModel.map.addLayer(objRef.olLayer);
		
		var allFeatureIds = objRef.model.getAllFeatureIds();
		for(var index in allFeatureIds) {
			// workaround, setting it to that value
			var p = objRef.model.getTrajectoryByIndex(allFeatureIds[index],0)[2];
			var position = new OpenLayers.LonLat(p[0],p[1]);
			
			var marker = new OpenLayers.Marker(position, objRef.icon.clone());
			marker.setOpacity(objRef.opacity);
			objRef.olLayer.addMarker(marker);
			objRef.allMarkers.put(allFeatureIds[index],marker);
		}
		objRef.model.setParam('gmlRendererLayer', objRef.olLayer);
  }
  this.model.addListener("refresh",this.init, this);
  this.model.addListener("refreshGmlRenderers",this.init, this);
	
	/**
	 * Note: this function is not working: it will not set the moving point to the right
	 * position in case of a panning action
	 * Updates the status of a moving object
	 * 
	 * @param {Object} objRef this widget
	 * @param {String} featureId , the id of the dynamic feature to be updated
	 * @param {Object} movingObjectInstant the instant of the moving object to be updated 
	 */
	this._updateDynamicFeature = function(objRef, instant) {
		var marker = objRef.allMarkers.get(instant[0]);
		if(marker) {
			var point = instant[2];
			cs_transform(objRef.proj, objRef.epsg4326, point);
			var lonLat = new OpenLayers.LonLat(point[0],point[1]);
			marker.moveTo(objRef.targetModel.map.getPixelFromLonLat(lonLat));
		}
	}
  //this.model.addListener("updateDynamicFeature", this.updateDynamicFeature, this);
	
	/**
	 * Updates the displayable of the of a moving object
	 * @param {Object} objRef the model of that widget
	 * @param {Object} instant the instant of the moving object to be updated 
	 */
	this.updateDynamicFeature = function(objRef, instant) {
		var fId = instant[0];
		var marker = objRef.allMarkers.get(fId);
		if(marker) {
			var x = marker.display(true);			
			
			if(instant[4]) {
				var pointFrom = new OpenLayers.Geometry.Point(instant[4][0],instant[4][1]);
				var pointTo = new OpenLayers.Geometry.Point(instant[2][0],instant[2][1]);
				
				var pFrom = Proj4js.transform(objRef.proj, objRef.epsg4326, pointFrom);
				var pTo = Proj4js.transform(objRef.proj, objRef.epsg4326, pointTo);
				
				//pFrom = objRef.targetModel.map.getPixelFromLonLat(new OpenLayers.LonLat(pFrom.x,pFrom.y));
				//pTo = objRef.targetModel.map.getPixelFromLonLat(new OpenLayers.LonLat(pTo.x,pTo.y));
				var MIN_DISTANCE = 10; // TODO move into config param
				var pixFrom = objRef.targetModel.map.getPixelFromLonLat(new OpenLayers.LonLat(pFrom.x,pFrom.y));
				var pixTo = objRef.targetModel.map.getPixelFromLonLat(new OpenLayers.LonLat(pTo.x,pTo.y));
				var distance = objRef.pixelDistance(pixFrom, pixTo);
				if(distance > MIN_DISTANCE) {
					var segments = Math.round(distance / MIN_DISTANCE);
					if(segments > 1) {
						var tFrom = instant[3].getTime();
						var tTo = instant[1].getTime();
						var timeDiff =  tTo - tFrom;
						var timeSegm = timeDiff / segments;
						var currentT = 0;
						var values = new Array();
						for(var i=0; i< segments-1; i++){
							var state = new Array();
							currentT += timeSegm;
							var interpolatedPoint = objRef.interpolate(tFrom+currentT, pointFrom, tFrom, pointTo, tTo);
							//interpolatedPoint = objRef.targetModel.map.getPixelFromLonLat(new OpenLayers.LonLat(interpolatedPoint.x,interpolatedPoint.y))
//							state[0]= currentT / window.movingObjectSimulator.speedFactor;
//							state[1] = interpolatedPoint;
//							values[i]= state;
							window.setTimeout(objRef.ippaint, (timeSegm / window.movingObjectSimulator.speedFactor), objRef, marker, interpolatedPoint);
						}
						//objRef.interpolatedPaint(objRef, marker, values, 0);
						//marker.icon.url = 'http://www.inf.unibz.it/dis/bz10m/images/busRound.png';
						//window.setTimeout(objRef.paint, (timeDiff / window.movingObjectSimulator.speedFactor), objRef, marker, pTo);
						delete values;
					} else {
						marker.setUrl('http://www.inf.unibz.it/dis/bz10m/images/busRound.png');
						objRef.paint(objRef, marker, pTo);
					}
				} else {
					marker.setUrl('http://www.inf.unibz.it/dis/bz10m/images/busRound.png');
					objRef.paint(objRef, marker, pTo);
				}
			} else {
				marker.setUrl('http://www.inf.unibz.it/dis/bz10m/images/busRound.png');
				var pointTo = new OpenLayers.Geometry.Point(instant[2][0],instant[2][1]);
				var pTo = Proj4js.transform(objRef.proj, objRef.epsg4326, pointTo);
				//pTo = objRef.targetModel.map.getPixelFromLonLat(new OpenLayers.LonLat(pTo.x,pTo.y));
				objRef.paint(objRef, marker, pTo);
			}
			marker.events.register("mouseover", marker, function(evt) {
				var popup = objRef.allPopups.get(fId);
		    if (popup != null) {
					if(!popup.div) {
            popup = null;
					} else if (popup.visible()) {
						objRef.targetModel.map.removePopup(popup);
	          popup.destroy();
	          popup = null;
	        }
		    }
		    if (popup == null) {
					popup = new OpenLayers.Popup(fId, marker.lonlat, new OpenLayers.Size(200,200), "Current Feature", true);
				} 
	        var content = '<table border="1">';
					content += '<tr><td>Bus Line:</td><td>Linea 10a</td></tr>';
					content += '<tr><td>Id:</td><td>' + fId +'</td></tr>';
					content += '<tr><td>Current location:</td><td>' + marker.lonlat.lon + '<br/>' + marker.lonlat.lat + '</td></tr>';
					content += '<tr><td>Current time:</td><td>' + instant[1].toLocaleString() + '</td></tr>';
					content += '<tr><td>Current Oil consume:</td><td>5.00 ml/s</td></tr>';
					content += '</table>';
	        popup.setContentHTML(content);
	        popup.setBackgroundColor("yellow");
	        popup.setOpacity(0.9);
	        objRef.targetModel.map.addPopup(popup);
					objRef.allPopups.put(fId,popup);
				if(!popup.visible()) {
					popup.show();
				}
	    	Event.stop(evt);
			});
			marker.events.register("mouseout", marker, function(evt) {
				var popup = objRef.allPopups.get(fId);
				popup.hide();
				Event.stop(evt);		
			});
		}
	}
  this.model.addListener("updateDynamicFeature", this.updateDynamicFeature, this);
	
	/**
	 * 
	 * @param {Object} objRef objRef this widget
	 * @param {String} featureId featureId , the id of the dynamic feature to be updated
	 * @param {Object} timeInstant movingObjectInstant the instant of the moving object to be rendered 
	*/
	this.addDynamicFeature = function(objRef, featureId, movingObjectInstant) {
		// ensure that marker is not present
		var marker = objRef.allMarkers.get(featureId);
		if(marker) {
			objRef.makers.removeMarker(marker);
		}
		point = timeInstant[2];
		marker = new OpenLayers.Marker(new OpenLayers.LonLat(point[0],point[1]),busIcon.clone );
		marker.setOpacity(opacity);
		marker.events.register('dbclick', marker, function(evt) { alert(this.icon.url); Event.stop(evt); });
		markers.addMarker(marker);
		allMarkers.put(featureId, marker);
	}
	
/**
	 * hides a dynamic feature from the renderer
	 * 
	 * @param {Object} objRef objRef this widget
	 * @param {String} featureId featureId , the id of the dynamic feature to the associated marker to be hidden
	 */	
	this.hideDynamicFeature = function(objRef, featureId) {
		var marker = objRef.allMarkers.get(featureId);
		if(marker) {
			marker.display(false);
		}
	}
	this.model.addListener("hideDynamicFeature", this.hideDynamicFeature, this);
	
	
	/**
	 * Disable a dynamic feature from the renderer
	 * 
	 * @param {Object} objRef objRef this widget
	 * @param {String} featureId featureId , the id of the dynamic feature to the associated marker to be hidden
	 */	
	this.enableDynamicFeature = function(objRef, featureId) {
		var marker = objRef.allMarkers.get(featureId);
		if(marker) {
			marker.display(true);
		}
	}
	this.model.addListener("enableDynamicFeature", this.enableDynamicFeature, this);
	
	
	/**
	 * Remove a dynamic feature from the renderer
	 * 
	 * @param {Object} objRef objRef this widget
	 * @param {String} featureId featureId , the id of the dynamic feature to the associated marker to be removed
	 */	
	this.removeDynamicFeature = function(objRef, featureId) {
    // maybe I need this constructs for the listeners
		marker = allMarkers.get(featureId);
		markers.removeMarker(makers);
		allMarkers.remove(featureId);
	}
	
	this.onClick = function(objRef) {
 		var evt = objRef.model.getParam("olFeatureSelect");
		var popup = objRef.createPopup(objRef, evt, false);
 		evt.feature.layer.mbClickPopup = popup;
	}
	
	/**
	 * Linear Interpolation of 2 points;
	 * @param {Object} t the timestamp on which to interpolate
	 * @param {Object} newPoint the point where to set the interpolated value
	 * @param {Object} pFrom the start point
	 * @param {Object} tFrom the start timestamp
	 * @param {Object} pTo the end poin
	 * @param {Object} tTo the end timestamp
	 */
	this.interpolate = function(t, pFrom, tFrom, pTo, tTo) {
		return new OpenLayers.Geometry.Point(parseInt(pFrom.x) + ((t - tFrom)/(tTo - tFrom))*(parseInt(pTo.x) - parseInt(pFrom.x)), parseInt(pFrom.y) + ((t - tFrom)/(tTo - tFrom))*(parseInt(pTo.y) - parseInt(pFrom.y)));
	}
	
	/**
	 * 
	 * @param {Object} p0
	 * @param {Object} p1
	 */
	this.pixelDistance = function(pixelFrom, pixelTo) {
		var pX = pixelFrom.x - pixelTo.x;
		var pY = pixelFrom.y - pixelTo.y;
		return Math.sqrt(pX * pX + pY * pY);
	}
	
	/**
	 * 
	 * @param {Object} objRef
	 * @param {Object} marker the openlayer marker to be updated
	 * @param {Object} p the openlayer pixel object with the new values
	 */
	this.paint = function(objRef, marker, p) {
			if(p){
					marker.lonlat.lon = p.x;
					marker.lonlat.lat = p.y;
					marker.display(true);
					objRef.olLayer.drawMarker(marker);
			}
	}
	
	this.ippaint = function(objRef, marker, p) {
			marker.setUrl('http://www.inf.unibz.it/dis/bz10m/images/bus.gif');
			if(p){
					marker.lonlat.lon = p.x;
					marker.lonlat.lat = p.y;
					marker.display(true);
					objRef.olLayer.drawMarker(marker);
			}
	}
	
	
	this.interpolatedPaint = function(objRef, marker, values, step){
  	var argv = arguments;
  	if (argv) {
  		var objRef = argv[0];
  		var marker = argv[1];
  		var values = argv[2];
  		var step = argv[3];
  	}
  	if (step < values.length) {
			var st = step;
			step++;
  		marker.setUrl('http://www.inf.unibz.it/dis/bz10m/images/bus.gif');
  		objRef.paint(objRef, marker, values[st][1]);
  		window.setTimeout(objRef.interpolatedPaint, values[st][0], objRef, marker, values, st);
  	}
  	else {
  		delete values;
  	}
  }
}
