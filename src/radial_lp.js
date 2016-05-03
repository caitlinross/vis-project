//TODO javascript for radial view of PEs goes here
//line 18 .interpolate("bundle") -> .interpolate("bundle_lp")

var diameter_lp = 600;
var width_lp = 600;
var height_lp = 450;
var radius_lp = diameter_lp / 2;
var innerradius_lp = radius_lp - 120;

var cluser_lp;
var bundle_lp;
var line_radial_lp;
var svg_radial_lp;
var link_lp;
var node_lp;


var colorgen_radial_lp_links = d3.scale.ordinal()
.range(["#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]);

var colorgen_radial_lp = d3.scale.ordinal()
//.range(["#08306b","#2171b5","#6baed6","	#61f205","#f4ea07","#fb7607","#fb0505"]);
.range(["#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]);
//.range(["#e6550d","#fd8d3c","#fdae6b","#fdd0a2"]);
//.range(["#000000","#33a02c","#1f78b4","#a6cee3",
//        "#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
//        "#cab2d6","#6a3d9a","#ffff99","#b15928"]);
        
var color_radial_lp = function(d) {  return colorgen_radial_lp(d.batch); };


function createRadialLP(classes)
{
	cluster_lp = d3.layout.cluster()
		.size([360, innerradius_lp])
		.sort(null)
		.value(function(d) { return d.size; });

	bundle_lp = d3.layout.bundle();
    console.log("tension_lp",tension_lp);
	line_radial_lp = d3.svg.line.radial()			//Constructs new radial line generator with default radius and angle functions
		.interpolate("bundle")
		.tension(tension_lp)
		.radius(function(d) { return d.y; })
		.angle(function(d) { return d.x / 180 * Math.PI; });

	svg_radial = d3.select(".radialgraphlp").append("svg")
		.attr("width", width_lp)
        .attr("height", height_lp)
	  	.append("g")				//Appends an element g to svg_radial variable
		.attr("transform", "translate(" + radius_lp*1  + "," + radius_lp*0.75 + ")");

	link_lp = svg_radial.append("g").selectAll(".link_lp");
	node_lp = svg_radial.append("g").selectAll(".node_lp");



	var nodes_lp = cluster_lp.nodes(packageHierarchy_lp(classes,1));
	var links_lp = packageConnections_lp(nodes_lp);		//links: array of all individual connections

	//		console.log("raw nodes:",nodes);
	//        console.log("raw links:",links);
	//        console.log("bundle_lp(links_lp):",bundle_lp(links_lp));
	link_lp = link_lp
		.data(bundle_lp(links_lp))
		.enter().append("path")
		.each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
		.attr("class", "link_lp")
		.attr("d", line_radial_lp)
		.style("stroke",function(d) {
				return colorgen_radial_lp_links(d.source.messages[d.source.connections.indexOf(d.target.name)]);
			})

	node_lp = node_lp
		.data(nodes_lp.filter(function(n) { return !n.children; }))
		.enter().append("text")
		.attr("class", "node_lp")
		.attr("dy", ".31em")
		.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
		.style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
		.text(function(d) { return d.key; })
		.style("stroke",function(d) { return colorgen_radial_lp(d.num_messages); })
		.on("mouseover", mouseovered_lp)
		.on("mouseout", mouseouted_lp);
}


function recreateRadialLP(classes)
{
	delete link_lp;
	delete node_lp;
	delete cluster_lp;
	delete bundle_lp;
	delete line_radial_lp;
	delete svg_radial_lp;
    d3.select(".radialgraphlp").selectAll("svg").remove();

	cluster_lp = d3.layout.cluster()
		.size([360, innerradius_lp])
		.sort(null)
		.value(function(d) { return d.size; });

	bundle_lp = d3.layout.bundle();

	line_radial_lp = d3.svg.line.radial()			//Constructs new radial line generator with default radius and angle functions
		.interpolate("bundle")
		.tension(tension_lp)
		.radius(function(d) { return d.y; })
		.angle(function(d) { return d.x / 180 * Math.PI; });

	svg_radial = d3.select(".radialgraphlp").append("svg")
		.attr("width", width_lp)
        .attr("height", height_lp)
	  	.append("g")				//Appends an element g to svg_radial variable
		.attr("transform", "translate(" + radius_lp*1  + "," + radius_lp*0.75 + ")");

	link_lp = svg_radial.append("g").selectAll(".link_lp");
	node_lp = svg_radial.append("g").selectAll(".node_lp");



	var nodes_lp = cluster_lp.nodes(packageHierarchy_lp(classes,0));
	var links_lp = packageConnections_lp(nodes_lp);		//links: array of all individual connections

	//		console.log("raw nodes:",nodes);
	//        console.log("raw links:",links);
	//        console.log("bundle_lp(links_lp):",bundle_lp(links_lp));
	link_lp = link_lp
		.data(bundle_lp(links_lp))
		.enter().append("path")
		.each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
		.attr("class", "link_lp")
		.attr("d", line_radial_lp)
		.style("stroke",function(d) {
				return colorgen_radial_lp_links(d.source.messages[d.source.connections.indexOf(d.target.name)]);
			})

	node_lp = node_lp
		.data(nodes_lp.filter(function(n) { return !n.children; }))
		.enter().append("text")
		.attr("class", "node_lp")
		.attr("dy", ".31em")
		.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
		.style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
		.text(function(d) { return d.key; })
		.style("stroke",function(d) { return colorgen_radial_lp(d.num_messages); })
		.on("mouseover", mouseovered_lp)
		.on("mouseout", mouseouted_lp);
}

function mouseovered_lp(d)
{
	node_lp
		.each(function(n) { n.target = n.source = false; });

        link_lp
		.classed("link_lp--target", function(l) { if (l.target === d) return l.source.source = true; })
		.classed("link_lp--source", function(l) { if (l.source === d) return l.target.target = true; })
		.filter(function(l) { return l.target === d || l.source === d; })
        .each(function() { this.parentNode.appendChild(this); });

	node_lp
		.classed("node_lp--target", function(n) { return n.target; })
        .classed("node_lp--source", function(n) { return n.source; })
        .style("stroke","none");
}

function mouseouted_lp(d)
{
    link_lp
		.classed("link_lp--target", false)
        .classed("link_lp--source", false);

	node_lp
		.classed("node_lp--target", false)
        .classed("node_lp--source", false)
        .style("stroke",function(d) {  return colorgen_radial_lp(d.num_messages); });
}

//d3.select(self.frameElement).style("height_lp", diameter_lp + "px");

// Lazily construct the package hierarchy from class names.
function packageHierarchy_lp(classes,initial)
{
	var map = {};		//Create blank object
    
	function find(name, data) 
	{
		var lp_id = name.replace( /^\D+/g, ''); // replace all leading non-digits with nothing
		var pe_id = Math.floor(lp_id/Math.ceil(num_lp/num_pe));
		if(selected_pes_array[pe_id] != -1)
        {
			var node = map[name];	//Check if name is in our map and assign it to variable "node"
			var i;
			if (!node) //IF node for given name currently does not exist in our map then create it
			{
				node = map[name] = data || {name: name, children: []};
				if (name.length) 
				{
					if(!initial)
					{
						delete map[name].connections;
						delete node.connections;
						map[name].connections = [];
						node.connections = [];
                        
						for (var ii = 0; ii < selected_pes.length; ii++){
							if(data.connections[0])
							{
                                var tempnum = data.connections[0].replace( /^\D+/g, ''); // replace all leading non-digits with nothing
                                var tempnum1 = Math.floor(tempnum/Math.ceil(num_lp/num_pe)); //convert to PE ID
								var tempnum2 = selected_pes[ii].key.replace( /^\D+/g, ''); // replace all leading non-digits with nothing
								if(tempnum1 == tempnum2)
								{
					        		node.connections.push.apply(node.connections,data.connections);
						    		node.messages.push(data.num_messages);
						    		node.num_messages += data.num_messages;
								}
							}
						}
					}


					node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
					node.parent.children.push(node);
					node.key = name.substring(i + 1);
		            node.messages = [];
		            node.messages[0] = data.num_messages;
				}
			}
			else //If a node for given name currently exists in our map
			{
				if(name.length)
                {
                    if(initial)
                    {
                        node.connections.push.apply(node.connections,data.connections);
                        node.messages.push(data.num_messages);
                        node.num_messages += data.num_messages;
                    }
                    else
                    {
                        for (var ii = 0; ii < selected_pes.length; ii++){
                            if(data.connections[0])
                            {
                                var tempnum = data.connections[0].replace( /^\D+/g, ''); // replace all leading non-digits with nothing
                                var tempnum1 = Math.floor(tempnum/Math.ceil(num_lp/num_pe)); //convert to PE ID
                                var tempnum2 = selected_pes[ii].key.replace( /^\D+/g, ''); // replace all leading non-digits with nothing
                                if(tempnum1 == tempnum2)
                                {
                                    node.connections.push.apply(node.connections,data.connections);
                                    node.messages.push(data.num_messages);
                                    node.num_messages += data.num_messages;
                                }
                            }
                        }
                    }

				}
			}
			return node;
		}
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
function packageConnections_lp(nodes) 
{
	var map = {};
	var connections = [];

	// Compute a map from name to node.
	nodes.forEach
	(
		function(d) 
		{
     map[d.name] = d;
//     console.log("d:",d,"map[d.name]",map[d.name]);
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
