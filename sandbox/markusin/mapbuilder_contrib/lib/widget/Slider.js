/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
$Id: Slider.js 3076 2007-10-05 14:28:50Z minnerebner $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/util/Util.js");
mapbuilder.loadScript(baseDir+"/widget/WidgetBase.js");

// loading libs necessary for the slider
mapbuilder.loadScript(baseDir+"/util/blueshoes/lib/LibCrossBrowser.js");
mapbuilder.loadScript(baseDir+"/util/blueshoes/lib/EventHandler.js");
mapbuilder.loadScript(baseDir+"/util/blueshoes/core/form/Bs_FormUtil.lib.js");
mapbuilder.loadScript(baseDir+"/util/blueshoes/lcore/gfx/Bs_ColorUtil.lib.js");
mapbuilder.loadScript(baseDir+"/util/blueshoes/components/slider/Bs_Slider.class1.js");


/**
 * Slider used for incrementing and decrementing 
 * A Slider is a widget which renders a slider in html
 * for the enabled state.
 * @constructor
 * @base WidgetBase
 * @author Markus Innerebner 
 * @param widgetNode The tool node from the Config XML file.
 * @param model The parent model object (optional).
 */
function Slider(widgetNode, model) {
  var sliderBarNode = widgetNode.selectSingleNode("mb:sliderBar");
  if ( sliderBarNode ) {
    this.htmlTagId = sliderBarNode.firstChild.nodeValue;
    this.sliderBarGroup = this.htmlTagId;    
  }
	
  var htmlTagNode = widgetNode.selectSingleNode("mb:htmlTagId");    
  if (htmlTagNode) {
    this.htmlTagId = htmlTagNode.firstChild.nodeValue;
  }
  if ((!sliderBarNode) && (!htmlTagNode)){
    alert(mbGetMessage("sliderBarNodeRequired", widgetNode.nodeName));
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
		this.width = 150;
	}
	
	var heightNode = widgetNode.selectSingleNode("mb:height");
  if ( heightNode ) {
    this.height = parseInt(heightNode.firstChild.nodeValue);
  } else  {
		this.height = 30;
	}
	
	var defaultValueNode = widgetNode.selectSingleNode("mb:defaultValue");
  if ( defaultValueNode ) {
    this.defaultValue = parseInt(defaultValueNode.firstChild.nodeValue);
  } else  {
		this.defaultValue = 2;
	}
	
	var maxValueNode = widgetNode.selectSingleNode("mb:maxValue");
  if ( maxValueNode ) {
    this.maxValue = parseInt(maxValueNode.firstChild.nodeValue);
  } else  {
		this.maxValue = 20;
	}
	
	var minValueNode = widgetNode.selectSingleNode("mb:minValue");
  if ( minValueNode ) {
    this.minValue = parseInt(minValueNode.firstChild.nodeValue);
  } else  {
		this.minValue = 1;
	}
	
	var valueIntervalNode = widgetNode.selectSingleNode("mb:valueInterval");
  if ( valueIntervalNode ) {
    this.valueInterval = parseInt(valueIntervalNode.firstChild.nodeValue);
  } else  {
		this.valueInterval = 2;
	}
	
	var tooltipDownNode = widgetNode.selectSingleNode("mb:tooltipDown");
  if ( tooltipDownNode ) {
    this.tooltipDown = tooltipDownNode.firstChild.nodeValue;
  } else  {
		this.tooltipDown = 2;
	}
	
	var tooltipUpNode = widgetNode.selectSingleNode("mb:tooltipUp");
  if ( tooltipDownNode ) {
    this.tooltipUp = tooltipUpNode.firstChild.nodeValue;
  } else  {
		this.tooltipUp = "Increments the value";
	}	
	
	var actionNode = widgetNode.selectSingleNode("mb:action");
  if ( actionNode ) {
    this.action = actionNode.firstChild.nodeValue;
  } else  {
		this.action = "Decrements the value";
	}	

  WidgetBase.apply(this, new Array(widgetNode, model));


  /**
   * Set the target context for the button, initialise the
   * buttonBars array in the context document and add a
   * listener to the target model for adding controls
   * to the OL map as soon as the map is initialized.
   * @param objRef Reference to this object.
   */  
  this.sliderInit = function(objRef) {
		
     //set the target context
    var targetContext = objRef.widgetNode.selectSingleNode("mb:targetContext");
    if (targetContext) {
      objRef.targetContext = window.config.objects[targetContext.firstChild.nodeValue];
      if ( !objRef.targetModel ) {
        alert(mbGetMessage("noTargetContext", targetContext.firstChild.nodeValue, objRef.id));
      }
    } else {
      objRef.targetContext = objRef.targetModel;
    }
		objRef.slider = new Bs_Slider();
	  objRef.slider.width         = objRef.width;
	  objRef.slider.height        = objRef.height;
	  objRef.slider.minVal        = objRef.minValue;
	  objRef.slider.maxVal        = objRef.maxValue;
	  objRef.slider.valueInterval = objRef.valueInterval;
		objRef.slider.valueDefault  = objRef.defaultValue;
		objRef.slider.useInputField = 3;
	  objRef.slider.arrowAmount   = 2;
		objRef.slider.arrowKeepFiringTimeout = 500;
	  objRef.slider.imgDir   = baseDir + '/util/blueshoes/components/slider/img/';
	  objRef.slider.setBackgroundImage('bob/background.gif', 'no-repeat');
	  objRef.slider.setSliderIcon('bob/slider.gif', 13, 18);
	  objRef.slider.setArrowIconLeft('img/arrowLeft.gif', 16, 16);
	  objRef.slider.setArrowIconRight('img/arrowRight.gif', 16, 16);
	  objRef.slider.useInputField = 3;
	  objRef.slider.styleValueFieldClass = 'sliderInput';
	  objRef.slider.colorbar = new Object();
  	objRef.slider.colorbar['color']           = 'blue';
  	objRef.slider.colorbar['height']          = 5;
  	objRef.slider.colorbar['widthDifference'] = -12;
  	objRef.slider.colorbar['offsetLeft']      = 5;
  	objRef.slider.colorbar['offsetTop']       = 9;
		objRef.slider.wheelAmount        = 1;
		objRef.slider.attachOnChange(objRef.fireSliderChanged, objRef);
		objRef.slider.drawInto(objRef.htmlTagId);
  }
	this.model.addListener("refresh",this.sliderInit, this);
	
	/**
	 * This method will be invoked, in case that the value in the slider was changed. 
	 * 
	 * @param {Object} obj the Bs_Slider object from which reading the changed value
	 * @param {Object} objRef null, because using directly the window object. Not sure if the right way??
	 */
	this.fireSliderChanged = function(obj, objRef) {
		var val = obj.getValue();
		if(val) {
			window.movingObjectSimulator.changeSpeedFactor(val);
		}
	}
	this.model.addListener("onSliderChanged",this.fireSliderChanged, this);

}
