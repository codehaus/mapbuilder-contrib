/*
Author:       Cameron Shorter cameronATshorter.net
License:      LGPL as per: http://www.gnu.org/copyleft/lesser.html

$Id: GmlRenderer.js 3009 2007-07-25 12:05:58Z steven $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/widget/MapContainerBase.js");

/**
 * Render GML into HTML.  this.targetModel references the context model with
 * width/height attributes.
 * @constructor
 * @base MapContainerBase
 * @param widgetNode  The widget's XML object node from the configuration document.
 * @param model       The model object that this widget belongs to.
 */
function GmlRenderer(widgetNode, model) {
  var base = new MapContainerBase(this,widgetNode,model)

  /** Xsl to convert Coordinates to Coords. */
  this.coordXsl=new XslProcessor(baseDir+"/widget/GmlCooordinates2Coord.xsl");

  /**
   * Set up XSL params and convert Gml Coordinate nodes to Gml Coords so that they
   * are easier to process by XSL.
   * @param objRef Pointer to this object.
   */
  this.prePaint = function(objRef) {
    //alert("GmlRenderer prepaint on:" + objRef.model.id);
    objRef.stylesheet.setParameter("width", objRef.containerModel.getWindowWidth() );
    objRef.stylesheet.setParameter("height", objRef.containerModel.getWindowHeight() );
    bBox=objRef.containerModel.getBoundingBox();
    objRef.stylesheet.setParameter("bBoxMinX", bBox[0] );
    objRef.stylesheet.setParameter("bBoxMinY", bBox[1] );
    objRef.stylesheet.setParameter("bBoxMaxX", bBox[2] );
    objRef.stylesheet.setParameter("bBoxMaxY", bBox[3] );
    objRef.stylesheet.setParameter("color", "#FF0000" );

    objRef.resultDoc = objRef.coordXsl.transformNodeToObject(objRef.resultDoc);
  }

  // Call paint() when the context changes
/*
  this.init = function(objRef) {
    objRef.targetModel.addListener("refresh",objRef.paint, objRef);
  }
  this.model.addListener("loadModel",this.init,this);
*/
}
