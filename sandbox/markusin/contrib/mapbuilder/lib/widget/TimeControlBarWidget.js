/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
$Id: Slider.js 3076 2007-10-05 14:28:50Z minnerebner $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/widget/WidgetBaseXSL.js");

// loading libs necessary for the slider
// TODO replace with something else, maybe scriptaculous
mapbuilder.loadScript(baseDir+"/util/blueshoes/lib/LibCrossBrowser.js");
mapbuilder.loadScript(baseDir+"/util/blueshoes/lib/EventHandler.js");
mapbuilder.loadScript(baseDir+"/util/blueshoes/core/form/Bs_FormUtil.lib.js");
mapbuilder.loadScript(baseDir+"/util/blueshoes/lcore/gfx/Bs_ColorUtil.lib.js");
mapbuilder.loadScript(baseDir+"/util/blueshoes/components/slider/Bs_Slider.class1.js");


/**
 * TimeControlBarWidget used simulating the progress of in time
 * A TimeControlBarWidget is a widget which renders the time progress
 * for the enabled state.
 * @constructor
 * @base WidgetBaseXSL
 * @author Markus Innerebner 
 * @param widgetNode The tool node from the Config XML file.
 * @param model The parent model object (optional).
 */
function TimeControlBarWidget(widgetNode, model) {
	
	WidgetBaseXSL.apply(this,new Array(widgetNode, model));
	
	var htmlTagIdNode = widgetNode.selectSingleNode("mb:htmlTagId");    
  if (htmlTagIdNode) {
    this.htmlTagId = htmlTagIdNode.firstChild.nodeValue;
  } else {
		this.htmlTagId = widgetNode.getAttribute("id");
	}
	
	var htmlTimeProgressPaneNode = widgetNode.selectSingleNode("mb:htmlTimeProgressPaneId");    
  if (htmlTimeProgressPaneNode) {
    this.htmlTimeProgressPane = htmlTimeProgressPaneNode.firstChild.nodeValue;
  }
	
  
	// Some Layout settings:
	var widthNode = widgetNode.selectSingleNode("mb:width");
  if ( widthNode ) {
    this.width = parseInt(widthNode.firstChild.nodeValue);
  } else  {
		this.width = 121;
	}
	
	var heightNode = widgetNode.selectSingleNode("mb:height");
  if ( heightNode ) {
    this.height = parseInt(heightNode.firstChild.nodeValue);
  } else  {
		this.height = 26;
	}
	
	var defaultValueNode = widgetNode.selectSingleNode("mb:defaultValue");
  if ( defaultValueNode ) {
    this.defaultValue = parseInt(defaultValueNode.firstChild.nodeValue);
  } else  {
		this.defaultValue = 1;
	}
	
	var valueIntervalNode = widgetNode.selectSingleNode("mb:valueInterval");
  if ( valueIntervalNode ) {
    this.valueInterval = parseInt(valueIntervalNode.firstChild.nodeValue);
  } else  {
		this.valueInterval = 1;
	}
	
	var intervalNumberNode = widgetNode.selectSingleNode("mb:intervalNumber");
  if ( intervalNumberNode ) {
    this.intervalNumber = parseInt(intervalNumberNode.firstChild.nodeValue);
  } else  {
		this.intervalNumber = 200;
	}
	
	var actionNode = widgetNode.selectSingleNode("mb:action");
  if ( actionNode ) {
    this.action = actionNode.firstChild.nodeValue;
  } else  {
		this.action = "Decrements the value";
	}
	
	
	this.timeEnvelopeForm = "form_" + mbIds.getId();
	this.startTimeInputField = "tStart_" + mbIds.getId();
	this.endTimeInputField = "tEnd_" + mbIds.getId();
	
	// applying stylesheet
	this.stylesheet.setParameter("timeEnvelopeForm", this.timeEnvelopeForm);
	this.stylesheet.setParameter("startTimeInputField", this.startTimeInputField);
	this.stylesheet.setParameter("endTimeInputField", this.endTimeInputField);	

	this.init = function(objRef){
  		// workaround for IE - otherwise nothing is displayed
	    //parentNode.innerHTML += ' ';
	
			objRef.progressBar = new Bs_Slider();
		  objRef.progressBar.width         = objRef.width;
		  objRef.progressBar.height        = objRef.height;
		  objRef.progressBar.minVal        = objRef.currentValue;
		  objRef.progressBar.maxVal        = objRef.intervalNumber;
		  objRef.progressBar.valueInterval = objRef.valueInterval;
			objRef.progressBar.valueDefault  = objRef.defaultValue;
		  objRef.progressBar.arrowAmount   = 0;
			objRef.progressBar.arrowKeepFiringTimeout = 500;
		  objRef.progressBar.imgDir   = baseDir + '/util/blueshoes/components/slider/img/';
		  objRef.progressBar.setBackgroundImage('img/timeSliderBackground1.gif', 'no-repeat');
		  objRef.progressBar.setSliderIcon('bob/slider.gif', 0, 0);
		  objRef.progressBar.useInputField = 0;
		  objRef.progressBar.styleValueFieldClass = 'sliderInput';
			
			objRef.progressBar.colorbar = new Object();
		  objRef.progressBar.colorbar['color']           = 'red';
		  objRef.progressBar.colorbar['height']          = 5;
		  objRef.progressBar.colorbar['widthDifference'] = -12;
		  objRef.progressBar.colorbar['offsetLeft']      = 0;
		  objRef.progressBar.colorbar['offsetTop']       = 9;
			objRef.progressBar.drawInto(objRef.htmlTimeProgressPane);
			
			objRef.progressBar.attachOnChange(function(evt) {
				if(!objRef.value || objRef.value != objRef.progressBar.getValue()) {
					objRef.value = objRef.progressBar.getValue();
					var closestTimestamp = objRef.model.getMinTimeInstant().getTime() + (objRef.difference * objRef.value);
					window.timerThread.setCurrentTime(objRef, closestTimestamp);
				} 
			});
  }
	this.model.addListener("init",this.init, this);

	/**
	 * Initializes the progress bar. The time progress bar is reset with start- and enddate
	 * @param {Object} objRef 
	 */
  this.progressBarInit = function(objRef) {
		
		objRef.progressBar.setValue(0);
		var fromDate = objRef.model.getMinTimeInstant();
		var toDate = objRef.model.getMaxTimeInstant();
		
		if (fromDate && toDate) {
			var form = document.getElementById(objRef.timeEnvelopeForm);
			if (form) {
		  	var startTimeField = form.elements[objRef.startTimeInputField];
		  	if (startTimeField) {
		  		startTimeField.value = objRef.model.getMinTimeInstant().toLocaleTimeString()
		  	}
		  	var endTimeField = form.elements[objRef.endTimeInputField];
		  	if (endTimeField) {
		  		endTimeField.value = objRef.model.getMaxTimeInstant().toLocaleTimeString()
		  	}
		  	objRef.difference = (toDate.getTime() - fromDate.getTime()) / objRef.intervalNumber;
		  	objRef.separatorDate = fromDate.getTime() + objRef.difference;
	  	}
		}	
  }
	this.model.addListener("refresh",this.progressBarInit, this);
	this.model.addListener("updatePostions", this);

	/**
	 * Update the slider, means setting the slider to the next value
	 * @param {Object} objRef
	 * @param {Object} nextValue the next value to which the slider should be set
	 */	
	this.updateTimeBar = function(objRef, currentInstant) {
		var sepMs = objRef.separatorDate;
		if(currentInstant > sepMs) {
			objRef.value = objRef.progressBar.getValue() + 1;
			objRef.progressBar.setValue(objRef.value);
			objRef.separatorDate = new Date(sepMs + objRef.difference );
		}
	}
	this.model.addListener("updateTimeBar",this.updateTimeBar, this);
	
	
	/**
 	 * 
 	 * @param {Object} objRef
 	 */	
	this.resetProgressBar = function(objRef) {
		objRef.progressBar.setValue(0);
		objRef.value = 0;
	}
	this.model.addListener("resetProgressBar",this.resetProgressBar, this);
	

	/**
 	 * 
 	 * @param {Object} objRef
 	 */	
	this.hideProgressBar = function(objRef) {
		objRef.progressBar.setDisplay(1);
	}
	this.model.callListeners("hideProgressBar",this.hideProgressBar, this);

}
