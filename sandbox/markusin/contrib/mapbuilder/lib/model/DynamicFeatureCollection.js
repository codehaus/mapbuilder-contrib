/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
$Id: FeatureCollection.js 2956 2007-07-09 12:17:52Z steven $
*/
//mapbuilder.loadScript(baseDir+"/graphics/WfsQueryLayer.js");

/**
 * Stores a GML DynamicFeature or DynamicFeatureCollection as defined by the
 * Open GIS Conortium http://opengis.org.
 *
 * @constructor
 * @base ModelBase
 * @author Markus Innerebner
 * @requires Sarissa
 * @param modelNode The model's XML object node from the configuration document.
 * @param parent    The parent model for the object.
  */
function DynamicFeatureCollection(modelNode, parent) {
  // Inherit the ModelBase functions and parameters
  ModelBase.apply(this, new Array(modelNode, parent));
	
	
	// properties fetched from the xml file
  var nodeSelectXpathNode = modelNode.selectSingleNode("mb:nodeSelectXpath");
  if( nodeSelectXpathNode ) {
    this.nodeSelectXpath = nodeSelectXpathNode.firstChild.nodeValue;
  } else {
		this.nodeSelectXpath = "//gml:featureMember";
	}
	
	// is the representation of the dynamic feature. Can be: TimeSlice, MovingObjectStatus or MovingObjectUnit 
	var dynamicPropertyTypeNode = modelNode.selectSingleNode("mb:dynamicPropertyType");
	if (dynamicPropertyTypeNode) {
	  this.dynamicPropertyType = dynamicPropertyTypeNode.firstChild.nodeValue;
	} else {
	  this.dynamicPropertyType = "gml:MovingObjectUnit";
	}
	
	var boundedByNode = modelNode.selectSingleNode("mb:boundedBy");
	if (boundedByNode) {
	  this.boundedBy = boundedByNode.firstChild.nodeValue;
	} else {
	  this.boundedBy = "gml:EnvelopWithTimePeriod";
	}
	
	var traceNode = modelNode.selectSingleNode("mb:trace");
	if (traceNode) {
	  this.traceUrl = traceNode.selectSingleNode("mb:url");
		if(this.traceUrl) {
			this.traceUrl = this.traceUrl.firstChild.nodeValue;
		}
	}
	
	//declare an instance
	this.locations = new Hashtable();
	this.features = new Hashtable();
	this.unitBuffer = new Hashtable();
	
	var minTimeInstant;
	var maxTimeInstant;
	
	this.currentTimestamp = new Date();
	
	
	this.getMinTimeInstant = function() {
    return this.minTimeInstant;
	}
	
	this.getMaxTimeInstant = function() {
		return this.maxTimeInstant;
	}
	
	/**
	 * 
	 */
	this.getEnvelopWithTimePeriod = function() {
		return new Array(getMinTimeInstant(), getMaxTimeInstant());
	}
	
	this.init = function(objRef) {
		if(modelNode.selectSingleNode("mb:trace")) {
			objRef.parentModel.trace = true;
		}
	}
	this.addListener("init",this.init, this);
	
	 /**
   * Fills the model with trajectory data from the xml file.
   * Note: in my case I am not reading the data from the xml document, but for performance reason
   * I will create my structure
   * TODO : ggain on performance here!!! 
   * @param objRef the class itself
   */
  this.buildStructure = function(objRef) {
		if(objRef.trace){
			var loadModelTime = Date.now();
		}
		var root = objRef.doc.firstChild; 
		
		if (root.nodeName.toLowerCase() == "exceptionreport") {
			var errorMessage = root.firstChild.firstChild;
				if (errorMessage) {
					alert(errorMessage.firstChild.nodeValue);
				} else {
				alert("An exception has occured. See stacktrace on server!");
			}
		} else if (root.nodeName.toLowerCase() == "wfs:featurecollection") {
			if (root.childNodes.length > 0) {
				var featureMemberNodes = objRef.doc.selectNodes(objRef.nodeSelectXpath);
				for (var i = 0; i < featureMemberNodes.length; i++) {
					var prefix = featureMemberNodes[i].prefix;
					//var fid = featureMemberNodes[i].getAttribute((prefix) ? prefix+"id" : "id");
					var fid = featureMemberNodes[i].getAttribute("id");
					var trajectory = new Array(); // contains one or more continuousTrajectories
					// there should only be one, defined in the grammar 
					var dynamicProperty = featureMemberNodes[i].firstChild.selectSingleNode("gml:history");
					//contains the sequence of the states or intervals of the moving entity
					var dynamicComponents = dynamicProperty.selectNodes(objRef.dynamicPropertyType);
					for (var j = 0; j < dynamicComponents.length; j++) {
						var dynamicComponent = dynamicComponents[j];
						//var id = dynamicComponent.getAttribute((prefix) ? prefix+"id" : "id");
						var id = dynamicComponent.getAttribute("id");
						// here I have to distinguish now!!
						var fromTime = setISODate(dynamicComponent.selectSingleNode("gml:validTime/gml:TimePeriod/gml:beginPosition").firstChild.nodeValue);
						var toTime = setISODate(dynamicComponent.selectSingleNode("gml:validTime/gml:TimePeriod/gml:endPosition").firstChild.nodeValue);
						var timePeriod = new Array(fromTime, toTime);
						var locationNode = dynamicComponent.selectSingleNode("gml:location");
						//var locationId = locationNode.getAttribute((prefix) ? prefix+"id" : "id");
						var locationId = locationNode.getAttribute("id");
						if (locationId) {
							var locations = locationNode.selectNodes("gml:Point/gml:pos");
							var fromPoint = locations[0].firstChild.nodeValue.split(' ');
							var toPoint = locations[1].firstChild.nodeValue.split(' ');
							// indexing location
							objRef.locations.put(locationId, new Array(fromPoint, toPoint));
						}
						else {
							locationId = locationNode.getAttribute("xlink:href").replace(/#/g, "");
						}
						trajectory.push(new Array(timePeriod, locationId));
						if (j == 0) {
							objRef.unitBuffer.put(fid, new Array(timePeriod, objRef.locations.get(locationId)));
						}
						// TODO remove??
						objRef.features.put(fid, trajectory);
					}
					
					// setting temporal min and max values
					var boundedByNode = objRef.doc.firstChild.firstChild.selectSingleNode(objRef.boundedBy);
					if (boundedByNode) {
						var timeValues = boundedByNode.selectNodes("gml:timePosition");
						objRef.minTimeInstant = setISODate(timeValues[0].firstChild.nodeValue);
						objRef.maxTimeInstant = setISODate(timeValues[1].firstChild.nodeValue);
					//timeValues = null;
					}
					else {
						objRef.minTimeInstant = objRef.features.getValueFromIndex(0)[0][0][1];
						var last = objRef.features.getValueFromIndex(objRef.features.size() - 1);
						last = last[last.length - 1];
						objRef.maxTimeInstant = last[last.length - 1][1];
					}
					if (objRef.trace) {
						loadModelTime = Date.now() - loadModelTime;
						//alert("Transfer: Server -> Client: " + objRef.transferTime + "ms ** Building up the model:" + loadModelTime + "ms");
						
						var traceElement = document.createElement('trace');
						var transferTime = document.createElement("TransferTime");
						transferTime.setAttribute("unit", "ms");
						transferTime.setAttribute("description", "Time to transfer the request to the server and getting back the result");
						var transferTimeValue = document.createTextNode(objRef.transferTime);
						transferTime.appendChild(transferTimeValue);
						
						var modelInitTime = document.createElement("ModelInitTime");
						modelInitTime.setAttribute("unit", "ms");
						modelInitTime.setAttribute("description", "Time to generate the model structure on client side");
						var modelInitTimeValue = document.createTextNode(loadModelTime);
						modelInitTime.appendChild(modelInitTimeValue);
						
						traceElement.appendChild(transferTime);
						traceElement.appendChild(modelInitTime);
						
						var log = (new XMLSerializer()).serializeToString(traceElement);
						var xmlHttp = new XMLHttpRequest();
						var sUri = objRef.traceUrl;
						xmlHttp.open(objRef.method, sUri, objRef.async);
						xmlHttp.setRequestHeader("content-type", objRef.contentType);
						xmlHttp.setRequestHeader("serverUrl", sUri);
						xmlHttp.send(log);
					}
				}
			}
		}
  }
	this.addFirstListener("loadModel", this.buildStructure, this);

	/**
	 * 
	 * @param {String} featureId of the feature member
	 * return the trajectory of the specified feature member
	 */
	this.getFeatureById = function(featureId) {
		return this.features.get(featureId);
	}
	
	/**
	 * return all trajectories. Expensive method! Use it with caution
	 */
	this.getAllFeatures = function() {
		return this.features;
	}
	
	/**
	 * return all feature ids of the model
 	 */
	this.getAllFeatureIds = function() {
		return this.features.getKeys();
	}
	
	
	/**
	 * 
	 * @param {Object} featureId
	 */
	this.getTrajectory = function(featureId) {
		return this.features.get(featureId);
	}
	
	/**
 	 * 
 	 * @param {Object} featureId
 	*/
	this.first = function(featureId) {
		var dynamicProperty = this.getFeatureById(featureId);
		if(dynamicProperty){
			return dynamicProperty[0];
		}
		return null;
	}
	
	
		/**
	 * Returns the instant of a moving object of a dynamic feature on a distinct timeInstant
	 * 
	 * @param {String} featureId the id of the dynamic feature
	 * @param {Number} the index in the trajectory
	 * @return {Object} the instant values of the specified feature or 
	 * 					null if feature not found or or instant available at that timeInstant
	 */
	this.getTrajectoryByIndex = function(featureId, index) {
		var dynamicProperty = this.getFeatureById(featureId);
		if(dynamicProperty){
			var result = dynamicProperty[index];
			if(result) {
				var point = result[2];
				if(typeof(point) == "string") { // uuid is point to a location
					result[2] = this.locations.get(point);					
				}
				return result;
			}
		}
		return null;
	}
	
	/**
	 * 
	 * @param {Object} objRef the model
	 * @param {Object} dateMs the milliseconds to which find the closest instant
	 * @return {Hashtable} with all features and the closest index to the specified value
	 */
	this.getCurrentStepsByDate = function(objRef, dateMs) {
		var featureIndices = new Hashtable();
		for(var idx in objRef.model.features.getKeys()) {
			var featureId = objRef.model.features.getKeyFromIndex(idx);
			var dynamicProperty = this.getFeatureById(featureId);
			if(dynamicProperty){
				for(var i=0; i <dynamicProperty.length -1; i++) {
					if(dynamicProperty[i][1]< dateMs && dateMs <= dynamicProperty[i+1][1]){
						if(dateMs - continuousTrajectory[i][1] <= dynamicProperty[i+1][1]-dateMs) {
							featureIndices.put(featureId,new Number(i));
						} else {
							featureIndices.put(featureId,new Number(i+1));
						}
						break; //quitting inner for and going to the next feature
					}
				}
			}
		}
		return featureIndices;
	}
	
	/**
	 * 
	 * @param {Object} objRef
	 * @param {Object} fId
	 * @param {Object} instant
	 */
	this.getUnitByInstant = function(objRef, fId, instant){
  	var dynamicProperty = this.getFeatureById(fId);
		if(dynamicProperty){
			for(var i=0; i <dynamicProperty.length -1; i++) {
				var unit = dynamicProperty[i];
				if (unit[0][0].getTime() <= instant && instant <= unit[0][1].getTime()) {
					if(typeof(unit[1]) == "string") { // uuid is point to a location
						unit[1] = this.locations.get(unit[1]);					
					}
					return unit;
				}
			}
		}
		return null;
	}
	
	/**
	 * 
	 * @param {Object} objRef
	 * @param {Object} fId
	 * @param {Object} timestamp
	 */
	this.getCoordinate = function(objRef, fId, instant) {
		var buffer = this.unitBuffer.get(fId);
		var point;
		if (buffer[0][0].getTime() <= instant && instant <= buffer[0][1].getTime()) { //candidate, so interpolate
			var pFrom = buffer[1][0];
			var pTo = buffer[1][1];
			var tFrom = buffer[0][0];
			var tTo = buffer[0][1];
		
			var x = parseInt(pFrom[0]) + ((instant - tFrom) / (tTo - tFrom)) * (parseInt(pTo[0]) - parseInt(pFrom[0]));
			var y = parseInt(pFrom[1]) + ((instant - tFrom) / (tTo - tFrom)) * (parseInt(pTo[1]) - parseInt(pFrom[1]));
			point = new OpenLayers.Geometry.Point(x, y);
		} else {
			var unit = this.getUnitByInstant(objRef, fId, instant);
			if (!unit) {
	  		return null;
			} else {
				var pFrom = unit[1][0];
				var pTo = unit[1][1];
				var tFrom = unit[0][0];
				var tTo = unit[0][1];
				
				var x = parseInt(pFrom[0]) + ((instant - tFrom) / (tTo - tFrom)) * (parseInt(pTo[0]) - parseInt(pFrom[0]));
				var y = parseInt(pFrom[1]) + ((instant - tFrom) / (tTo - tFrom)) * (parseInt(pTo[1]) - parseInt(pFrom[1]));
				point = new OpenLayers.Geometry.Point(x, y);
			}
		}
		return point;
	}
	
	/**
	 * 
	 * @param {Object} featureId
	 * @return {Number} the size of instants
	 */
	this.getSize = function(featureId) {
		var continuousTrajectories = this.getFeatureById(featureId);
		if(continuousTrajectories){
			var size = 0;
			for(var i=0; i < continuousTrajectories.length; i++) {
				size += continuousTrajectories[i].length;
			}
			return size;
		}
		return -1;
	}
	
	// TODO register as listener???

  /**
   * Returns the list of nodes selected by the nodeSelectpath.  These nodes
   * will be the individual feature members from the collection.
   * @return list of nodes selected 
   */
  this.getFeatureNodes = function() {
    return this.doc.selectNodes(this.nodeSelectXpath);
  }

  /**
   * Returns a label for a node in the feature list
   * @param featureNode the feature node to selectfrom
   * @return a label for this feature
   */
  this.getFeatureName = function(featureNode) {
    var labelNode = featureNode.selectSingleNode(this.featureTagName);   //TBD: set this dynamically
    return labelNode?labelNode.firstChild.nodeValue:mbGetMessage("noRssTitle");
  }

  /**
   * Returns an ID value for a node in the feature list
   * @param featureNode the feature node to selectfrom
   * @return ID for this feature
   */
  this.getFeatureId = function(featureNode) {
    return featureNode.getAttribute("fid")?featureNode.getAttribute("fid"):"no_id";
  }
	
	

  /**
   * Change a feature's visibility.
   * @param featureName The name of the feature to set the hidden value for
   * @param hidden, 1=hidden, 0=not hidden.
   */
  this.setHidden=function(featureName, hidden){
    this.hidden = hidden;
    this.callListeners("hidden", featureName);
  }

  /**
   * Geta feature's visibility.
   * @param featureName The name of the feature to set the hidden value for
   * @return hidden value, true=hidden, false=not hidden.
   */
  this.getHidden=function(layerName){
    return this.hidden;
  }
  this.hidden = false;
	
	this.deallocateModel=function(objRef){
		delete objRef.doc;
		objRef.features.clear();
		objRef.locations.clear();
  }
	this.addFirstListener("deallocateModel",this.deallocateModel,this);
}
