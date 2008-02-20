/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
$Id: Timestamp.js 1671 2005-09-20 02:37:54Z madair1 $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/widget/WidgetBaseXSL.js");

/**
 * Adds a timstamp listener to show the current timestamp value in a form.
 * @constructor
 * @base TimestampWidget
 * @author Markus Innerebner markus.innerebnerATgmail.com
 * @param widgetNode      The tool node from the Config XML file.
 * @param model  The ButtonBar widget.
 */
function TimestampWidget(widgetNode, model) {
//	WidgetBase.apply(this, new Array(widgetNode, model));
  WidgetBaseXSL.apply(this,new Array(widgetNode, model));
	
	// defines if a the date should be shown
  this.showDate      = true; 
  var showDateNode = widgetNode.selectSingleNode("mb:showDate");
  if(showDateNode){
    this.showDate = (showDateNode.firstChild.nodeValue=="false")? false : true;
	}
	
	// the id of the html element
	var htmlTagIdNode = widgetNode.selectSingleNode("mb:htmlTagId");    
  if (htmlTagIdNode) {
    this.htmlTagId = htmlTagIdNode.firstChild.nodeValue;
  }
	
	// the property of the timestamp form field
  this.formName = "timeStamp_" + mbIds.getId();
  this.stylesheet.setParameter("formName", this.formName);
	// the local value of the date
	this.displayDate = null;
	
	/**
	 * Updates the value of the timestamp. Increments the value iff the current value > the local timestamp value
	 * @param {Object} objRef
	 */
	this.updateTimestamp = function (objRef, tStamp) {
		if( objRef.showDate ) {
			var timeStampField = document.getElementById(objRef.formName).timeStamp;
			if(timeStampField) {
				if(objRef.displayDate) {
					objRef.displayDate.setTime(tStamp);
					timeStampField.value = objRef.displayDate.toLocaleString();
				} else {
					objRef.displayDate = new Date(tStamp);
					timeStampField.value = objRef.displayDate.toLocaleString();	
				}
			}
		}
  }
  this.model.addListener("updateTimestamp",this.updateTimestamp, this);
	
	/**
	 * Resets the timestamp field to the min value of the current selected trajectory
	 * @param {Object} objRef
	 */
	this.resetTimestamp = function (objRef) {
		if( objRef.showDate ) {
			var timeStampField = document.getElementById(objRef.formName).timeStamp;
			if(timeStampField) {
				timeStampField.value = objRef.model.getMinTimeInstant().toLocaleString();
			}
		}
		objRef.displayDate = null;
  }
	this.model.addListener("resetTimestamp",this.resetTimestamp, this);
	
	/**
	 * Clears the timestamp field
	 * @param {Object} objRef
	 */
	this.hideTimestamp = function (objRef) {
		if( objRef.showDate ) {
			var timeStampField = document.getElementById(objRef.formName).timeStamp;
			if(timeStampField) {
				timeStampField.value = "";
			}
		}
		objRef.displayDate = null;
  }
	this.model.addListener("hideTimestamp",this.hideTimestamp, this);	
	
}