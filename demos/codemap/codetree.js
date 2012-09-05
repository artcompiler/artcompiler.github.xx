(function () {

function init(e) { }
function mouseMove(e) { }
function mouseUp(e) { }
function showStatus() { }

var cluster2
var leafNodeCount = 0

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var vis2

function mouseDown(e) {
    var node = d3.select(e.target)
    var id = node.attr("id")
    nodeMap[id].hidden = !nodeMap[id].hidden
    leafNodeCount = 0
    showTree(getTree(fullTree))
    updateText(id)
}

function getFixtures() {
    var classes = []
    $.each(fixtureMap, function (i, v) {
	classes.push({name: i, imports: []})
    })
    return classes
}

function getKids(node) {
    var elts = node.elts
    if (!elts) {
	return [node]
    }
    var classes = []
    $.each(elts, function (i, v) {
	classes.push({name: i, imports: []})
    })
    return classes
}

function getTree(node) {
    var kids = []
    if ($.isArray(node)) {
	$.each(node, function(i, v) {
	    var t = getTree(v)
	    if ($.isArray(t)) {
		kids = kids.concat(t)
	    }
	    else {
		kids.push(t)
	    }
	});
	return kids
    }
    else
    if (node.id && node.edges) {
	if (node.edges.length === 0 || nodeMap[node.id].hidden) {
	    leafNodeCount++
	}

	if (!nodeMap[node.id].hidden) {
	    $.each(node.edges, function(i, v) {
		var t = getTree(v)
		if ($.isArray(t)) {
		    kids = kids.concat(t)
		}
		else {
		    kids.push(t)
		}
	    });
	}
        return {name: node.id, label: node.class, children: kids}
    }
    else
    if (node.edges) {
	$.each(node.edges, function(i, v) {
	    var t = getTree(v)
	    if ($.isArray(t)) {
		kids = kids.concat(t)
	    }
	    else {
		kids.push(t)
	    }
	});
	leafNodeCount++
        return kids
    }
    else {
        return []
    }
}

function showTree(tree) {
    var width = 1000
    var height = leafNodeCount * 15
    cluster2 = d3.layout.cluster()
	.size([height, width - 250]);

  var nodes = cluster2.nodes(tree);

    var vis = d3.select("svg")
	.attr("width", width)
	.attr("height", height)

    if (vis2)
	vis2.remove()

    vis2 = vis.append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(40, 0)");

    var link = vis2.selectAll("path.link")
	.data(cluster2.links(nodes))
        .enter().append("path")
	    .attr("class", "link")
	    .attr("d", diagonal);

  var node = vis2.selectAll("g.node")
      .data(nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("id", function(d) { return d.name })
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

  node.append("circle")
	.attr("fill", function (d) { return isTerminal(d.name) ? "red" : "" })
	.attr("r", 2)

  node.append("text")
      .attr("dx", function(d) { return (d.children && d.children.length) ? 0 : 5; })
      .attr("dy", function(d) { return (d.children && d.children.length) ? 8 : 2; })
      .attr("text-anchor", function(d) { return (d.children && d.children.length) ? "end" : "start"; })
      .attr("id", function(d) { return d.name })
      .text(function(d) {
	  return (d.children && d.children.length) ? d.label : getLabel2(d.name)
      });

}

var leafNodeIds = []

function getLabel2(id) {
    var node = nodeMap[id]
    leafNodeIds.push(id)
    switch (node.class) {
    case "Fixture":
	return node.class + ": " + node.elts[1].elts[0].elts[0]
    case "Name":
	return node.class + ": "+node.elts[0].elts[0]
    case "Identifier":
    case "LiteralString":
    case "LiteralBoolean":
    case "LiteralInt":
	return node.class + ": " + node.elts[0]
    default:
	return node.class
    }
}

function isTerminal(id) {
    var node = nodeMap[id]
    switch (node.class) {
    case "Identifier":
    case "LiteralString":
    case "LiteralBoolean":
    case "LiteralInt":
    case "Name":
	return true
    case "Head":
	if (node.elts[0].length===0) { return true } else { return false }
	break
    default:
	return false
    }
}

    function startTree() {
	d3.json(mapName+".js.l7.l11.l9.l12", function(tree) {
	    fullTree = tree
	    showTree(getTree(fullTree))  
	})
    }

// exports

    this.init = init
    this.mouseMove = mouseMove
    this.mouseUp = mouseUp
    this.mouseDown = mouseDown
    this.startTree = startTree
})()