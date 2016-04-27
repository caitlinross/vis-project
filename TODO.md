# TODO List

## Data Processing
* Collect data for other metrics (event types).
* Process metric event data into json for PE radial view.
* Process metric event data into json for LP radial view.
* Rearrange PE json data set to print on a per event basis recording src, dest, gvt data to be parsed in the javascript file.
* Fix LP selector View data and Time Selector View data (all zeros).

## Radial PE View
* Change initial radial path coloring to temperature scale based on given metric value.
* Create functionality to display all connections within a given gvt window for a given selection of PEs.
* Return the PE ID upon mouse click to update data in other views.
* Change hovering to increase intensity/opacity of selected node's connections and decrease intensity/opacity of all other connections.
* Add a label showing the GVT being shown

## Radial LP View
* Use two colors: one color for LPs and another color for PEs. Either compute whether terminal or router in javascript or store as 0 or 1 in the JSON file under a "type" parameter.
* Use color intensity/opacity to visualize number of messages transfered on a given link.

## Time Selector View
* get the correct start GVT and end GVT for the selected bin
* add a dot or some other shape to x-axis to show what GVT has been selected
* change opacity of lines based on the chosen PEs

## LP Selector View
* get list of PEs from selection for use by other components
* also do the same for LPs (since we're now doing a radial view of LPs)?
* need to change name of metric axis

## All simulation View
* maybe do some offsetting of lines, so it's obvious there are multiple lines
* play around with coloring of lines

## Settings Panel
* Add radial bundle tension selection.

## Finishing Touches
* Add a description to each plot to describe the available interactions (pop up bubbles) and how to use the figures.
* Increase font size for axis labels.
* Is there a way to unselect?
* Make the lines thicker in the top parallel coordinates graph.
* Center visualization titles.
* Add a legend of some sort displaying data of some sort?

## Future/If Possible Work
* Is there any desire to perform the visualization in-situ?
* Collect data for Dragonfly.
