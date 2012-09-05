(function () {
    var fullTree, fullText
    var nodeMap = {}
    var fixtureMap = {}
    var edgeMap = {}
    var nodeIdList = []

    d3.json(mapName+".js.l7.l11.l9", function(ast) {
	makeNodeMap(ast)
	getRootNode(ast).hidden = false
	startTree()
	startText()
    })

    // functions
    function makeNodeMap(ast) {
	if ($.isArray(ast)) {
	    $.each(ast, function(i, v) {
		if ($.isArray(v)) {
		    makeNodeMap(v)
		}
		if (v.id) {
		    nodeMap[v.id] = v
		    nodeIdList.push(v.id)
		    v.hidden = true
		}
		if (v.class == "Fixture") {
		    fixtureMap[v.id] = v
		}
		if (v.tag === "path") {
		    var nn = v.id.split("N")
		    var n0 = "N" + nn[1]
		    var n1 = "N" + nn[2]
		    if (edgeMap[n0] === void 0) {
			edgeMap[n0] = [ ]
		    }
		    if (edgeMap[n1] === void 0) {
		    edgeMap[n1] = [ ]
		    }
		    edgeMap[n0].push(n1)
		    edgeMap[n1].push(n0)
		}
		
		if (v.elts) {
		    makeNodeMap(v.elts)
		}
	    })
		}
	if (ast.id) {
	    nodeMap[ast.id] = ast
	    nodeIdList.push(ast.id)
	    ast.hidden = true
	}
	if (ast.elts) {
	    makeNodeMap(ast.elts)
	}
    }


    function getRootNode(ast) {
	if ($.isArray(ast)) {
	    $.each(ast, function(i, v) {
		if ($.isArray(v)) {
		    makeNodeMap(v)
		}
		if (v.class = "Program") {
		    return v
		}
	    })
		}
	if (ast.class = "Program") {
	    return ast
	}
    }

    // exports
    this.fullTree = fullTree
    this.fullText = fullText
    this.nodeMap = nodeMap
    this.fixtureMap = fixtureMap
    this.edgeMap = edgeMap
    this.nodeIdList = nodeIdList

})()
