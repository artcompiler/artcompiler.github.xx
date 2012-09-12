(function () {
    var fullTree, fullText, fullAst
    var nodeMap = {}
    var fixtureMap = {}
    var edgeMap = {}
    var nodeIdList = []
    var rootNode

    d3.json(mapName+".js.l7.l9", function(ast) {
	makeNodeMap(ast, "root")
	rootNode.hidden = false
	startTree()
	startText()
	startGraph()
	this.rootNode = rootNode
    })

    // functions
    function makeNodeMap(ast, parent) {
	if ($.isArray(ast)) {
	    $.each(ast, function(i, v) {
		if ($.isArray(v)) {
		    makeNodeMap(v, parent)
		}
		if (v.id) {
		    nodeMap[v.id] = v
		    nodeIdList.push(v.id)
		    v.hidden = true
		    v.parent = parent
		}
		if (v.class == "Fixture") {
		    fixtureMap[v.id] = v
		} 
		if (v.class == "Program") {
		    rootNode = v
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
		    makeNodeMap(v.elts, v.id)
		}
	    })
		}
	if (ast.id) {
	    nodeMap[ast.id] = ast
	    nodeIdList.push(ast.id)
	    ast.hidden = true
	    ast.parent = parent
	}
	if (ast.elts) {
	    makeNodeMap(ast.elts, ast.id)
	}

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
