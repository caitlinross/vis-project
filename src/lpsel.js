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
        var type;
        if ((+myid[1]+1) % 4 == 0){
            type = "router";
        }else{
            type = "terminal";
        }
        return {
            type: type, 
            PE: pe_id,
            LP: +myid[1],
            forward_events: d3.sum(d[0].values, function(g) { return g.metric;})
        };
    })
    .entries(lp);

    var lp_lines = [];
    lp_temp.forEach(function(d) { lp_lines.push(d.values); });

    var colorgen = d3.scale.ordinal()
        .range(["#2166ac","#b2182b"]);

    var color = function(d) {  return colorgen(d.type); };

    lp_pc = d3.parcoords()("#lppc")
        .data(lp_lines)
        .hideAxis(["type"])
        .color(color)
        .alpha(0.25)
        .composite("darker")
        .margin({ top: 20, left: 10, bottom: 10, right: 10 })
        .mode("queue")
        .render()
        .reorderable()
        .brushMode("1D-axes")  // enable brushing
        //.brushMode("2D-strums");  // enable brushing
        .on("brushend", get_brushed);

    lp_pc.svg.selectAll("text")
        .style("font", "12px sans-serif");


    function get_brushed(){
        var selected_lines = lp_pc.brushed();
        
        selected_pes = d3.nest()
            .key(function(d) { return "PE_" +d.PE; })
            .entries(selected_lines);
        selected_lps = d3.nest()
            .key(function(d) { return "LP_" +d.LP; })
            .entries(selected_lines);
        time_line_selection(selected_pes);
        change_pe_text(selected_pes);
    }

    selected_pes = d3.nest()
        .key(function(d) { return "PE_" +d.PE; })
        .entries(lp_lines);
    change_pe_text(selected_pes);
    

});

