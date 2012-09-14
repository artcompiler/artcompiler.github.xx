(function () {
    var fullTree, fullText, fullAst
    var nodeMap = {}
    var fixtureMap = {}
    var edgeMap = {}
    var nodeIdList = []
    var rootNode

    d3.json(mapName+".js.l7.l9", function(ast) {
	d3.json(mapName+".js.l7.l11", function(edges) {
	    makeNodeMap(ast, "root")
	    makeEdgeMap(edges)
	    rootNode.hidden = false
	    startTree()
	    startText()
	    startGraph()
	    this.rootNode = rootNode
	})
    })

    // functions
    function makeNodeMap(ast, parent) {
	if ($.isArray(ast)) {
	    $.each(ast, function(i, v) {
		makeNodeMap(v, parent)
	    });
	}
	else {
	    if (ast.id) {
		nodeMap[ast.id] = ast
		nodeIdList.push(ast.id)
		ast.hidden = true
		ast.parent = parent
	    }
	    if (ast.class == "Fixture") {
		fixtureMap[ast.id] = ast
	    } 
	    if (ast.class == "Program") {
		rootNode = ast
	    }
	    if (ast.elts) {
		makeNodeMap(ast.elts, ast.id)
	    }
	}

    }

    function makeEdgeMap(edges) {
	$.each(edges, function (i, v) {
	    var n0 = nodeMap[v.id]
	    var n0Parents = getParents(n0.id)    // parents include original child
	    $.each(v.edges, function (i, v) {
		var n1 = nodeMap[v.id]
		var n1Parents = getParents(n1.id)
		$.each(n0Parents, function (i0, v0) {
		    $.each(n1Parents, function (i1, v1) {
			if (edgeMap[v0] === void 0) {
			    edgeMap[v0] = []
			}
			if (edgeMap[v1] === void 0) {
			    edgeMap[v1] = []
			}
			if (edgeMap[v0].indexOf(v1) < 0) {
			    edgeMap[v0].push(v1)
			}
			if (edgeMap[v1].indexOf(v0) < 0) {
			    edgeMap[v1].push(v0)
			}
		    });
		});
	    });
	});
    }

    function getParents(n) {
	var parents = []
	var node = nodeMap[n]
	parents.push(node.id)   // include the child too
	while (node.parent) {
	    parents.push(node.parent)
	    node = node.parent
	}
	return parents
    }


    // exports
    this.fullAst = fullAst
    this.fullText = fullText
    this.nodeMap = nodeMap
    this.fixtureMap = fixtureMap
    this.edgeMap = edgeMap
    this.nodeIdList = nodeIdList
    this.canvasWidth = 2500


})()
