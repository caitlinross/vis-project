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
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.metric); });

        var svg = d3.select(".timegraph").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function createTimeGraph(data) {
    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "gvt"; }));
    //data.forEach(function(d) {
    //    d.date = parseDate(d.date);
    //});

    var lps = color.domain().map(function(name) {
        return {
            name: name,
            values: data.map(function(d) {
                return {gvt: +d.gvt, metric: +d[name]};
                //return {metric: +d[name]};
            })
        };
    });

    console.log(lps);

    x.domain(d3.extent(data, function(d) { return +d.gvt; }));

    y.domain([
        d3.min(lps, function(c) { return d3.min(c.values, function(v) { return v.metric; }); }),
        d3.max(lps, function(c) { return d3.max(c.values, function(v) { return v.metric; }); })
    ]);

    var lineFunction = d3.svg.line()
        .x(function(d) { return d.gvt; })
        .y(function(d) { return d.metric; })
        .interpolate("linear");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Forward Events");

    var city = svg.selectAll(".city")
        .data(lps)
        .enter().append("g")
        .attr("class", "city");

    city.append("path")
        .attr("class", "line")
        //.attr("d", function(d) { console.log(d.values); return line(d.values); })
        .attr("d", lineFunction(lps[0].values))
        .style("stroke", function(d) { return color(d.name); });

    city.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.gvt) + "," + y(d.value.metric) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });
}
