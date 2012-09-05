(function () {

function init(e) { }
function mouseMove(e) { }
function mouseUp(e) { }
function showStatus() { }

function mouseWheel() {
    var e = d3.event
}

//var nodeMap = {}
//var fixtureMap = {}
//var edgeMap = {}
var leafNodeCount = 0
var fullText
var nodeIdOffset = 1
var cluster2

var currentLine = 0
function keyPress(e) {
    e = d3.event
    e.preventDefault()
    var selection
    var offset
    switch(e.keyCode) {
    case 40:
	nodeIdOffset++
	offset = +2
	break;
    case 38:
	if (nodeIdOffset===0) {
	    return
	}
	nodeIdOffset--
	offset = -2
	break;
    }
    var n = nodeMap[nodeIdList[nodeIdOffset]]
    if (e.shiftKey && n.startCol && n.startLn && n.stopCol && n.stopLn) {
	var selection = getTextForNode(n)
	showText(selection, n)
    }
    else {
	currentLine += offset
	var selection = getText(currentLine)
	showText(selection, n)

    }
    return
}


d3.select("svg").on("keypress", keyPress)
d3.select("svg").on("mouse", mouseWheel)

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var vis2

function getText(ln) {
    if (ln==void 0) {
	ln = 0
    }
    var stopLine = lineMap[ln+100]
    var start = lineMap[ln][0].offset
    var stop = stopLine[stopLine.length-1].offset
    return fullText.slice(start, stop+1)
}

function getTextForNode(node) {

    if (!(node.startCol && node.startLn && node.stopCol && node.stopLn)) {
	node = {
	    startCol: 0,
	    startLn: 1,
	    stopCol: 100,
	    stopLn: 100
	}
    }

    var startLn = node.startLn
    var startCol = node.startCol
    var stopLn = node.stopLn
    var stopCol = node.stopCol

    var startLineTokens = lineMap[startLn>3?startLn-3:1]
    var stopLineTokens = lineMap[stopLn+3 < lineMap.length ? stopLn+3 : lineMap.length-1]
    if (!startLineTokens) {
	for (var i = startLn-3; !lineMap[i]; i++) ;
	startLineTokens = lineMap[i]
    }
    if (!stopLineTokens) {
	for (var i = startLn+100; !lineMap[i]; i--) ;
	stopLineTokens = lineMap[i]
    }
    var startTokenOffset = startLineTokens[0].offset
    var stopTokenOffset = stopLineTokens[stopLineTokens.length-1].offset

    var text = []
    for (var i=startTokenOffset; i <= stopTokenOffset; i++) {
	var n = fullText[i]
/*
	if ((n.col >= startCol && n.ln === startLn &&
	     n.col <= stopCol && n.ln === stopLn) ||
	    (n.col >= startCol && n.ln === startLn &&
	     n.ln < stopLn) ||
	    (n.col < startCol && n.ln > startLn &&
	     n.ln === stopLn) ||
	    (n.ln > startLn && n.ln < stopLn)) {
	    n.selected = true
	}
	else {
	    n.selected = false
	}
*/
	// elide interior lines
	if (false && node.hidden) {
	    if (n.ln === startLn) {
		text.push(n)
	    }
	    else if (n.ln === stopLn) {
		// leave room for a elison token
		n.ln = startLn+1
		text.push(n)
	    }
	    // otherwise ignore
	}
	else {
	    text.push(n)
	}
    }

//    $.each(firstLine, function (i, v) {
//	if (!firstNode && v.col >= startCol) {
//	    firstNode = v.offset
//	}
//    })
//    $.each(lastLine, function (i, v) {
//	if (v.col <= stopCol) {
//	    lastNode = v.offset
//	}
//    });
    currentLine = startLn
    return text // fullText.slice(firstNode, lastNode)
}


// here we has tokens according to their line number
function makeLineMap(data) {
    $.each(data, function (i, v) {
	var ln = v.ln
	if (!lineMap[ln]) {
	    lineMap[ln] = []
	}
	v.offset = i
	lineMap[ln].push(v)
    });
}

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

var txt2

function showText(data, n) {
    var width = 1500
    var height = (data[data.length-1].ln-data[0].ln)*13
    if (height < 1000)
	height = 1000

    var vis = d3.select("svg")
	.attr("width", width)
	.attr("height", height+50)

    var offset = (data[0].ln-1) * 13

    if (vis2)
	vis2.remove()

    if (txt2)
	txt2.remove()

    txt2 = vis.append("text")
	.attr("x", 10)
	.attr("y", 1030)
	.text(n.id+", ln "+data[0].ln+", "+n.class)
    
    vis2 = vis.append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(1040,"+(-offset)+")");

    var node = vis2.selectAll("g.text")
	.data(data)
      .enter().append("text")
	.attr("x", function(d) { 
	    return d.col * 6
	})
	.attr("y", function(d) {
	    return d.ln * 13
	})
//	.attr("style", function(d) {
//	    if (d.selected)
//		return "fill: rgba(0,173,209, 1"
//	    else return ""
//	})
	.text(function(d) {
	    return d.text
	})

    drawBorder(n, offset)

}

function drawBorder(node, offset){
    var x0 = +node.startCol*6
    var y0 = +node.startLn*13
    var x1 = +node.stopCol*6
    var y1 = +node.stopLn*13

    // -- if crossing xBreak, then y0 = 0
    // -- if crossing line, then y0(x) = y0(x0) + 1
    // -- and, y1(x)

    var xMin, xMax
    var xBreak = 500
    var yBreak = 1000
    var yFactor = 13
    var xFactor = 6

    var range = function () {
	// multiline
	if (y1-y0 >= yFactor || Math.floor(x0/xBreak) < Math.floor(x1/xBreak)) {
	    xMin = Math.floor(x0/xBreak) * xBreak
	    xMax = (Math.floor((x1)/xBreak) + 1) * xBreak
	}
	else {
	    xMin = x0
	    xMax = x1
	}
	return xMax - xMin
    }

    var data = d3.range(range())
	.map(function(i) {
	    return {x: xMin+i, y0: y0, y1: y1}
	})

    var area = d3.svg.area()
	.x(function(d) { return d.x })
	.y0(function(d) {
	    if (d.x <= x0) {
		return y0 + yFactor*0.3
	    }
	    else if (Math.floor(d.x/xBreak) > Math.floor(x0/xBreak)) {
		return 0
	    }
	    else {
		return y0 - yFactor*0.7
	    }
	})
	.y1(function(d) {
	    if (Math.floor(d.x/xBreak) < Math.floor(x1/xBreak)) {
		return yBreak + yFactor*0.5
	    }
	    if (d.x > x1) {
		return y1 - yFactor
	    }
	    else {
		return y1 + yFactor*0.5
	    }
	})

    // associate data with the root svg node
    var svg = vis2.datum(data)

    svg.select("path").remove()

    // insert path with shape derived from svg associated data
    svg.insert("path", ":first-child")
	.attr("d", area)
	.style("fill", "rgba(0,173,209, .5)")
	.style("fill-opacity", "0.2")
//	.attr("transform", "translate(40,"+(-offset)+")");


//    drawDot(target)

}

    function startText() {
	d3.json(mapName+".js.l7.l11.l9.l13", function(data) {
	    fullText = data
	    makeLineMap(data)
	    var n = nodeMap[nodeIdList[1]]
	    var selection = getTextForNode(n)
	    showText(selection, n)
	})
    }

    var lineMap = []
    function makeLineMap(data) {
	$.each(data, function (i, v) {
	    var ln = v.ln
	    if (!lineMap[ln]) {
		lineMap[ln] = []
	    }
	    v.offset = i
	    lineMap[ln].push(v)
	});
    }

    function updateText(id) {
	var n = nodeMap[id]
	var selection = getTextForNode(n)
	showText(selection, n)
    }





// exports

    this.init = init
    this.mouseMove = mouseMove
    this.mouseUp = mouseUp
    this.showStatus = showStatus
    this.keyPress = keyPress
    this.startText = startText
    this.updateText = updateText
})()