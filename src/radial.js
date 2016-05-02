//TODO javascript for radial view of PEs goes here

var diameter = 600;
var width = 600;
var height = 450;
var radius = diameter / 2;
var innerRadius = radius - 120;
var call_count = 0;

var cluster;
var bundle;
var line_radial;
var svg_radial;
var link;
var node;


var colorgen_radial_links = d3.scale.ordinal()
.range(["#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]);

var colorgen_radial = d3.scale.ordinal()
.range(["#d0d1e6","#a6bddb",
        "#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]);
        
var color_radial = function(d) {  return colorgen_radial(d.batch); };

function createRadialPE(classes)
{
call_count++;

cluster = d3.layout.cluster()
		.size([360, innerRadius])
		.sort(null)
		.value(function(d) { return d.size; });

bundle = d3.layout.bundle();

line_radial = d3.svg.line.radial()			//Constructs new radial line generator with default radius and angle functions
		.interpolate("bundle")
		.tension(.35)
		.radius(function(d) { return d.y; })
		.angle(function(d) { return d.x / 180 * Math.PI; });

svg_radial = d3.select(".radialgraph").append("svg")
		.attr("width", width)
        .attr("height", height)
	  	.append("g")				//Appends an element g to svg_radial variable
		.attr("transform", "translate(" + radius*1  + "," + radius*0.75 + ")");

link = svg_radial.append("g").selectAll(".link");
node = svg_radial.append("g").selectAll(".node");

	var nodes = cluster.nodes(packageHierarchy(classes,1));
	var links = packageConnections(nodes);		//links: array of all individual connections
    
console.log("nodes:",nodes);
console.log("links:",links);

	link = link
		.data(bundle(links))
		.enter().append("path")
		.each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
		.attr("class", "link")
		.attr("d", line_radial)
		.style("stroke",function(d) { return colorgen_radial_lp_links(d.source.messages[d.source.connections.indexOf(d.target.name)]);})

	node = node
		.data(nodes.filter(function(n) { return !n.children; }))
		.enter().append("text")
		.attr("class", "node")
		.attr("dy", ".31em")
		.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
		.style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
		.text(function(d) { return d.key; })
		.style("stroke",function(d) {  return colorgen_radial(d.num_messages); })
		.on("mouseover", mouseovered)
		.on("mouseout", mouseouted);


};

function recreateRadialPE(classes)
{
	delete link;
	delete node;
	delete cluster;
	delete bundle;
	delete line_radial;
	delete svg_radial;
	d3.select(".radialgraph").selectAll("svg").remove();

	cluster = d3.layout.cluster()
			.size([360, innerRadius])
			.sort(null)
			.value(function(d) { return d.size; });

	bundle = d3.layout.bundle();

	line_radial = d3.svg.line.radial()			//Constructs new radial line generator with default radius and angle functions
			.interpolate("bundle")
			.tension(.35)
			.radius(function(d) { return d.y; })
			.angle(function(d) { return d.x / 180 * Math.PI; });

	svg_radial = d3.select(".radialgraph").append("svg")
			.attr("width", width)
		    .attr("height", height)
		  	.append("g")				//Appends an element g to svg_radial variable
			.attr("transform", "translate(" + radius*1  + "," + radius*0.75 + ")");

	link = svg_radial.append("g").selectAll(".link");
	node = svg_radial.append("g").selectAll(".node");


	var nodes = cluster.nodes(packageHierarchy(classes,0));
	var links = packageConnections(nodes);		//links: array of all individual connections
   
	link = link
		.data(bundle(links))
		.enter().append("path")
		.each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
		.attr("class", "link")
		.attr("d", line_radial)
		.style("stroke",function(d) { return colorgen_radial_lp_links(d.source.messages[d.source.connections.indexOf(d.target.name)]);})

	node = node
		.data(nodes.filter(function(n) { return !n.children; }))
		.enter().append("text")
		.attr("class", "node")
		.attr("dy", ".31em")
		.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
		.style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
		.text(function(d) { return d.key; })
		.style("stroke",function(d) {  return colorgen_radial(d.num_messages); })
		.on("mouseover", mouseovered)
		.on("mouseout", mouseouted);
};

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
        .style("stroke",function(d) {  return colorgen_radial(d.num_messages); });
}

//d3.select(self.frameElement).style("height", diameter + "px");

// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes,initial) 
{
	var map = {};

	function find(name, data) 
	{
        var thenum = name.replace( /^\D+/g, ''); // replace all leading non-digits with nothing
		if(selected_pes_array[thenum] != -1)
        {
if(!initial){
console.log("--------------PE",thenum," selected----------------");
}
			var node = map[name];	//Check if name is in our map and assign it to variable "node"

			var i;
			if (!node) //IF node for given name currently does not exist in our map then create it
			{
console.log("node did not exist in map")
				node = map[name] = data || {name: name, children: []};
				console.log("Node created",node);
console.log("name.length",name.length);
				if (name.length) //If the node has a name
				{
console.log("name.length was true");
console.log("name.substring",name.substring(0, i = name.lastIndexOf(".")));

					if(!initial)
					{
console.log("map going in:", map[name]);
console.log("node going in:",node);
						delete map[name].connections;
						delete node.connections;
						map[name].connections = [];
						node.connections = [];

console.log("map stage 2:", map[name]);
console.log("node stage 2:",node);

						for (var ii = 0; ii < selected_pes.length; ii++){
							if(data.connections[0])
							{
								var tempnum1 = data.connections[0].replace( /^\D+/g, ''); // replace all leading non-digits with nothing
								var tempnum2 = selected_pes[ii].key.replace( /^\D+/g, ''); // replace all leading non-digits with nothing
								if(tempnum1 == tempnum2)
								{
console.log("node.connections:",node.connections);
console.log("data.connections:".data);
					        		node.connections.push.apply(node.connections,data.connections);
						    		node.messages.push(data.num_messages);
						    		node.num_messages += data.num_messages;
								}
							}
						}
console.log("map coming out:", map[name]);
console.log("node coming out:",node);
					}


					node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
					node.parent.children.push(node);
		            node.key = name.substring(i + 1);
		            node.messages = [];
		            node.messages[0] = data.num_messages;
				}
console.log("exiting node creation for node",node);
			}
			else
			{
console.log("node existed in map");
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
//	delete node.connections;
						for (var ii = 0; ii < selected_pes.length; ii++){
							if(data.connections[0])
							{
								var tempnum1 = data.connections[0].replace( /^\D+/g, ''); // replace all leading non-digits with nothing
								var tempnum2 = selected_pes[ii].key.replace( /^\D+/g, ''); // replace all leading non-digits with nothing
								if(tempnum1 == tempnum2)
								{
console.log("node.connections:",node.connections);
console.log("data.connections:".data);
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
		else
		{
console.log("PE",thenum," was not selected");
		}	
	}

	classes.forEach(
		function(d) 
		{
if(!initial){
console.log("###################################");
console.log("d",d);
}
			find(d.name, d);
		}
    
	);
console.log("map[ ]",map[""]);
	return map[""];
}

// Return a list of connections for the given array of nodes.
// Need to do something here to omit connections to PEs above num_pe
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
//     console.log("d:",d,"map[d.name]",map[d.name]);
		}
	);

	// For each connection, construct a link from the source to target node.
	nodes.forEach
	(
		function(d) 
		{//console.log("d",d);
//console.log("d.connections:",d.connections);
			if (d.connections) 
				d.connections.forEach
				(
					function(i) 
					{
                        connections.push({source: map[d.name], target: map[i]});
 //                		console.log("node name:",d.name,"i:",i,"node connections:",connections,"d connections:",d.connections);
					}
				);
		}
	);
	return connections;
}
