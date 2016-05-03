# TODO List

## Data Processing
* Collect data for other metrics (event types).
* Process metric event data into json for PE radial view.
* Process metric event data into json for LP radial view.
* Rearrange PE json data set to print on a per event basis recording src, dest, gvt data to be parsed in the javascript file.

## Radial PE View
* Add color intensity legend
* Create functionality to display all connections within a given gvt window for a given selection of PEs.
* Return the PE ID upon mouse click to update data in other views.

## Radial LP View
* Investigate a multilayered approach placing router lps on the inner circle and terminal lps on the outer circle
* Add color intensity legend
* Use two colors: one color for terminals and another color for routers. Either compute whether terminal or router in javascript or store as 0 or 1 in the JSON file under a "type" parameter.
* Show data for selected GVT

## Time Selector View

## LP Selector View

## All simulation View
* maybe do some offsetting of lines, so it's obvious there are multiple lines
* change some of the axes to log scale

## Selection Info Panel
* any other info?

## Settings Panel
* Add option to select different color schemes for both radial views

## Finishing Touches
* Add a legend of some sort displaying data of some sort?

## Future/If Possible Work
* Is there any desire to perform the visualization in-situ?
* Collect data for Dragonfly.
