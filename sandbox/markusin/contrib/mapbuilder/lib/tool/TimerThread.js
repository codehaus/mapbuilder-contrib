/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
Dependancies: Context
$Id: TimerThread.js 3782 2007-12-22 12:16:45Z markusin $
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
	
	// workaround to be able to invoke the command
	window.timerThread = this;
	
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
		objRef.currentTime = startTime.getTime();
		objRef.endTime = objRef.model.getMaxTimeInstant().getTime();
		objRef.dynamicFeatureIds = objRef.model.getAllFeatureIds();
		
    objRef.run(objRef, objRef.delay);
  }
	this.model.addListener("loadModel",this.init, this);
	
	/**
	 * 
	 * @param {Object} objRef
	 * @param {Object} newTimestamp
	 */
	this.setCurrentTime = function(objRef, newTimestamp){
  	this.currentTime = newTimestamp;
  }
	/**
	 * 
	 * @param {Object} objRef
	 * @param {Object} timestamp
	 */
	this.run = function(objRef, delay){
		var argv = arguments;
		if(argv) {
			var objRef = argv[0];
			var delay = argv[1];
			objRef.currentTime += delay;
			if(objRef.currentTime >= objRef.endTime) {
				clearInterval(objRef.timer);
			} else { 
				objRef.notify(objRef, objRef.currentTime); // notify all listeners
				this.timer = setTimeout(objRef.run, delay, objRef, delay);
			}
		}	
  }
	
	/**
	 * 
	 * @param {Object} objRef
	 * @param {Object} timestamp
	 */
	this.notify =  function (objRef, tStamp) {
		for(var i = 0; i < objRef.dynamicFeatureIds.length; i++) {
			var fId = objRef.dynamicFeatureIds[i];
			var coordinate = objRef.model.getCoordinate(objRef.model, fId, tStamp);
			objRef.model.callListeners("updateDynamicFeature", new Array(fId, coordinate));
		}
//		objRef.model.callListeners("updateDynamicFeature", tStamp);
		objRef.model.callListeners("updateTimestamp", tStamp);
		objRef.model.callListeners("updateTimeBar", tStamp);
	}
	
  
}
