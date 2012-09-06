(function() {
    packages = {

	// Lazily construct the package hierarchy from class names.
	root: function(classes) {
	    var map = {};

	    function find(name, data) {
		var node = map[name], i;
		if (!node) {
		    node = map[name] = data || {name: name, children: []};
		    if (name.length) {
			node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
			node.parent.children.push(node);
			node.key = name.substring(i + 1);
		    }
		}
		return node;
	    }

	    classes.forEach(function(d) {
		find(d.name, d);
	    });

	    return map[""];
	},

	// Return a list of imports for the given array of nodes.
	imports: function(nodes) {
	    var map = {},
            imports = [];

	    // Compute a map from name to node.
	    nodes.forEach(function(d) {
		map[d.name] = d;
	    });

	    // For each import, construct a link from the source to target node.
	    nodes.forEach(function(d) {
		if (d.imports) d.imports.forEach(function(i) {
		    imports.push({source: map[d.name], target: map[i]});
		});
	    });

	    return imports;
	}

    };

    var radius = 960 / 2,
    splines = [];

    var cluster = d3.layout.cluster()
	.size([360, radius - 120])
	.sort(null)
	.value(function(d) { return d.size; });

    var bundle = d3.layout.bundle();

    var line = d3.svg.line.radial()
	.interpolate("bundle")
	.tension(.85)
	.radius(function(d) { return d.y; })
	.angle(function(d) { return d.x / 180 * Math.PI; });

    var prevCanvasWidth = this.canvasWidth
    this.canvasWidth = this.canvasWidth + radius*2

    var vis = d3.select(".main").append("svg")
	.append("g")
	.attr("width", this.canvasWidth)
	.attr("height", this.canvasHeight)
	.attr("transform", "translate(" + (prevCanvasWidth+radius) + "," + radius + ")");

    function showGraph(classes) {
	vis.selectAll("g.node").remove()
	vis.selectAll("path.link").remove()
	var nodes = cluster.nodes(packages.root(classes)),
        links = packages.imports(nodes);

	vis.selectAll("path.link")
	    .data(splines = bundle(links))
	    .enter().append("path")
	    .attr("class", "link")
	    .attr("stroke", "steelblue")
	    .attr("fill", "none")
	    .attr("d", line);

	vis.selectAll("g.node")
	    .data(nodes.filter(function(n) { return !n.children; }))
	    .enter().append("g")
	    .attr("class", "node")
	    .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
	    .append("text")
	    .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
	    .attr("dy", ".31em")
	    .attr("fill", "grey")
	    .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
	    .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
	    .text(function(d) { return d.key; });
    }

    d3.select(window).on("mousedown", function() {
	var id = d3.event.target.firstChild.wholeText
	var classes = getChildren(id)
	showGraph(classes)
    });

    d3.json("todos.js.l7.l11", function(data) {
	var classes = []
	$.each(data, function(i, v) {
	    var imports = []
	    $.each(v.edges, function(i, v) {
		imports.push(v.id)
	    })
		classes.push({name: v.id, label: v.class, imports: imports})
	})
	    showGraph(classes)
    });

})();
