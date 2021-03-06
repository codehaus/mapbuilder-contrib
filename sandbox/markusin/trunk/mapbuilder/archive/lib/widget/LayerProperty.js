/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
$Id: LayerProperty.js 3009 2007-07-25 12:05:58Z steven $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/widget/WidgetBaseXSL.js");

/**
 * Parse DescribeFeatureType response.
 * @constructor
 * @base WidgetBaseXSL
 * @param widgetNode  The widget's XML object node from the configuration document.
 * @param model       The model object that this widget belongs to.
 */
function LayerProperty(widgetNode, model) {
  WidgetBaseXSL.apply(this,new Array(widgetNode, model));
}
