/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
$Id: Slider.js 3076 2007-10-05 14:28:50Z minnerebner $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/util/Util.js");
mapbuilder.loadScript(baseDir+"/widget/WidgetBase.js");

// loading libs necessary for the slider
// TODO replace with something else, maybe scriptaculous
mapbuilder.loadScript(baseDir+"/util/blueshoes/lib/LibCrossBrowser.js");
mapbuilder.loadScript(baseDir+"/util/blueshoes/lib/EventHandler.js");
mapbuilder.loadScript(baseDir+"/util/blueshoes/core/form/Bs_FormUtil.lib.js");
mapbuilder.loadScript(baseDir+"/util/blueshoes/lcore/gfx/Bs_ColorUtil.lib.js");
mapbuilder.loadScript(baseDir+"/util/blueshoes/components/slider/Bs_Slider.class1.js");


/**
 * ProgressBar used simulating the progress of in time
 * A ProgressBar is a widget which renders the time progress
 * for the enabled state.
 * @constructor
 * @base WidgetBase
 * @author Markus Innerebner 
 * @param widgetNode The tool node from the Config XML file.
 * @param model The parent model object (optional).
 */
function ProgressBar(widgetNode, model) {
	
	var htmlMainProgressBarIdNode = widgetNode.selectSingleNode("mb:htmlMainProgressBarId");    
  if (htmlMainProgressBarIdNode) {
    this.htmlMainProgressBarId = htmlMainProgressBarIdNode.firstChild.nodeValue;
  }
	
  var htmlProgressBarIdNode = widgetNode.selectSingleNode("mb:htmlProgressBarId");    
  if (htmlProgressBarIdNode) {
    this.htmlProgressBarId = htmlProgressBarIdNode.firstChild.nodeValue;
  }
	
  var htmlStartTagIdNode = widgetNode.selectSingleNode("mb:htmlStartTagId");    
  if (htmlStartTagIdNode) {
    this.htmlStartTagId = htmlStartTagIdNode.firstChild.nodeValue;
  }
	
	
  var htmlEndTagIdNode = widgetNode.selectSingleNode("mb:htmlEndTagId");    
  if (htmlEndTagIdNode) {
    this.htmlEndTagId = htmlEndTagIdNode.firstChild.nodeValue;
  }
	
  // Set button text values as parameters
  if (config.widgetText) {
    var textNodeXpath = "/mb:WidgetText/mb:widgets/mb:" + widgetNode.nodeName;
    var textParams = config.widgetText.selectNodes(textNodeXpath+"/*");
    for (var j=0;j<textParams.length;j++) {
      this[textParams[j].nodeName]=textParams[j].firstChild.nodeValue;
    }
  }
	
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

  WidgetBase.apply(this, new Array(widgetNode, model));


	/**
	 * Initializes the progress bar
	 * @param {Object} objRef 
	 * @param {Object} minValue the min time value
	 * @param {Object} maxValue the max time value
	 */
  this.progressBarInit = function(objRef) {
  	
		if(objRef.model.getMaxTimeInstant()) {
			objRef.difference = objRef.model.getMaxTimeInstant().getTime() - objRef.model.getMinTimeInstant().getTime();
			objRef.difference = objRef.difference / objRef.intervalNumber;
			objRef.separatorDate = new Date(objRef.model.getMinTimeInstant().getTime() + objRef.difference );
			
			var parentNode = document.getElementById(objRef.htmlMainProgressBarId);
			parentNode.setAttribute('style','position: relative; vertical-align: top; height: 50px; width: ' + objRef.width + ';');
			
			var progressBarNode = document.getElementById(objRef.htmlProgressBarId);
			if(!progressBarNode) {
				progressBarNode = document.createElement('div');
	    	progressBarNode.setAttribute('id', objRef.htmlProgressBarId);
	   		progressBarNode.setAttribute('style', 'position: relative; top:12px; float: left;');
	    	parentNode.appendChild(progressBarNode);
			}
			
	    // workaround for IE - otherwise nothing is displayed
	    parentNode.innerHTML += ' ';
	
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
			objRef.progressBar.drawInto(objRef.htmlTagId);
			
			objRef.progressBar.attachOnChange(function(evt) {
				if(!objRef.value || objRef.value != objRef.progressBar.getValue()) {
					objRef.value = objRef.progressBar.getValue();
					var closestTimestamp = objRef.model.getMinTimeInstant().getTime() + (objRef.difference * objRef.value);
					window.movingObjectSimulator.updateIndex(objRef, closestTimestamp);
				} 
			});
			
			var htmlStartDivNode = document.getElementById(objRef.htmlStartTagId);
			if(!htmlStartDivNode) {
				htmlStartDivNode = document.createElement('div');
	    	htmlStartDivNode.setAttribute('style','position: relative; float: left;');
				htmlStartDivNode.setAttribute('id', objRef.htmlStartTagId);
				htmlStartDivNode.appendChild(document.createTextNode(objRef.model.getMinTimeInstant().toLocaleTimeString()));
				parentNode.appendChild(htmlStartDivNode);
			} else {
				var xx = htmlStartDivNode.childNodes[0];
				xx.nodeValue = objRef.model.getMinTimeInstant().toLocaleTimeString();
			}
			
			var htmlEndDivNode = document.getElementById(objRef.htmlEndTagId);
			if(!htmlEndDivNode) {
				htmlEndDivNode = document.createElement('div');
	    	htmlEndDivNode.setAttribute('style','position: relative; float: right;');
				htmlEndDivNode.setAttribute('id', objRef.htmlEndTagId);
				htmlEndDivNode.appendChild(document.createTextNode(objRef.model.getMaxTimeInstant().toLocaleTimeString()));
				parentNode.appendChild(htmlEndDivNode);
			} else {
				var xx = htmlEndDivNode.childNodes[0];
				xx.nodeValue = objRef.model.getMaxTimeInstant().toLocaleTimeString();
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
		var sepMs = objRef.separatorDate.getTime();
		if(currentInstant.getTime() > sepMs) {
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
	
	
	this.myCallBack = function(objRef) {
		var b = false;
		if(b){
			alert("slider manually changed");	
		}
	}
	


}
