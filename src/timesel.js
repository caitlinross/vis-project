// expects 2D GVT x LP matrix for each metric
var margin = {top: 20, right: 80, bottom: 30, left: 50},
    w1 = 600 - margin.left - margin.right,
    h1 = 250 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y%m%d").parse;

x = d3.scale.linear()
    .range([0, w1]);

var y = d3.scale.linear()
    .range([h1, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.gvt); })
    .y(function(d) { return y(d.metric); });

function zoomed() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);   
    svg.selectAll('path.line')
        .attr('d', function(d) { return line(d.values); });  
}

//var bisectGVT = d3.bisector(function(d) { return d.gvt; }).left;

var svg;

function createTimeGraph(data) {
    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "gvt"; }));

    var pe = color.domain().map(function(name) {
        return {
            name: name,
            values: data.map(function(d) {
                return {gvt: +d.gvt, metric: +d[name]};
            })
        };
    });
    var num_bins = 500;
    var max_gvt = d3.max(data, function(d) { return +d.gvt; });
    var bin_size = max_gvt / num_bins;
    binned_pes = [];

    for (var i = 0; i < pe.length; i++){
        var current_bin = bin_size;
        var tmp_metric = 0;
        var tmp_vals = [];
        for (var j = 0; j < pe[i].values.length; j++){
            if (pe[i].values[j].gvt <= current_bin){
                tmp_metric += pe[i].values[j].metric;
            } 
            else {
                tmp_vals.push({gvt: current_bin, metric: tmp_metric});
                tmp_metric = 0;
                current_bin += bin_size;
            }
        }
        tmp_vals.push({gvt: current_bin, metric: tmp_metric});
        binned_pes.push({name: pe[i].name,
            values: tmp_vals});
    }
    x.domain([
        d3.min(binned_pes, function(c) { return d3.min(c.values, function(v) { return v.gvt; }); }),
        d3.max(binned_pes, function(c) { return d3.max(c.values, function(v) { return v.gvt; }); })
    ]);

    y.domain([
        d3.min(binned_pes, function(c) { return d3.min(c.values, function(v) { return v.metric; }); }),
        d3.max(binned_pes, function(c) { return d3.max(c.values, function(v) { return v.metric; }); })
    ]);

    var zoom = d3.behavior.zoom()
        .x(x)
        .y(y)
        .scaleExtent([0,100000])
        .on("zoom", zoomed);    

    svg = d3.select(".timegraph").append("svg")
        .call(zoom)
        .attr("width", w1 + margin.left + margin.right)
        .attr("height", h1 + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h1 + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", (-margin.left) + 10)
        .attr("x", -h1/2)
        .text("Forward Events");

    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", w1)
        .attr("height", h1);

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", w1)
        .attr("height", h1)
        .attr("opacity", 0)
        .on("click", mousemove);

    /*var city = svg.selectAll(".city")
        .data(pe)
        .enter().append("g")
        .attr("class", "city");

    city.append("path")
        .attr("class", "line")
        .attr("clip-path", "url(#clip)")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.name); });
        */

    city = svg.selectAll(".line")
        .data(binned_pes)
        .enter().append("path")
        .attr("class", "line")
        .attr("id", function(d) {return d.name;})
        .attr("clip-path", "url(#clip)")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.name); });
    console.log(city);

    var pointer = svg.append("circle")
        .attr("class", "timepointer")
        .attr("fill", "red")
        .attr("cy", "0")
        .attr("cx", "0")
        .attr("transform", "translate(0," + h1 + ")")
        .attr("opacity", "0")
        .attr("r", "4");

    /*var legend = svg.selectAll(".legend")
        .data(color.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { console.log(d);
            console.log(i); return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", w1 + 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", w1 + 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
        */

    /*city.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.gvt) + "," + y(d.value.metric) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });
        */
        //TODO the value is off by some amount dependent on the zoom
        /*bin_end_time = d3.select(".x axis").on('click', function(){
            console.log(x.invert(d3.event.pageX));
            return x.invert(d3.event.pageX);
        });
        console.log(bin_end_time);*/

        function mousemove() {
            var selected_time = x.invert(d3.mouse(this)[0]);
            get_gvt_times(selected_time);
            add_time_pointer();
        }

        /* use bin_end_time to determine where to place image on the time selector x-axis */
        function add_time_pointer(){
            pointer.attr("opacity", "1")
                .transition()
                .attr("transform", "translate("+ x(bin_end_time) +"," + h1 + ")");
        }


}
