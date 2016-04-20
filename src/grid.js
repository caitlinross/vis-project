// TODO change to pull in data for PE, KP, LP and metric
// expects format (same as lpsel.js
// PE ID, KP ID, LP ID, metric 0, metric 1, ..., metric n
// Adapted from http://bl.ocks.org/mbostock/4063318#index.html by Mike Bostock 

// change size of cells and of area the cells are shown in
var width = 1200,
    height = 150,
    cellSize = 20; 

// format the percentages and data for the html tags
var percent = d3.format(".1%"),
    format = d3.format("d");

// get correct heat map color
var color = d3.scale.quantize()
    .domain([0, 1])
    .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));
var jrcolor = d3.scale.quantize()
    .domain([0, 20])
    .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

//var titlePar = d3.selectAll("body")
//    .append("H1")
//    .attr("class", "graphTitle")
//    .text("Select options below to view data");

// create the SVG
var localsvg = d3.selectAll("body").select("svg")
    .data(d3.range(1))
    .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "RdYlGn")
    .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

var remotesvg = d3.selectAll("body").select("svg")
    .data(d3.range(1))
    .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "RdYlGn")
    .attr("id", "rmSite")
    .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

// create text for names of row sections 
var localText = localsvg.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text("WAN Site 1 (local)");

var remoteText = remotesvg.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text("WAN Site 2 (remote)");

// create rectangles for days
var rect1 = localsvg.selectAll(".day")
    .data(createDays()) 
    .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return getWeekPos(d) * cellSize; })
    .attr("y", function(d) { return getDayPos(d) * cellSize; })
    .datum(format);

var rect2 = remotesvg.selectAll(".day")
    .data(createDays()) 
    .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return getWeekPos(d) * cellSize; })
    .attr("y", function(d) { return getDayPos(d) * cellSize; })
    .datum(format);

var keyArea = d3.selectAll("body").select("svg")
    .data(d3.range(1))
    .enter().append("svg")
    .attr("width", width)
    .attr("height", 70)
    .attr("class", "RdYlGn")
    .attr("id", "keyArea")
    .append("g");
    //.attr("transform", "translate(70,9)";

var keyText = keyArea.append("text")
    .attr("transform", "translate(50, 30)")
//     .style("text-anchor", "middle")
    .text("Key: ");

var keyLabelBegin = keyArea.append("text")
    .attr("transform", "translate(98, 55)")
    .text("");

var keyLabelEnd = keyArea.append("text")
    .attr("transform", "translate(424, 55)")
    .text("");

var key = keyArea.selectAll(".legend")
    .data(d3.range(11))
    .enter().append("rect")
    .attr("class", "legend")
    .attr("width", cellSize *1.5)
    .attr("height", cellSize *1.5)
    .attr("x", function(d) { return 100 + d * cellSize * 1.5; })
    .attr("y", 10);

key.data(d3.range(11))
    .attr("class", function(d) {return color(d/11);})
    .select("title")
    .text(function(d) {return d + ": " + (d/100); });

//var expPar = d3.select("body")
//    .append("p")
//    .attr("class", "explanation")
//    .text("Explanation: ");

var loadData = function() {
    var sched = document.getElementById('sched_policy').selectedOptions[0].text;
    var dataFile = sched + '.csv';
    var metric = document.getElementById('metric').selectedOptions[0].value;

    var pageTitle = ""
    if (metric == 0)
    { remotesvg.active = true; pageTitle += "Client Utilization Rate per day"; }
    else if (metric == 1)
    { remotesvg.active = false; pageTitle += "Job Response Time per day"; }
    if (metric == 2)
    { remotesvg.active = true; pageTitle += "Data Movement Overhead per day"; }
    pageTitle += " for " + sched + " scheduling";

    titlePar.text(pageTitle);

    // hide second site for job resp time
    var newOpacity = remotesvg.active ? 1 : 0;
    d3.select("#rmSite").style("opacity", newOpacity);
    if (remotesvg.active) { 
        localText.text("WAN Site 1 (local)");
        remoteText.text("WAN Site 2 (remote)");
    }
    else {
        localText.text("Full System");
    }

    if (metric == 1)
    {
        keyLabelBegin.text("0");
        keyLabelEnd.text("20");
    }
    else {
        keyLabelBegin.text("0");
        keyLabelEnd.text("1");
    }

    // read in the data (in csv format)
    d3.csv(dataFile, function(error, csv) {
        if (error) throw error;

        var data = d3.nest()
            .key(function(d) { return d.timestamp; })
            .key(function(d) { 
                if (d.site == "local") { return 0; }
                else { return 1; } })
            .rollup(function(d) { 
                if (metric == 0) { return d[0].util; }
                else if (metric == 1) { return d[0].resp; }
                else { return d[0].dmo; } })
            .map(csv);

            rect1.filter(function(d) { return d in d3.keys(data); })
            .attr("class", function(d) { 
                if (metric == 1) { return "day " + jrcolor(data[d][0]); }
                else { return "day " + color(data[d][0]); } })
            .select("title")
            .text(function(d) {  return d + ": " + (data[d]); });

            rect2.filter(function(d) { return d in d3.keys(data); })
            .attr("class", function(d) { 
                if (metric == 1) { return "day " + jrcolor(data[d][0]); }
                else { return "day " + color(data[d][1]); } })
            .select("title")
            .text(function(d) { return d + ": " + (data[d]); });
    });
};

function createDays() {
    var alldays = d3.range(20*7); 
    return alldays;
}

function getWeekPos(t) {
    return Math.floor(t/7);
}

function getDayPos(t) {
    return t % 7;
}

d3.select(self.frameElement).style("height", "2910px");
