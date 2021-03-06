/*
Author: imke doerge AT geodan.nl
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
$Id: Measurement.js 3821 2008-02-01 13:58:30Z ahocevar $
*/

// Ensure this object's dependencies are loaded.
mapbuilder.loadScript(baseDir+"/widget/EditButtonBase.js");


/**
 * When this button is selected, clicks on the MapPane will add a
 * new point to a line and the total distance of the line will be calculated
 * @constructor
 * @base EditButtonBase
 * @author Imke Doerge AT geodan.nl
 * @param widgetNode The widget from the Config XML file.
 * @param model  The parent model for this  widget.
 */
function Measurement(widgetNode, model) {
  EditButtonBase.apply(this, new Array(widgetNode, model));

  /**
   * Interactive EditLine control.
   * @param objRef reference to this object.
   * @return {OpenLayers.Control} class of the OL control.
   */
  this.createControl = function(objRef) {
    var Control = OpenLayers.Class(OpenLayers.Control.DrawFeature, {
      // this is needed because all editing tools are of type
      // OpenLayers.Control.DrawFeature
      CLASS_NAME: 'mbMeasurement'
    });
    return Control;
  }
  
  this.instantiateControl = function(objRef, Control) {
     var control = new Control(objRef.featureLayer, OpenLayers.Handler.Path,
          {callbacks: {point: objRef.startAction}});
    control.objRef = objRef;
    control.activate = function() {
      Control.prototype.activate.apply(this, arguments);
      objRef.targetModel.setParam('showDistance', 0);
    }
    control.deactivate = function() {
      Control.prototype.deactivate.apply(this, arguments);
      objRef.targetModel.setParam('showDistance', null);
    }
    return control;
  }
  
  // override default cursor by user
  // cursor can be changed by specifying a new cursor in config file
  this.cursor = "crosshair";	
        
  var totalDistance=0;
  var distance = 0;
  var state = false;
  var restart = false;
  
  this.startAction = function(pointGeometry) {
    var objRef = this.objRef;
    objRef.pointGeometry = pointGeometry;
    if (!objRef.targetModel.doc) {
      objRef.targetModel.addListener("loadModel", objRef.doAction, objRef);
      config.loadModel(objRef.targetModel.id, objRef.defaultModelUrl);
    } else {
      objRef.doAction(objRef);
    }
  }
  /**
   * Append a point to a line and calculate the distance between all
   * points on the line. This will be called by the OpenLayers control
   * for this widget in the context of the control.
   * @param pointGeometry OpenLayers Geometry of the point to add
   */
  this.doAction = function(objRef) {
    pointGeometry = objRef.pointGeometry;
    objRef.targetModel.removeListener("loadModel", objRef.doAction, objRef);
    if (objRef.enabled) {
		  if(objRef.restart) {
        objRef.model.setParam("clearMeasurementLine");
			  objRef.restart= false;
			}
      var point=[pointGeometry.x, pointGeometry.y];
      var old=objRef.targetModel.getXpathValue(objRef.targetModel,objRef.featureXpath);
      if(!old) old="";
        sucess=objRef.targetModel.setXpathValue(objRef.targetModel,objRef.featureXpath,old+" "+point[0]+","+point[1]);
      if(!sucess) {
        alert(mbGetMessage("invalidFeatureXpathMeasurement", objRef.featureXpath));
      }
			
      var lineCoords = objRef.targetModel.getXpathValue(objRef.targetModel, objRef.featureXpath);
      var coordArray = lineCoords.split(" ");
      if (coordArray.length >= 3) {
        var point_P = coordArray[coordArray.length-2];
        var point_Q = coordArray[coordArray.length-1];
            
        //Split point in x and y coordinate
        var P =point_P.split(",");
        var Q =point_Q.split(",");
              
        //transform coordinates from lat/lon to x/y in meter 
        objRef.srs = srs.toUpperCase();
        objRef.proj = new OpenLayers.Projection(objRef.srs);
        
        if (!P || !Q  ){
          alert(mbGetMessage("projectionNotSupported"));
        }
        else {
          //If projection is in meters use simple pythagoras
          if(objRef.proj.getUnits() == "meters" || objRef.proj.getUnits() == "m") {
            Xp=parseFloat(P[0]);
            Yp=parseFloat(P[1]);
            Xq=parseFloat(Q[0]);
            Yq=parseFloat(Q[1]);
            // calculate the distance between these two points via Pythagoras' theorem  
            distance=Math.sqrt(((Xp-Xq)*(Xp-Xq))+((Yp-Yq)*(Yp-Yq)))
			      if(distance==0) {
              objRef.restart = true;
              objRef.model.setParam("clearMouseLine");objRef.targetModel.setParam("mouseRenderer", false);
		    		return;
				  	}
            totalDistance = Math.round(totalDistance + distance);
          }
          //If projection is in degrees use great circle formulae 
          //http://williams.best.vwh.net/avform.htm#GCF
          else if(objRef.proj.getUnits() == "degrees" || objRef.proj.getUnits() == null) {
            var deg2rad = Math.PI / 180.0
            var centerOfEarth=new Array(0,0);
            LonpRad=parseFloat(P[0]) * deg2rad;
            LatpRad=parseFloat(P[1]) * deg2rad;
            LonqRad=parseFloat(Q[0]) * deg2rad;
            LatqRad=parseFloat(Q[1]) * deg2rad;
            
            if((LonpRad>0 && LonqRad<0) || (LonpRad<0 && LonqRad>0)){
	            if(LonpRad<0){
	           	 	radDistance=Math.acos(Math.sin(LatpRad)*Math.sin(LatqRad)+Math.cos(LatpRad)*Math.cos(LatqRad)*Math.cos(LonpRad));
	            	radDistance+=Math.acos(Math.sin(LatpRad)*Math.sin(LatqRad)+Math.cos(LatpRad)*Math.cos(LatqRad)*Math.cos(LonqRad));
	            }
	            if(LonqRad<0){
	            	radDistance=Math.acos(Math.sin(LatpRad)*Math.sin(LatqRad)+Math.cos(LatpRad)*Math.cos(LatqRad)*Math.cos(LonqRad));
	            	radDistance+=Math.acos(Math.sin(LatpRad)*Math.sin(LatqRad)+Math.cos(LatpRad)*Math.cos(LatqRad)*Math.cos(LonpRad));
	            }
             }
             else{
             
            	radDistance=Math.acos(Math.sin(LatpRad)*Math.sin(LatqRad)+Math.cos(LatpRad)*Math.cos(LatqRad)*Math.cos(LonpRad-LonqRad));
            
            }
            //radDistance=Math.acos(Math.sin(Latp)*Math.sin(Latq)+Math.cos(Latp)*Math.cos(Latq)*Math.cos(Lonp-Lonq));
            distance =radDistance * 6378137;
            if(distance==0) {
              objRef.restart = true;
              objRef.model.setParam("clearMouseLine");objRef.targetModel.setParam("mouseRenderer", false);
            return;
            }
            totalDistance = Math.round(totalDistance + distance);
          }
          else alert(mbGetMessage("cantCalculateDistance"));
        }
      }    
      objRef.targetModel.setParam("showDistance", totalDistance); // set parameter for the distance output
    }
  }
  
  /**
   * This will be called as defined in EditButtonBase.js. It is called
   * when measurement is finished (ie. when user double-clicks on the map)
   * @param objRef reference to this widget
   * @param feature complete measurement path - currently unused.
   */
  this.setFeature = function(objRef, feature) {
    objRef.restart = true;
  }
    
  this.clearMeasurementLine = function(objRef){
    if (totalDistance !=0) {
      totalDistance=0;
      sucess=objRef.targetModel.setXpathValue(objRef.targetModel,objRef.featureXpath,"");
      if(!sucess){
        alert(mbGetMessage("invalidFeatureXpathMeasurement", objRef.featureXpath));
      }
      objRef.targetModel.setParam("refresh");
    }
  }
  //add a Listener to the model
	this.model.addListener("clearMeasurementLine", this.clearMeasurementLine, this);

}
