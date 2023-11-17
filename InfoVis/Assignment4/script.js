fetch("starwars-interactions/starwars-full-interactions-allCharacters.json")
  .then((response) => response.json())
  .then((data) => {
    var links = data.links;
    var nodes = data.nodes;

    // set a width and height for SVG
    const width = 600;
    const height = 570;

    // function to create instances of the graphs
    function initializeDiagram(svg, nodes, links, diagramId) {
      // force directed graph
      var simulation = d3
        .forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-7))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("link", d3.forceLink().links(links))
        .force("collission", d3.forceCollide().radius(19))
        .on("tick", tick);

      // to display character info
      var div_info = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip-info")
        .style("opacity", 0);

      var link = svg.selectAll(".link-" + diagramId);
      var node = svg.selectAll(".node-" + diagramId);

      function createLinks() {
        link = link.data(links);
        link.exit().remove();
        link = link
          .enter()
          .append("line")
          .attr("class", "link")
          .merge(link)
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y)
          // hover effect to display names when hovering over node
          .on("mouseover", function (d) {
            d3.select(this).transition().duration("50");
            // lower opacity of all links
            d3.selectAll(".link").style("opacity", 0.9);

            // get target and source
            var targetname = d3.select(this).datum().target.name;
            var sourcename = d3.select(this).datum().source.name;

            // change properties of the link that is hovered, and its sibling in other diagram
            d3.selectAll(".link")
              .filter(function (d) {
                if (d.target.name == targetname && d.source.name == sourcename)
                  return true;
                else return false;
              })
              .style("stroke", "#FFE81F")
              .style("stroke-width", "3px")
              .style("opacity", 1);

            //show character info
            div_info.transition().duration(50).style("opacity", 1);
            div_info
              .html(
                d.source.name +
                  " and " +
                  d.target.name +
                  "\n" +
                  " were in " +
                  d.value +
                  " scenes together"
              )
              .style("left", d3.event.pageX + 10 + "px")
              .style("top", d3.event.pageY - 15 + "px");
          })

          .on("mouseout", function (d) {
            d3.select(this).transition().duration("50");

            var targetname = d3.select(this).datum().target.name;
            var sourcename = d3.select(this).datum().source.name;
            d3.selectAll(".link").style("opacity", 1);
            d3.selectAll(".link")
              .filter(function (d) {
                if (d.target.name == targetname && d.source.name == sourcename)
                  return true;
                else return false;
              })
              .style("stroke", "#545454")
              .style("stroke-width", "1.5px");

            div_info.transition().duration("50").style("opacity", 0);
          });
      }

      function createNodes() {
        node = node.data(nodes);
        node.exit().remove();
        node = node
          .enter()
          .append("circle")
          .attr("class", "node")
          .attr("r", 6)
          .merge(node)
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .style("fill", function (d) {
            return d.colour;
          })
          // hover effect to display names when hovering over node
          .on("mouseover", function (d) {
            //show character info tooltip
            div_info.transition().duration(50).style("opacity", 1);
            div_info
              .html(d.name + " was in " + d.value + " scenes")
              .style("left", d3.event.pageX + 10 + "px")
              .style("top", d3.event.pageY - 15 + "px");

            // lower opacity of all nodes
            d3.selectAll(".node").style("opacity", 0.3);

            //get name of hovered node
            var name = d3.select(this).datum().name;

            // change properties of the node that is hovered, and its sibling in other diagram
            d3.selectAll(".node")
              .filter(function (d) {
                return d.name == name;
              })
              .transition()
              .duration(100)
              .style("opacity", 1)
              .attr("r", 8);
          })
          .on("mouseout", function (d) {
            div_info.transition().duration("50").style("opacity", 0);

            // reset properties of the nodes
            d3.selectAll(".node").style("opacity", 1);
            var name = d3.select(this).datum().name;
            d3.selectAll(".node")
              .filter(function (d) {
                return d.name == name;
              })
              .transition()
              .duration("50")
              .style("opacity", 1)
              .attr("r", 6);
          });
        //move the nodes on top
        node.raise();
      }

      //######################################################
      // SLIDER //
      // Code from: https://observablehq.com/@sarah37/snapping-range-slider-with-d3-brush
      // ###################################################

      layout = {
        width: 500,
        height: 620,

        margin: {
          top: 520,
          bottom: 70,
          left: 390,
          right: -70,
        },
      };

      slider = function (min, max, starting_min = min, starting_max = max) {
        var range = [min, max + 1];
        var starting_range = [starting_min, starting_max + 1];

        // set width and height of svg
        var w = layout.width;
        var h = layout.height;
        var margin = layout.margin;

        // dimensions of slider bar
        var width = w - margin.left - margin.right;
        var height = h - margin.top - margin.bottom;

        // create x scale
        var x = d3
          .scaleLinear()
          .domain(range) // data space
          .range([0, width]); // display space

        // create svg and translated g
        var svg = d3.select("svg");
        const g = svg
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // draw background lines
        // g.append("g")
        //   .selectAll("line")
        //   .data(d3.range(range[0], range[1] + 1))
        //   .enter()
        //   .append("line")
        //   .attr("x1", (d) => x(d))
        //   .attr("x2", (d) => x(d))
        //   .attr("y1", 0)
        //   .attr("y2", height)
        //   .style("stroke", "#ccc");

        // labels
        var labelL = g
          .append("text")
          .attr("id", "labelleft")
          .attr("x", 0)
          .attr("y", height + 3)
          .text(range[0]);

        var labelR = g
          .append("text")
          .attr("id", "labelright")
          .attr("x", 0)
          .attr("y", height + 3)
          .text(range[1]);

        // define brush
        var brush = d3
          .brushX()
          .extent([
            [0, 0],
            [width, height],
          ])
          .on("brush", function () {
            var s = d3.event.selection;
            // update and move labels
            labelL.attr("x", s[0]).text(Math.round(x.invert(s[0])));
            labelR.attr("x", s[1]).text(Math.round(x.invert(s[1])) - 1);
            // move brush handles
            handle.attr("display", null).attr("transform", function (d, i) {
              return "translate(" + [s[i], -height / 4] + ")";
            });
            // update view
            // if the view should only be updated after brushing is over,
            // move these two lines into the on('end') part below
            svg.node().value = s.map((d) => Math.round(x.invert(d)));
            //svg.node().dispatchEvent(new CustomEvent("input"));
            // event for range sliders
            eventHandler = d3.select("#display1 #eventhandler");
            let event = new Event("change");
            eventhandler.dispatchEvent(event);
          })
          .on("end", function () {
            if (!d3.event.sourceEvent) return;
            var d0 = d3.event.selection.map(x.invert);
            var d1 = d0.map(Math.round);
            d3.select(this).transition().call(d3.event.target.move, d1.map(x));
          });

        // append brush to g
        var gBrush = g.append("g").attr("class", "brush").call(brush);

        // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
        var brushResizePath = function (d) {
          var e = +(d.type == "e"),
            x = e ? 1 : -1,
            y = height / 2;
          return (
            "M" +
            0.5 * x +
            "," +
            y +
            "A6,6 0 0 " +
            e +
            " " +
            6.5 * x +
            "," +
            (y + 6) +
            "V" +
            (2 * y - 6) +
            "A6,6 0 0 " +
            e +
            " " +
            0.5 * x +
            "," +
            2 * y +
            "Z" +
            "M" +
            2.5 * x +
            "," +
            (y + 8) +
            "V" +
            (2 * y - 8) +
            "M" +
            4.5 * x +
            "," +
            (y + 8) +
            "V" +
            (2 * y - 8)
          );
        };

        var handle = gBrush
          .selectAll(".handle--custom")
          .data([{ type: "w" }, { type: "e" }])
          .enter()
          .append("path")
          .attr("class", "handle--custom")
          .attr("stroke", "#000")
          .attr("fill", "#eee")
          .attr("cursor", "ew-resize")
          .attr("d", brushResizePath);

        // override default behaviour - clicking outside of the selected area
        // will select a small piece there rather than deselecting everything
        // https://bl.ocks.org/mbostock/6498000
        gBrush
          .selectAll(".overlay")
          .each(function (d) {
            d.type = "selection";
          })
          .on("mousedown touchstart", brushcentered);

        function brushcentered() {
          var dx = x(1) - x(0), // Use a fixed width when recentering.
            cx = d3.mouse(this)[0],
            x0 = cx - dx / 2,
            x1 = cx + dx / 2;
          d3.select(this.parentNode).call(
            brush.move,
            x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]
          );
        }

        // select entire starting range
        gBrush.call(brush.move, starting_range.map(x));

        var getRange = function () {
          var range = d3
            .brushSelection(gBrush.node())
            .map((d) => Math.round(x.invert(d)));
          return range;
        };

        return svg.node, { getRange: getRange };
      };
      // END OF SLIDER FUNCTION
      //##############################

      //define min and max range of slider
      const minVal = Math.max.apply(
        Math,
        links.map(function (d) {
          return d.value;
        })
      );
      const maxVal = Math.min.apply(
        Math,
        links.map(function (d) {
          return d.value;
        })
      );

      // this makes sure that we only get one slider for the first diagram,
      // since there are two instances of this function there will be two automatically
      if (diagramId == 1) {
        newslider = slider(maxVal, minVal, undefined, undefined);

        d3.select("#eventhandler").on("change", function () {
          links = data.links;
          nodes = data.nodes;

          var valid_links = [];
          for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (
              link.value <= newslider.getRange()[1] &&
              link.value >= newslider.getRange()[0]
            ) {
              valid_links.push(link);
            }
          }

          links = valid_links;

          let source = links.map((d) => d.source.name);
          let target = links.map((d) => d.target.name);

          var valid_nodes = nodes.filter(function (d) {
            // leave node that is a source or a target
            return source.includes(d.name) || target.includes(d.name);
          });
          nodes = valid_nodes;

          createLinks();
          createNodes();
        });
      }

      //####################################
      // End of slider
      //####################################

      function tick() {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      }

      createLinks();
      createNodes();
    } //end of initialize function

    // initialize the first diagram
    var svg1 = d3
      .select("#diagram1")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // initialize the second diagram
    var svg2 = d3
      .select("#diagram2")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    initializeDiagram(svg2, nodes, links, 2);
    initializeDiagram(svg1, nodes, links, 1);
  });