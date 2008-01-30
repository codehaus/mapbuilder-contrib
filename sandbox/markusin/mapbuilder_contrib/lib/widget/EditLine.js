/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
$Id: EditLine.js 3616 2007-11-19 21:24:52Z ahocevar $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/widget/EditButtonBase.js");

/**
 * When this button is selected, clicks on the MapPane will add a
 * new point to a line.
 * @constructor
 * @base EditButtonBase
 * @author Cameron Shorter cameronATshorter.net
 * @param widgetNode The from the Config XML file.
 * @param model  The ButtonBar widget.
 */
function EditLine(widgetNode, model) {
  // Extend EditButtonBase
  EditButtonBase.apply(this, new Array(widgetNode, model));

  /**
   * Interactive EditLine control.
   * @param objRef reference to this object.
   * @return {OpenLayers.Control} class of the OL control.
   */
  this.createControl = function(objRef) {
    var Control = OpenLayers.Class(OpenLayers.Control.DrawFeature, {
    	type: OpenLayers.Control.TYPE_TOOL,
      // this is needed because all editing tools are of type
      // OpenLayers.Control.DrawFeature
      CLASS_NAME: 'mbEditLine'
    });
    return Control;
  }
  
  this.instantiateControl = function(objRef, Control) {
    return new Control(objRef.featureLayer, OpenLayers.Handler.Path);
  }

  /**
   * Append a line to the enclosing GML model.
   * @param objRef      Pointer to this object.
   */
  this.setFeature = function(objRef) {
    if (objRef.enabled && objRef.geometry) {
      var points = objRef.geometry.components;
      var geom = '';
      for (var i in points) {
        geom += ' '+points[i].x+","+points[i].y;
      }
      sucess=objRef.targetModel.setXpathValue(
        objRef.targetModel,
        objRef.featureXpath,
        geom);
      objRef.geometry = null;
      if(!sucess){
        alert(mbGetMessage("invalidFeatureXpathEditLine", objRef.featureXpath));
      }
    }
  }
}