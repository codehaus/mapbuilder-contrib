/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
$Id: EditPoint.js 3616 2007-11-19 21:24:52Z ahocevar $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/widget/EditButtonBase.js");

/**
 * When this button is selected, clicks on the MapPane will add a
 * new point to a model.
 * Requires an enclosing GML model.
 * @constructor
 * @base EditButtonBase
 * @author Cameron Shorter cameronATshorter.net
 * @param widgetNode The node from the Config XML file.
 * @param model  The ButtonBar widget.
 */
function EditPoint(widgetNode, model) {
  // Extend EditButtonBase
  EditButtonBase.apply(this, new Array(widgetNode, model));

  /**
   * Interactive EditPoint control.
   * @param objRef reference to this object.
   * @return {OpenLayers.Control} class of the OL control.
   */
  this.createControl = function(objRef) {
    var Control = OpenLayers.Class(OpenLayers.Control.DrawFeature, {
    type: OpenLayers.Control.TYPE_TOOL,
      // this is needed because all editing tools are of type
      // OpenLayers.Control.DrawFeature
      CLASS_NAME: 'mbEditPoint'
    });
    return Control;
  }
  
  this.instantiateControl = function(objRef, Control) {
    return new Control(objRef.featureLayer, OpenLayers.Handler.Point);
  }

  /**
   * Add a point to the enclosing GML model.
   * @param objRef      Pointer to this object.
   */
  this.setFeature = function(objRef) {
    if (objRef.enabled && objRef.geometry) {
      sucess=objRef.targetModel.setXpathValue(
        objRef.targetModel,
        objRef.featureXpath,objRef.geometry.x+","+objRef.geometry.y);
      objRef.geometry = null;
      if(!sucess){
        alert(mbGetMessage("invalidFeatureXpathEditPoint", objRef.featureXpath));
      }
    }
  }  
}
