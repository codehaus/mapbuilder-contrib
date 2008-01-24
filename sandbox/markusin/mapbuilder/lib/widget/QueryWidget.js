/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
$Id: Slider.js 3076 2007-10-05 14:28:50Z minnerebner $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/util/Util.js");
mapbuilder.loadScript(baseDir+"/widget/WidgetBase.js");

// used for calendars, maybe replaced in a secondo moment
mapbuilder.loadScript(baseDir+"/util/codethatcalendar/scripts/codethatcalendarstd.js");
mapbuilder.loadScript(baseDir+"/util/codethatcalendar/scripts/myCalendar.js");

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
	
}
