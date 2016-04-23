// Adapted from https://syntagmatic.github.io/parallel-coordinates/ by Kai Chang
// this uses Chang's d3.parcoords javascript library that is built on top of d3 
// load csv file and create the chart
// expects 2D GVT x LP matrix for each metric
d3.csv('data/slimfly-processed/forward-send-event-log-lp.txt', function(data) {
    var lp_names = d3.scale.category10();
    lp_names.domain(d3.keys(data[0]).filter(function(key) { return key !== "gvt"; }));

    var lp = lp_names.domain().map(function(name) {
        return {
            name: name,
            values: data.map(function(d) {
                return {gvt: +d.gvt, metric: +d[name]};
            })
        };
    });

    // now want to aggregate all of the counts for the initial lp selector
    var lp_temp = d3.nest()
    .key(function(d) {return d.name;})
    .rollup(function(d) {
        var myid = d[0].name.split("_");
        var pe_id = Math.floor(+myid[1]/Math.ceil(num_lp/num_pe));
        return {
            PE: pe_id,
            LP: +myid[1],
            total_metric: d3.sum(d[0].values, function(g) { return g.metric;})
        };
    })
    .entries(lp);

    var lp_lines = [];
    lp_temp.forEach(function(d) { lp_lines.push(d.values); });

    var colorgen = d3.scale.ordinal()
        .range(["#a6cee3","#1f78b4","#b2df8a","#33a02c",
            "#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
            "#cab2d6","#6a3d9a","#ffff99","#b15928"]);

    var color = function(d) {  return colorgen(d.batch); };

    var parcoords = d3.parcoords()("#lppc")
        .data(lp_lines)
     //   .hideAxis(["name"])
        .color(color)
        .alpha(0.25)
        .composite("darker")
        .margin({ top: 20, left: 10, bottom: 10, right: 10 })
        .mode("queue")
        .render()
        .reorderable()
        .brushMode("1D-axes");  // enable brushing

    parcoords.svg.selectAll("text")
        .style("font", "10px sans-serif");
});

