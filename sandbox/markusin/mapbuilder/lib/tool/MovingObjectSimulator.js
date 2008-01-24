/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
Dependancies: Context
$Id: MovieLoop.js 3056 2007-08-01 22:46:54Z mattdiez $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/tool/ToolBase.js");

/**
 * Controller for the visualization of moving objects.
 * Gets the value from the model and updates the content in the map.
 * 
 * @constructor
 * @base ToolBase
 * @author Markus Innerebner
 * @param toolNode The tool node from the config document for this tool
 * @param model the model object that contains this tool
 */
function MovingObjectSimulator(toolNode, model) {
  ToolBase.apply(this, new Array(toolNode, model));

	window.movingObjectSimulator = this;
	// storing all featuresId and his current index
	this.allFeatureIds = new Hashtable();
	this.currentFeatureIndex = new Hashtable();
	this.timers = new Hashtable();
	this.startDate = null;
	this.isRunning = false;
	this.timer = null;
	
  this.frameIncrement = 1;
  this.model.setParam("firstFrame", 0);
  this.timestampIndex = 0;
  
  this.frameIsLoading = false;
	

  var speedFactorNode = toolNode.selectSingleNode("mb:speedFactor");
  if (speedFactorNode) {
    this.speedFactor = speedFactorNode.firstChild.nodeValue;
  } else {
    this.speedFactor = 5; //defaulting to 5;
  }
	
	var startpointDiffNode = toolNode.selectSingleNode("mb:startPointDiff");
  if (speedFactorNode) {
    this.startpointDiff = startpointDiffNode.firstChild.nodeValue;
  } else {
    this.startpointDiff = 1; //defaulting to 5;
  }
	
	this.delayTime = this.startpointDiff * 60000 / this.speedFactor;
	
	this.init = function(objRef){
			
	}
	this.model.addListener("init", this.init, this);
	
	/**
	 * Enables the button, and makes the simulator runable
	 * @param {Object} objRef
	 */
	this.enableButtons = function(objRef){
		// removing all entries
		if(objRef.allFeatureIds.size() > 0) {
			objRef.allFeatureIds = new Hashtable();
			objRef.currentFeatureIndex = new Hashtable();
			if(objRef.isRunning) {
				for(var i=0; i < objRef.timers.size(); i++) {
					var timer = objRef.timers.get(featureId);
						if(timer){
						clearInterval(timer);
					}
				}
			}
		}
		objRef.isRunning = false;
		var featuresIds = objRef.model.getAllFeatureIds()
		for(var i=0; i < featuresIds.length; i++){
			var featureId = featuresIds[i];
			objRef.allFeatureIds.put(featureId,objRef.model.getSize(featureId));
			objRef.currentFeatureIndex.put(featureId,0);
		}
		var minTimeInstant = objRef.model.getMinTimeInstant();
		if(minTimeInstant) {
			var minInstantDate = objRef.model.getMinTimeInstant();
			minInstantDate.setMinutes(minInstantDate.getMinutes()- objRef.startpointDiff);
			objRef.startDate = minInstantDate;
			objRef.model.callListeners("updateDynamicFeature", minInstantDate);
			objRef.model.callListeners("updateTimestamp", minInstantDate);
		}
	}
	this.model.addListener("refresh",this.enableButtons, this);

  /**
   * Sets the frame to the specified index in the frame array
   * @param incrementValue how much to increment the speedfactor, if negative value the speed will be decreased
   */
  this.incrementSpeedFactor = function(incrementValue) {
		// changing only if value is still greater than 0 and smaller than 20
		var sum = parseInt(this.speedFactor) + incrementValue
		if(sum > 0 && sum < 20 ) {
			this.speedFactor = sum;
		}
  }
	
	this.changeSpeedFactor = function(val) {
		if(val) {
			this.speedFactor = val;
		}
  }


  /**
   * Resets the frame index to the firstFrame property
   * @param objRef pointer to this object
   */
  this.reset = function() {
		this.isRunning=false;
		for(var i=0; i < this.currentFeatureIndex.size(); i++) {
			var featureId = this.currentFeatureIndex.getKey(i);
			var timer = this.timers.get(featureId);
			if(timer){
				clearInterval(timer);
			}
			this.currentFeatureIndex.put(featureId,0);
			this.model.callListeners("hideDynamicFeature", featureId);
		}
		// resetting other two widgets
		this.model.callListeners("resetTimestamp");
		this.model.callListeners("resetProgressBar");
		this.timers.clear();
  }
//	this.model.addListener("refresh",this.reset,this);


  /**
   * Stops the JavaScript movie loop timer.
   */
  this.pause = function() {
		for(var i=0; i < this.timers.size(); i++) {
			var featureId = this.timers.keys[i];
			var timer = this.timers.get(featureId);
			if(timer){
				clearInterval(timer);
			}
		}
		this.isRunning = false;
  }
  
  /**
   * Stops the JavaScript movie loop timer and sets the index back to the first 
   * frame.
   */
  this.stop = function() { 
    this.reset();
  }
	
	/**
   * Starts the movie loop playing by using a JavaScript timer.
   */
  this.play = function() {
		var oneIsRunning = false;
  	if (!this.isRunning) {
			if(this.allFeatureIds.size()>0) {
				for(var i=0; i < this.allFeatureIds.size(); i++) {
					var featureId = this.allFeatureIds.keys[i];
					var featureSize = this.allFeatureIds.get(featureId);
					var step = this.currentFeatureIndex.get(featureId);
					if(step < featureSize) {
						var instant = this.model.getTrajectoryByIndex(featureId,step);
						var prevDate = null;
						var delayTime = null;
						if(step == 0) {
							prevDate = this.startDate;
						} else {
							prevDate = this.model.getTrajectoryByIndex(featureId,step-1)[1];
						}
						delayTime = (instant[1] - prevDate) / this.speedFactor;
						oneIsRunning = true;
						var timer = window.setTimeout(this.runFirst, delayTime, this, featureId, instant, step, featureSize);
						this.timers.put(featureId,timer);	
						
					}
				}
				this.isRunning = oneIsRunning;
			} else {
				alert("No dynamic feature was specified and queried");
			}
		}
  }
	
	/**
 * comment me!!
 * @param {Object} objRef
 * @param {Object} featureId
 * @param {Object} instant
 * @param {Object} step
 * @param {Object} size
 */
	this.runFirst =  function (objRef, featureId, instant, step, size) {
		var argv = arguments;
		if(argv) {
			var objRef = argv[0];
			var featureId = argv[1];
			var instant = argv[2];
			var step = argv[3];
			var size = argv[4];
			
			if(step >= size-1) {
				window.clearTimeout(objRef.timers.get(featureId));
				objRef.timers.remove(featureId);
				if(objRef.timers.size() == 0) {
					objRef.isRunning = false;
					objRef.reset(objRef);
				}
				// send even to the view, to hide remove the marker from the markers layers
				objRef.model.callListeners("hideDynamicFeature", featureId);
			} else {
				var nextInstant = objRef.model.getTrajectoryByIndex(featureId, ++step);
				var delayTime = (nextInstant[1] - instant[1]) / objRef.speedFactor;
				//workaround: find better solution
				instant[0]= featureId;
				
				objRef.model.callListeners("enableDynamicFeature", featureId);
				objRef.model.callListeners("updateDynamicFeature", instant);
				objRef.model.callListeners("updateTimestamp", instant[1]);
				objRef.model.callListeners("updateTimeBar", instant[1]);
				objRef.currentFeatureIndex.put(featureId,step);
				objRef.timers.put(featureId,window.setTimeout(objRef.run, delayTime, objRef, featureId, nextInstant, step, size));
			}
		}
	}
	
	/**
 * comment me!!
 * @param {Object} objRef
 * @param {Object} featureId
 * @param {Object} instant
 * @param {Object} step
 * @param {Object} size
 */
	this.run =  function (objRef, featureId, instant, step, size, prevInstant) {
		var argv = arguments;
		if(argv) {
			var objRef = argv[0];
			var featureId = argv[1];
			var instant = argv[2];
			var step = argv[3];
			var size = argv[4];
			
			if(step >= size-1) {
				window.clearTimeout(objRef.timers.get(featureId));
				objRef.timers.remove(featureId);
				if(objRef.timers.size() == 0) {
					objRef.isRunning = false;
					objRef.reset(objRef);
				}
				// send even to the view, to hide remove the marker from the markers layers
				objRef.model.callListeners("hideDynamicFeature", featureId);
			} else {
				//workaround: find better solution
				instant[0]= featureId;
				// for the interpolation it's important to have the value of the next
				instant[3] = prevInstant[1];
				instant[4] = prevInstant[2];
				objRef.update(objRef,instant);

				var nextInstant = objRef.model.getTrajectoryByIndex(featureId, ++step);
				var delayTime = nextInstant[1] - instant[1];
				objRef.currentFeatureIndex.put(featureId,step);
				objRef.timers.put(featureId,window.setTimeout(objRef.run, (delayTime/objRef.speedFactor), objRef, featureId, nextInstant, step, size, instant));
			}
		}
	}
	
	this.update =  function (objRef, instant) {
		objRef.model.callListeners("updateDynamicFeature", instant);
		objRef.model.callListeners("updateTimestamp", instant[1]);
		objRef.model.callListeners("updateTimeBar", instant[1]);
	}
	
	
	this.updateIndex = function(objRef, currentMs) {
		this.pause();
		var steps = objRef.model.getCurrentStepsByDate(objRef, currentMs);
		this.isRunning = true;
		for(var i=0; i < steps.size(); i++) {
			var featureId = steps.getKeyFromIndex(i);
			var featureSize = objRef.model.getSize(featureId)
			var step = steps.getValueFromIndex(i);
			var instant = objRef.model.getTrajectoryByIndex(featureId, step);
			instant[0] = featureId;
			
			if(step == 0) {
				this.model.callListeners("hideDynamicFeature", featureId);
				var delayTime = instant - currentMs;
				var timer = window.setTimeout(this.runFirst, delayTime, this, featureId, instant, step, featureSize);
				this.timers.put(featureId,timer);	
			} else {
				this.model.callListeners("enableDynamicFeature", featureId);
				this.update(objRef, instant);
				
				if(step <  featureSize) {
					var nextInstant = objRef.model.getTrajectoryByIndex(featureId, ++step);
					this.currentFeatureIndex.put(featureId,step);
					var delayTime = nextInstant[1] - instant[1]; 
				
					var prevInstant = objRef.model.getTrajectoryByIndex(featureId, step-1);
					nextInstant [3] = instant[1];
						nextInstant[4] = instant[2];
				
					this.timers.put(featureId,window.setTimeout(this.run, (delayTime/this.speedFactor), this, featureId, nextInstant, step, featureSize, instant));
				} else {
					this.model.callListeners("hideDynamicFeature", featureId);
					window.clearTimeout(this.timers.get(featureId));
					this.timers.remove(featureId);
				}
			}
		}
//			objRef.model.callListeners("updateIndex", currentMs);
	}
}
