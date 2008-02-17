/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
Dependancies: Context
$Id: MovieLoop.js 3782 2007-12-22 12:16:45Z ahocevar $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/tool/ToolBase.js");

/**
 * Controller for a movie loop.  Set framesPerSec to control the frame rate 
 * and frameIncrement (+n/-n) to control the steps through the loop (n is number
 * of frames to increment.
 * @constructor
 * @base ToolBase
 * @author Adair
 * @param toolNode The tool node from the config document for this tool
 * @param model  the model object that contains this tool
 */
function TimerThread(toolNode, model) {
  ToolBase.apply(this, new Array(toolNode, model));
	
	 //set the interval
  var seconds = toolNode.selectSingleNode("mb:every");
  if (seconds) {
    this.delay = 1000*seconds.firstChild.nodeValue;
  } else {
    this.delay = 1000; //milliseconds - defaults to every second
  }
	
	this.init = function(objRef) {
    clearInterval(objRef.interval);
		
		var startTime = objRef.model.getMinTimeInstant();
		var endTime = objRef.model.getMaxTimeInstant();
		
		var featuresIds = objRef.model.getAllFeatureIds();
		objRef.features = new Hashtable();
		for (var i = 0; i < featuresIds.size(); i++) {
			objRef.model.callListeners("enableDynamicFeature", featureId[i], timestamp);
			var unit = objRef.model.first(featureId[i]);
			objRef.features.put(featureId[i], unit);
		}
		
  	//alert("about to set timer for "+this.delay+" millisecs: "+workString); 
    this.interval = setInterval(run,objRef, timestamp);
  }
	this.model.addListener("loadModel",this.init, this);
	
	/**
	 * 
	 * @param {Object} objRef
	 * @param {Object} timestamp
	 */
	this.run = function(objRef, timestamp, delay){
		var argv = arguments;
		if(argv) {
			var objRef = argv[0];
			var timestamp = argv[1];
			var delay = argv[2];
  		timestamp += delay; 
			if(timestamp>=objRef.endTime) {
				clearInterval(objRef.timer);
			// notify listeners
			} else {
				for (var i = 0; i < objRef.allFeatureIds.size(); i++) {
					
				}
				this.timer = setTimeout(run, objRef, timestamp, delay);
			}
		}	
			// notify all listeners
		}
  }
	
	this.notify =  function (objRef, timestamp) {
		objRef.model.callListeners("updateDynamicFeature", timestamp);
		objRef.model.callListeners("updateTimestamp", timestamp);
		objRef.model.callListeners("updateTimeBar", timestamp);
	}
	
	
	
  
}
