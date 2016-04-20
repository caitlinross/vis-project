// Adapted from https://syntagmatic.github.io/parallel-coordinates/ by Kai Chang
// this uses Chang's d3.parcoords javascript library that is built on top of d3 
// load csv file and create the chart
// TODO change to pull in ending simulation data for all runs
// expects format
// PE, GVT interval, batch, num KPs, runtime, % efficiency, net events, roll backs, ...
d3.csv('data/alldata-batch.csv', function(data) {
    var colorgen = d3.scale.ordinal()
        .range(["#a6cee3","#1f78b4","#b2df8a","#33a02c",
            "#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
            "#cab2d6","#6a3d9a","#ffff99","#b15928"]);

    var color = function(d) { console.log(d); return colorgen(d.batch); };

    var parcoords = d3.parcoords()("#batch")
        .data(data)
     //   .hideAxis(["name"])
        .color(color)
        .alpha(0.25)
        .composite("darker")
        .margin({ top: 54, left: 150, bottom: 12, right: 0 })
        .mode("queue")
        .render()
        .reorderable()
        .brushMode("1D-axes");  // enable brushing

    parcoords.svg.selectAll("text")
        .style("font", "10px sans-serif");
});

