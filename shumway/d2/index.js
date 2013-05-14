/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
(function () {
  var diameter = 1200;

  var tree = d3.layout.tree()
    .size([360, diameter / 2 - 120])
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

  var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

  var svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

  var root;
  var color = 0x0fffff
  var nodes, links;
  d3.json("graph.json", function(r) {
    root = r;  // set global
    redraw(r);
  });

  function redraw(root) {
    root = new TreeTrimmer({site: "www.youtube.com"}).trim(root);
//    root = new TreeTrimmer({site: "www.facebook.com"}).trim(root);
    nodes = tree.nodes(root);
    links = tree.links(nodes);

    var link = svg.selectAll(".link")
      .data(links)

    link.enter().append("path")

    link.attr("class", "link")
      .attr("d", diagonal)

    link.exit().remove()


    var node = svg.selectAll(".node")
      .data(nodes)

    var enter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ") translate(" + d.y + ")"; })

    enter.append("circle")
      .attr("r", 3.5)
      .attr("onclick", "filter(evt.target)")
      .style("fill", function (d) {
        var rgb;
        if (d.status == 1) {
          return "green";
        } else if (d.status < .1) {
          return "red";
        }
        return "yellow";
      })
//      .style("stroke", "green");

    enter.append("text")
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180) translate(-8)"; })
      .text(function(d) {
        var status = d.status;
        if (status < 1 && status > 0 && status != .5) {
          status = " " + Math.round(d.status * 100) + "%";
        } else {
          status = "";
        }
        return d.name + status;
      });

    node.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ") translate(" + d.y + ")"; })

    node.exit().remove();


  }

  function filter(node) {
    node = node;
    var parent = node.__data__.parent.children
    for (var i = 0; i < parent.length; i++) {
      if (parent[i].name === node.__data__.name) {
        var found = true;
      }
      if (found) {
        parent[i] = parent[i + 1];
      }
    }
    if (found) {
      parent.length = parent.length - 1;
      node.parentNode.remove();
    }
    redraw(root);
  }

  d3.select(self.frameElement).style("height", diameter + "px");

  function TreeTrimmer(params) {
    var site = params.site;
    function trim(node) {
      return visit(node, {
        leaf: function (n) {
          if (n.sites && n.sites.indexOf(site) >= 0) {
            return n;
          }
          return null;
        },
        branch: function(n) {
          var children = n.children;
          var self = this;
          var children = [];
          n.children.forEach(function (v, i) {
            var c = visit(v, self);
            if (c) {
              children.push(c);
              var status = n.status ? n.status : 0;
              n.status = (status * i + +c.status) / (i + 1);
            }
          });
          if (children.length > 0) {
            n.children = children;
            return n;
          }
          return null;
        },
      });
    }
    this.trim = trim;
    function visit(node, trimmer) {
      if (node.children) {
        return trimmer.branch(node);
      } else {
        return trimmer.leaf(node);
      }
    }
  }

})();
