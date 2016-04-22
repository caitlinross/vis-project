// Adapted from https://syntagmatic.github.io/parallel-coordinates/ by Kai Chang
// this uses Chang's d3.parcoords javascript library that is built on top of d3 
// load csv file and create the chart
// expects 2D GVT x LP matrix for each metric
d3.csv('data/slimfly-processed/forward-send-event-log.txt', function(data) {

    var lp = data.map(function(name) {
        console.log(name);
        return {
            PE: name,
            values: data.map(function(d) {
                return {gvt: +d.gvt, metric: +d[name]};
            })
        };
    });

    var colorgen = d3.scale.ordinal()
        .range(["#a6cee3","#1f78b4","#b2df8a","#33a02c",
            "#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
            "#cab2d6","#6a3d9a","#ffff99","#b15928"]);

    var color = function(d) { console.log(d); return colorgen(d.batch); };

    var parcoords = d3.parcoords()("#lppc")
        .data(data)
     //   .hideAxis(["name"])
        .color(color)
        .alpha(0.25)
        .composite("darker")
        .margin({ top: 10, left: 10, bottom: 10, right: 10 })
        .mode("queue")
        .render()
        .reorderable()
        .brushMode("1D-axes");  // enable brushing

    parcoords.svg.selectAll("text")
        .style("font", "10px sans-serif");
});

