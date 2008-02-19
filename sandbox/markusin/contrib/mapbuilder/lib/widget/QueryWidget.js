/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
$Id: QueryWidget.js 3076 2007-10-05 14:28:50Z minnerebner $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/widget/WidgetBaseXSL.js");

// used for calendars, maybe replaced in a secondo moment
mapbuilder.loadScript(baseDir+"/util/jscalendar-1.0/calendar.js");
mapbuilder.loadScript(baseDir+"/util/jscalendar-1.0/lang/calendar-en.js");
mapbuilder.loadScript(baseDir+"/util/jscalendar-1.0/calendar-setup.js");


/**
 * QueryWidget to layer, where in which to launch spatio-temporal queries
 * A QueryWidget is a widget used for creating spatio-temporal queries. The input specified input fields
 * have to be translated into a xml document, being the WFS request, specified in the filter encoding properties.
 * 
 * @constructor
 * @base QueryWidget
 * @author Markus Innerebner 
 * @param widgetNode The tool node from the Config XML file.
 * @param model The parent model object (optional).
 */
function QueryWidget(widgetNode, model) {
	
	WidgetBaseXSL.apply(this,new Array(widgetNode, model));
	
	var htmlTagIdNode = widgetNode.selectSingleNode("mb:htmlTagId");    
  if (htmlTagIdNode) {
  	this.htmlTagId = htmlTagIdNode.firstChild.nodeValue;
  } else {
		this.htmlTagId = widgetNode.getAttribute("id");
	}
	
  var fromDateIdNode = widgetNode.selectSingleNode("mb:fromDateId");    
  if (fromDateIdNode) {
    this.fromDateId = fromDateIdNode.firstChild.nodeValue;
  }
		
		var dynamicPropertyTypeNode = widgetNode.selectSingleNode("mb:dynamicPropertyType");    
  if (dynamicPropertyTypeNode) {
    this.dynamicPropertyType = dynamicPropertyTypeNode.firstChild.nodeValue;
  }
	
	var toDateIdNode = widgetNode.selectSingleNode("mb:toDateId");    
  if (toDateIdNode) {
    this.toDateId = toDateIdNode.firstChild.nodeValue;
  }
	
	var queryableFeaturesNode = widgetNode.selectSingleNode("mb:queryableFeatures");    
  if (queryableFeaturesNode) {
    this.queryableFeatures = queryableFeaturesNode;
  }
	
	 var fromDateIdNode = widgetNode.selectSingleNode("mb:fromDateId");    
  if (fromDateIdNode) {
    this.fromDateId = fromDateIdNode.firstChild.nodeValue;
  }
	
	var toDateIdNode = widgetNode.selectSingleNode("mb:toDateId");    
  if (toDateIdNode) {
    this.toDateId = toDateIdNode.firstChild.nodeValue;
  }
	
	var dateFormatNode = widgetNode.selectSingleNode("mb:dateFormat");
	this.dateFormat = dateFormatNode ? dateFormatNode.firstChild.nodeValue : "%Y-%m-%dT%H:%M";    
  
	var timeFormatNode = widgetNode.selectSingleNode("mb:timeFormat");
	this.timeFormat = timeFormatNode ? timeFormatNode.firstChild.nodeValue : 24;
	
  var showTimeNode = widgetNode.selectSingleNode("mb:showTime");
	this.showTime = (timeFormatNode && timeFormatNode.firstChild.nodeValue=="false") ? false : true;

	this.formName = "queryForm_" + mbIds.getId();
 this.stylesheet.setParameter("formName", this.formName);
 this.stylesheet.setParameter("fromDateId", this.fromDateId);
	this.stylesheet.setParameter("toDateId", this.toDateId);
	this.stylesheet.setParameter("formId", this.htmlTagId);
	this.stylesheet.setParameter("dynamicPropertyType", this.dynamicPropertyType);
	this.formElements = new Object();
  // We might have a request stylesheet to fill for a more complex post
	
  var requestStylesheet = widgetNode.selectSingleNode("mb:requestStylesheet");
  if (requestStylesheet) {
    this.requestStylesheet = new XslProcessor(requestStylesheet.firstChild.nodeValue,model.namespace); 
  }
  
  var webServiceUrl = widgetNode.selectSingleNode("mb:webServiceUrl");
  if (webServiceUrl) {
    this.webServiceUrl = webServiceUrl.firstChild.nodeValue; 
  }
	
	/**
   * Handles submission of the form (via javascript in an <a> tag)
   */
  this.submitForm = function() {
    this.webServiceForm = document.getElementById(this.formName);
    if( this.webServiceForm == null ) { 
      // get it from a user div instead if present
      this.webServiceForm = document.getElementById("webServiceForm_form");
    }
    
    if( this.webServiceForm == null ) {
        
      return;
    }
    
    var httpPayload = new Object();
    httpPayload.method = this.targetModel.method;
    httpPayload.url = this.webServiceUrl;
    
    if (httpPayload.method.toLowerCase() == "get") {
      httpPayload.url = this.webServiceForm.action + "?";
      for (var i=0; i<this.webServiceForm.elements.length; ++i) {
        var element = this.webServiceForm.elements[i];
        webServiceUrl += element.name + "=" + element.value + "&";
        this.formElements[element.name] = element.value;
      }  
      
      mbDebugMessage(this, httpPayload.url);
    
      this.targetModel.newRequest(this.targetModel,httpPayload);
    
    } else { 
        // a post
        // put parameters we got in request stylesheet
      for (var i=0; i<this.webServiceForm.elements.length; ++i) {
        var element = this.webServiceForm.elements[i];
        this.formElements[element.name] = element.value;
      }  
      
      this.requestStylesheet.setParameter("resourceName", this.formElements["feature"])
      this.requestStylesheet.setParameter("fromDateField", this.formElements["fromDate"])
      this.requestStylesheet.setParameter("toDateField", this.formElements["toDate"])
						this.requestStylesheet.setParameter("dynamicPropertyType", this.formElements["dynamicPropertyType"])
  
      var layer = this.requestStylesheet.transformNodeToObject(this.model.doc); 
      if (this.debug) mbDebugMessage(this, "Transformed: "+ (new XMLSerializer()).serializeToString(layer));
           
      // extract the GetFeature out
      this.namespace = "xmlns:wmc='http://www.opengis.net/context' xmlns:ows='http://www.opengis.net/ows' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xsl='http://www.w3.org/1999/XSL/Transform' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:gml='http://www.opengis.net/gml' xmlns:wfs='http://www.opengis.net/wfs'";
      
      Sarissa.setXpathNamespaces(layer, this.namespace);
      var getFeature = layer.selectSingleNode("//wfs:GetFeature")
      
      httpPayload.postData = (new XMLSerializer()).serializeToString( getFeature);
      
      mbDebugMessage(this, "httpPayload.postData:"+ httpPayload.postData);
      
      this.targetModel.wfsFeature = layer.childNodes[0];
      if (this.debug) mbDebugMessage(this, "wfsFeature = "+ (new XMLSerializer()).serializeToString(this.targetModel.wfsFeature));
        
      this.targetModel.newRequest(this.targetModel,httpPayload);
    }
  }
	
	
	/**
	 * 
	 * @param {Object} objRef
	 */
	this.init = function (objRef) {if (objRef.model) {
    objRef.model.addListener("aoi", objRef.setAoiParameters, objRef);
      //TBD: another one for bbox
    }
		objRef.initCalendar(objRef);
	}
	this.model.addListener("loadModel", this.init, this );
		
	/**
	 * 
	 * @param {Object} objRef
	 */	
	this.initCalendar = function(objRef){
		Calendar.setup({
    	inputField     :    objRef.fromDateId,
      ifFormat       :    objRef.dateFormat,
      showsTime      :    objRef.showTime,
      timeFormat     :    objRef.timeFormat,
    });
    Calendar.setup({
      inputField     :    objRef.toDateId,
      ifFormat       :    objRef.dateFormat,
      showsTime      :    objRef.showTime,
      timeFormat     :    objRef.timeFormat,
    });
	}
	
	/**
   * handles keypress events to filter out everything except "enter".  
   * Pressing the "enter" key will trigger a form submit
   * @param event  the event object passed in for Mozilla; IE uses window.event
   */
  this.handleKeyPress = function(event) {
    var keycode;
    var target;
    if (event){
      //Mozilla
      keycode=event.which;
      target=event.currentTarget;
    }else{
      //IE
      keycode=window.event.keyCode;
      target=window.event.srcElement.form;
    }

    if (keycode == 13) {    //enter key
      target.parentWidget.submitForm();
      return false;
    }
  }

  /**
   * Refreshes the form onblur handlers when this widget is painted.
   * @param objRef Pointer to this object.
   */
  this.postPaint = function(objRef) {
    objRef.webServiceForm = document.getElementById(objRef.formName);
    if( this.webServiceForm == null ) { 
      // get it from a user div instead if present
      this.webServiceForm = document.getElementById("webServiceForm_form");
    }
    
    objRef.webServiceForm.parentWidget = objRef;
    objRef.webServiceForm.onkeypress = objRef.handleKeyPress;
    //objRef.WebServiceForm.onsubmit = objRef.submitForm;
    //objRef.WebServiceForm.mapsheet.onblur = objRef.setMapsheet;
  }

  //set some properties for the form output
  this.formName = "WebServiceForm_" + mbIds.getId();
  this.stylesheet.setParameter("formName", this.formName);

  /**
   * Sets value for form elements
   * @param objRef Pointer to this object.
   */
  this.prePaint = function(objRef) {
    for (var elementName in objRef.formElements) {
      objRef.stylesheet.setParameter(elementName, objRef.formElements[elementName]);
    }
  }

  /**
    * Setup the listener for AOI changes to be used in filter if necessary
    */
  this.setAoiParameters = function(objRef,bbox) {
    if (objRef.model) {
      var featureSRS = null;
      var containerSRS = objRef.model.getSRS();
     
      objRef.requestStylesheet.setParameter("bBoxMinX", bbox[0][0] );
      objRef.requestStylesheet.setParameter("bBoxMinY", bbox[1][1] );
      objRef.requestStylesheet.setParameter("bBoxMaxX", bbox[1][0] );
      objRef.requestStylesheet.setParameter("bBoxMaxY", bbox[0][1] );
      objRef.requestStylesheet.setParameter("srs", containerSRS );
      objRef.requestStylesheet.setParameter("width", objRef.model.getWindowWidth() );
      objRef.requestStylesheet.setParameter("height", objRef.model.getWindowHeight() );
    }
  }
	
}
