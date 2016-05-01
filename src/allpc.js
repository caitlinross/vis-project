// Adapted from https://syntagmatic.github.io/parallel-coordinates/ by Kai Chang
// this uses Chang's d3.parcoords javascript library that is built on top of d3 
// load csv file and create the chart
// expects format
// PE, GVT interval, batch, num KPs, runtime, % efficiency, net events, roll backs, ...
d3.csv('data/sample_data.csv', function(data) {
    var colorgen = d3.scale.ordinal()
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999']);

    var color = function(d) { return colorgen(d.PE); };

    var parcoords = d3.parcoords()("#pc")
        .data(data)
     //   .hideAxis(["name"])
        .color(color)
        .alpha(0.25)
        .composite("darker")
        .margin({ top: 15, left: 0, bottom: 15, right: 0 })
        .mode("queue")
        .render()
        .reorderable()
        .brushMode("1D-axes");  // enable brushing

    parcoords.svg.selectAll("text")
        .style("font", "12px sans-serif");

});

