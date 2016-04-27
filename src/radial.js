//TODO javascript for radial view of PEs goes here

var diameter = 600;
var width = 600;
var height = 450;
var radius = diameter / 2;
var innerRadius = radius - 120;

var cluster = d3.layout.cluster()
		.size([360, innerRadius])
		.sort(null)
		.value(function(d) { return d.size; });

var bundle = d3.layout.bundle();

var line_radial = d3.svg.line.radial()			//Constructs new radial line generator with default radius and angle functions
		.interpolate("bundle")
		.tension(.35)
		.radius(function(d) { return d.y; })
		.angle(function(d) { return d.x / 180 * Math.PI; });

var svg_radial = d3.select(".radialgraph").append("svg")
		.attr("width", width)
        .attr("height", height)
	  	.append("g")				//Appends an element g to svg_radial variable
		.attr("transform", "translate(" + radius*1  + "," + radius*0.75 + ")");

var link = svg_radial.append("g").selectAll(".link");
var node = svg_radial.append("g").selectAll(".node");

var colorgen_radial = d3.scale.ordinal()
.range(["#000000","#33a02c","#1f78b4","#a6cee3",
        "#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
        "#cab2d6","#6a3d9a","#ffff99","#b15928"]);
        
var color_radial = function(d) {  return colorgen_radial(d.batch); };

//d3.json("data/MMS7-3.json",
d3.json("data/slimfly-processed/forward-send-event-log-connections-pe.json",
	function(error, classes) 
	{
//	console.log("classes:",classes);
		if (error) throw error;

		var nodes = cluster.nodes(packageHierarchy(classes));
		var links = packageConnections(nodes);		//links: array of all individual connections
        
		console.log("raw nodes:",nodes);
        console.log("raw links:",links);
//console.log("bundle(links):",bundle(links));        
		link = link
            .data(bundle(links))
            .style("stroke",function(d) {  return colorgen_radial(d.batch); })
			.enter().append("path")
			.each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
			.attr("class", "link")
            .attr("d", line_radial)
//        .style("stroke","#cab2d6");

//        console.log("link:",link);
        
		node = node
			.data(nodes.filter(function(n) { return !n.children; }))
			.enter().append("text")
			.attr("class", "node")
			.attr("dy", ".31em")
			.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
			.style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
            .text(function(d) { return d.key; })
            .style("stroke",function(d) {  return colorgen_radial(d.batch); })
			.on("mouseover", mouseovered)
			.on("mouseout", mouseouted);
	}
);

function mouseovered(d) 
{
	node
		.each(function(n) { n.target = n.source = false; });

        link
		.classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
		.classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
		.filter(function(l) { return l.target === d || l.source === d; })
        .each(function() { this.parentNode.appendChild(this); });

	node
		.classed("node--target", function(n) { return n.target; })
        .classed("node--source", function(n) { return n.source; })
        .style("stroke","none");
}

function mouseouted(d) 
{
    link
		.classed("link--target", false)
        .classed("link--source", false);

	node
		.classed("node--target", false)
        .classed("node--source", false)
        .style("stroke",function(d) {  return colorgen_radial(d.batch); });
}

//d3.select(self.frameElement).style("height", diameter + "px");

// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) 
{
	var map = {};

	function find(name, data) 
	{
//console.log("###################################");
//console.log("name:",name);
//console.log("data:",data);
		var node = map[name];
//console.log("node1:",node);
		var i;
		if (!node) 
		{
			node = map[name] = data || {name: name, children: []};
//console.log("node2:",node);
//console.log("map1:",map);
//console.log("name.length:",name.length);
			if (name.length) 
			{
				node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
				node.parent.children.push(node);
				node.key = name.substring(i + 1);
			}
		}
		else
		{
//console.log("-----------first here");	
//console.log("name.length:",name.length);
			if(name.length)
			{
				node.connections.push.apply(node.connections,data.connections);
			}
//console.log("-----------here");			
		}
//console.log("node3:",node);
		return node;
	}

	classes.forEach(
		function(d) 
		{
			find(d.name, d);
		}
	);

	return map[""];
}

// Return a list of connections for the given array of nodes.
function packageConnections(nodes) 
{
	var map = {};
	var connections = [];

	// Compute a map from name to node.
	nodes.forEach
	(
		function(d) 
		{
			map[d.name] = d;
		}
	);

	// For each connection, construct a link from the source to target node.
	nodes.forEach
	(
		function(d) 
		{
			if (d.connections) 
				d.connections.forEach
				(
					function(i) 
					{
                 connections.push({source: map[d.name], target: map[i]});
					}
				);
		}
	);
	return connections;
}
