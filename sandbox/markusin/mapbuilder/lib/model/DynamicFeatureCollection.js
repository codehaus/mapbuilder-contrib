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
	
	// is the representation of the dynamic feature. Could be: history, track as GML standards and units as new introduced datatype 
	var dynamicFeaturePropertyNode = modelNode.selectSingleNode("mb:dynamicFeatureProperty");
	if (dynamicFeaturePropertyNode) {
	  this.dynamicFeatureProperty = dynamicFeaturePropertyNode.firstChild.nodeValue;
	} else {
	  this.dynamicFeatureProperty = "gml:history";
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
	
	switch (this.dynamicFeatureProperty) {
		case "gml:track":
			this.dynamicGeometryType = "gml:MovingObjectStatus";	
			break;
		case "gml:units":
			this.dynamicGeometryType = "gml:MovingObjectUnit";	
			break;
		default:
			this.dynamicGeometryType = "gml:TimeSlice";
			break;
	}
	
	//declare an instance
	this.locations = new Hashtable();
	this.features = new Hashtable();
	
	var minTimeInstant;
	var maxTimeInstant;
	
	this.currentTimestamp = new Date();
	
	
	this.getMinTimeInstant = function() {
    return this.minTimeInstant;
	}
	
	this.getMaxTimeInstant = function() {
		return this.maxTimeInstant;
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
		
		if(root.nodeName.toLowerCase() == "exceptionreport") {
			var errorMessage = root.firstChild.firstChild;
			if(errorMessage) {
				alert(errorMessage.firstChild.nodeValue);	
			} else {
				alert("An exception has occured. See stacktrace on server!");	
			}
		} else if(root.nodeName.toLowerCase() == "wfs:featurecollection") {
				if(root.childNodes.length > 0) {
					var featureMemberNodes = objRef.doc.selectNodes(objRef.nodeSelectXpath);
					for(var i = 0; i < featureMemberNodes.length; i++) {
						var fid = featureMemberNodes[i].getAttribute("gml:id");
						var trajectory = new Array(); // contains one or more continuousTrajectories
						var trajectoryNodes = featureMemberNodes[i].firstChild.firstChild.selectNodes(objRef.dynamicFeatureProperty);
						for(var j = 0; j < trajectoryNodes.length; j++) {
							var continuousTrajectory = new Array();					
							var instantsNodes = trajectoryNodes[j].selectNodes(objRef.dynamicGeometryType);
							for(var k = 0; k < instantsNodes.length; k++) {
								var instantNode =  instantsNodes[k];
								var id = instantNode.getAttribute("gml:id");
								// saving as date
								//var timeXML = instantNode.selectSingleNode("gml:validTime/gml:TimeInstant/gml:timePosition").firstChild.nodeValue;
								var time = setISODate(instantNode.selectSingleNode("gml:validTime/gml:TimeInstant/gml:timePosition").firstChild.nodeValue);
								var locationNode = instantNode.selectSingleNode("gml:location");
								var locationId = locationNode.getAttribute("id");
								if(locationId){
									var point = locationNode.selectSingleNode("gml:Point/gml:pos").firstChild.nodeValue.split(',');
									objRef.locations.put(locationId, point);
								} else { 
									locationId = locationNode.getAttribute("xlink:href").replace(/#/g,"");
								}
								continuousTrajectory.push(new Array(id,time,locationId));
							}
							trajectory.push(continuousTrajectory);
						}
						objRef.features.put(fid, trajectory);
					}
					delete featureMemberNodes;
				
				// setting temporal min and max values
					var boundedByNode = objRef.doc.firstChild.firstChild.selectSingleNode(objRef.boundedBy);
					if(boundedByNode) {
						var timeValues = boundedByNode.selectNodes("gml:timePosition");
						objRef.minTimeInstant = setISODate(timeValues[0].firstChild.nodeValue);
						objRef.maxTimeInstant = setISODate(timeValues[1].firstChild.nodeValue);
						//timeValues = null;
					} 
					else {
						objRef.minTimeInstant = objRef.features.getValueFromIndex(0)[0][0][1];
						var last = objRef.features.getValueFromIndex(objRef.features.size()-1);
						last = last[last.length-1];
						objRef.maxTimeInstant = last[last.length-1][1];
					}
					if(objRef.trace) {
						loadModelTime = Date.now() - loadModelTime;
						//alert("Transfer: Server -> Client: " + objRef.transferTime + "ms ** Building up the model:" + loadModelTime + "ms");
						
						var traceElement = document.createElement('trace');
						var transferTime = document.createElement("TransferTime");
						transferTime.setAttribute("unit",	"ms");
						transferTime.setAttribute("description","Time to transfer the request to the server and getting back the result");
						var transferTimeValue = document.createTextNode(objRef.transferTime);
						transferTime.appendChild(transferTimeValue);
						
						var modelInitTime = document.createElement("ModelInitTime");
						modelInitTime.setAttribute("unit","ms");
						modelInitTime.setAttribute("description","Time to generate the model structure on client side");
						var modelInitTimeValue = document.createTextNode(loadModelTime);
						modelInitTime.appendChild(modelInitTimeValue); 
						
						traceElement.appendChild(transferTime);
						traceElement.appendChild(modelInitTime);
						
						var log = (new XMLSerializer()).serializeToString(traceElement);
		        var xmlHttp = new XMLHttpRequest();
        		var sUri = objRef.traceUrl;
						xmlHttp.open(objRef.method, sUri, objRef.async);
        		xmlHttp.setRequestHeader("content-type",objRef.contentType);
          	xmlHttp.setRequestHeader("serverUrl",sUri);
						xmlHttp.send(log);
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
	 * Returns the instant of a moving object of a dynamic feature on a distinct timeInstant
	 * 
	 * @param {String} featureId the id of the dynamic feature
	 * @param {Number} the index in the trajectory
	 * @return {Object} the instant values of the specified feature or 
	 * 					null if feature not found or or instant available at that timeInstant
	 */
	this.getTrajectoryByIndex = function(featureId, index) {
		var continuousTrajectories = this.getFeatureById(featureId);
		if(continuousTrajectories){
			for(var i=0; i < continuousTrajectories.length; i++) {
				var result = continuousTrajectories[i][index];
				if(result) {
					var point = result[2];
					if(typeof(point) == "string") { // uuid is point to a location
						result[2] = this.locations.get(point);					
					}
					return result;
				}
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
			var continuousTrajectories = this.getFeatureById(featureId);
			if(continuousTrajectories){
				for(var cTIdx  in continuousTrajectories) {
					var continuousTrajectory = continuousTrajectories[cTIdx];
					for(var i=0; i <continuousTrajectory.length -1; i++) {
						if(continuousTrajectory[i][1]< dateMs && dateMs <= continuousTrajectory[i+1][1]){
							if(dateMs - continuousTrajectory[i][1] <= continuousTrajectory[i+1][1]-dateMs) {
								featureIndices.put(featureId,new Number(i));
							} else {
								featureIndices.put(featureId,new Number(i+1));
							}
							break; //quitting inner for and going to the next feature
						}
					}
				}
			}
		}
		return featureIndices;
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
   * Returns a GML geometry for the feature
   * @param featureNode the feature node to select from
   * @return the GML for the node
   */
  this.getDynamicFeatureGeometry = function(featureNode) {
    var geometryTag = featureNode.selectSingleNode(this.dynamicFeatureProperty);
    if( geometryTag != null )
      return geometryTag.firstChild;
    else {
      alert(mbGetMessage("invalidGeom", (new XMLSerializer()).serializeToString(featureNode)));
    }
  }
	
	
  /**
    * Called when the OWSContext gets loaded
    */
  this.loadWfsRequests = function(objRef) {
    //alert( "FeatureCollection loadModel:"+(new XMLSerializer()).serializeToString(objRef.containerModel.doc))
    // we need to retrieve all the features
    if( objRef.containerModel.doc != null) {
      //alert( "FeatureCollection loadModel:"+(new XMLSerializer()).serializeToString(objRef.containerModel.doc))
      var featureTypes = objRef.containerModel.doc.selectNodes("/wmc:OWSContext/wmc:ResourceList/wmc:FeatureType");
      if( featureTypes.length > 0 ) {
        for( var i=0; i<featureTypes.length; i++) {
          var httpPayload = new Object();        
        
          var wfsFeature = featureTypes[i]
          //alert( "feature:"+ (new XMLSerializer()).serializeToString(wfsFeature) )
          
          var server = wfsFeature.selectSingleNode("wmc:Server")
          //alert( "server:"+ (new XMLSerializer()).serializeToString(server) )
          var onlineResource = server.selectSingleNode("wmc:OnlineResource")
          //alert( "onlineResource:"+ (new XMLSerializer()).serializeToString(onlineResource) )
          httpPayload.method = onlineResource.getAttribute("method")
          httpPayload.url = onlineResource.getAttribute("xlink:href")
          //alert( "server:"+ httpPayload.method + " " + httpPayload.url )
          
          var query = wfsFeature.selectSingleNode("wfs:GetFeature")
          //alert( "query2:"+ (new XMLSerializer()).serializeToString( query ))
          httpPayload.postData = (new XMLSerializer()).serializeToString( query )
          
          // This does not work on IE for some reaso
          // wfsFeature.model = objRef;
          objRef.wfsFeature = wfsFeature
          objRef.newRequest(objRef,httpPayload);

          //objRef.containerModel.setParam('addLayer', wfsFeature);
          //var sld = wfsFeature.selectSingleNode("wmc:StyleList")
        }
      }
    }
  }
  
  if( this.containerModel ) this.containerModel.addListener("loadModel",this.loadWfsRequests,this);
	
	
	

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
