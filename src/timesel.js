// expects 2D GVT x LP matrix for each metric
var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y%m%d").parse;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

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

    x.domain(d3.extent(data, function(d) { return +d.gvt; }));

    y.domain([
        d3.min(pe, function(c) { return d3.min(c.values, function(v) { return v.metric; }); }),
        d3.max(pe, function(c) { return d3.max(c.values, function(v) { return v.metric; }); })
    ]);

    var zoom = d3.behavior.zoom()
        .x(x)
        .y(y)
        .scaleExtent([0,100000])
        .on("zoom", zoomed);    

    svg = d3.select(".timegraph").append("svg")
        //.call(zoom)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
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
        .attr("x", -height/2)
        .text("Forward Events");

    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

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

    var city = svg.selectAll(".line")
        .data(pe)
        .enter().append("path")
        .attr("class", "line")
        .attr("clip-path", "url(#clip)")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.name); });


    /*var legend = svg.selectAll(".legend")
        .data(color.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { console.log(d);
            console.log(i); return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width + 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width + 24)
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
}
