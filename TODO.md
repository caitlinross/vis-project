# TODO List

## Data Processing
* Collect data for other metrics (event types).
* Process metric event data into json for PE radial view.
* Process metric event data into json for LP radial view.
* Rearrange PE json data set to print on a per event basis recording src, dest, gvt data to be parsed in the javascript file.
* Fix LP selector View data and Time Selector View data (all zeros).

## Radial PE View
* Total all connections per PE
* Change initial radial path coloring to temperature scale based on given metric value.
* Create functionality to display all connections within a given gvt window for a given selection of PEs.
* Change hovering to increase intensity/opacity of selected node's connections and decrease intensity/opacity of all other connections.
* Return the PE ID upon mouse click to update data in other views.

## Radial LP View
* Total all connections per  LP
* Use two colors: one color for terminals and another color for routers. Either compute whether terminal or router in javascript or store as 0 or 1 in the JSON file under a "type" parameter.
* Use color intensity/opacity to visualize number of messages transfered on a given link.
* Investigate reason why all terminal LPs are not connecting only to one router LP.
* Show data for selected GVT

## Time Selector View

## LP Selector View

## All simulation View
* maybe do some offsetting of lines, so it's obvious there are multiple lines
* change some of the axes to log scale

## Selection Info Panel
* any other info?

## Settings Panel
* Add radial bundle tension selection.

## Finishing Touches
* Add a legend of some sort displaying data of some sort?

## Future/If Possible Work
* Is there any desire to perform the visualization in-situ?
* Collect data for Dragonfly.
