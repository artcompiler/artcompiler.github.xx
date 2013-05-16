/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */

var redraw;

(function () {
  var diameter = 1200;

  var sites = [
    "www.youtube.com",
    "beta.abc.go.com_shows",
    "live.wsj.com",
    "movies.uk.msn.com",
    "video.foxnews.com",
    "vimeo.com",
    "www.aljazeera.com_video_",
    "www.bbc.co.uk",
    "www.bing.com_?scope=video",
    "www.cbc.ca_player",
    "www.cnn.com_video",
    "www.dailymotion.com",
    "www.funnyordie.com",
    "www.grindtv.com",
    "www.guardian.co.uk_video",
    "www.hulu.com",
    "www.liveleak.com",
    "www.nbc.com_video_",
    "www.ted.com",
    "www.twitch.tv",
    "www.ustream.tv_new",
    "www.vevo.com",
    "www.facebook.com",
  ];

  var red = "rgb(246, 21, 49)";
  var yellow = "rgb(255, 199, 11)";
  var blue = "rgb(0, 92, 173)";
  var green = "rgb(55, 135, 98)";

  var chooserText = [
    "<b>This page shows the Shumway implementation status for the native Flash APIs ",
    "used by the top video sites.</b> Choose a video site to see the status of the ",
    "Shumway implementation. <font class='green'>Green is good</font>. ",
    "<font class='red'>Red is bad</font>. <font class='yellow'>Yellow is ",
    "somewhere in between</font>. (% indicates completion rate, if not 100%, 50% or >10%.)",
    "The source code can be found here: ",
    "<a href='https://github.com/artcompiler/P105'>https://github.com/artcompiler/P105</a>. ",
    "</p><p><b>Warning:</b> The data used to derive this graph is a rough ",
    "approximation of reality. We plan to automate the data collection from unit ",
    "tests to make it more timely and accurate.</p>",
    ].join("");

  var tr = d3.select(".chooser").selectAll("p")
      .data([1])
    .enter().append("p")
      .attr("class", "chooser-text")
      .html(chooserText);

  var tr = d3.select(".chooser").selectAll("span").data(sites).enter()
    .append("span")
    .attr("class", "chooser-item");
 
  tr.append("input")
      .attr("type", "radio")
      .attr("name", "site")
      .attr("value", function (d) {
        return d;
      })
      .attr("title", function (d) {
        return d;
      })
      .attr("onclick", function (d) { return "redraw('"+this.value+"')"})

  tr.append("text")
      .text(function (d) { return d; });

  tr.select("input[value='www.youtube.com']").attr("checked", "true");

  var rootNode;
  var color = 0x0fffff
  var nodes, links;
  d3.json("graph.json", function(r) {
    rootNode = r;  // set global
    redraw("www.youtube.com");
  });

  redraw = function redraw(site) {
    d3.select("body").selectAll("svg").remove();

    svg = d3.select("body").append("svg")
    .attr("class", "graph")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
    var r = new TreeTrimmer({site: site}).trim(JSON.parse(JSON.stringify(rootNode)));

    var tree = d3.layout.tree()
      .size([360, diameter / 2 - 120])
      .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    nodes = tree.nodes(r);
    links = tree.links(nodes);

    var diagonal = d3.svg.diagonal.radial()
      .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
    
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
      .style("fill", function (d) {
        var rgb;
        if (d.status == 1) {
          return green;
        } else if (d.status < .1) {
          return red;
        }
        return yellow;
      })
      .style("stroke", function (d) {
        var rgb;
        if (d.status == 1) {
          return green;
        } else if (d.status < .1) {
          return red;
        }
        return yellow;
      })
      .attr("title", function(d) {
        var status = d.status;
        if (status < 1 && status > 0 && status != .5) {
          status = " " + Math.round(d.status * 100) + "%";
        } else {
          status = "";
        }
        return d.name + status;
      });


    enter.append("text")
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180) translate(-8)"; })
      .text(function(d) {
        var status = d.status;
        if (status < 1 && status > 0 && status != .5) {
          status = Math.round(d.status * 100) + "%";
        } else {
          status = "";
        }

        if (d.name === "root") {
          d3.select(".title").select("text").html(site + " (" + status + " complete)");
        }
        return d.name + " " + status;
      })

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
    redraw("");
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
          var count = 0;
          n.children.forEach(function (v, i) {
            var c = visit(v, self);
            if (c) {
              children.push(c);
              var status = n.status ? n.status : 0;
              n.status = (status * count + +c.status) / (count++ + 1);
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
