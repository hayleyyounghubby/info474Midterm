'use strict';

(function () {

    let data = "no data";
    let svgContainer = ""; // keep SVG reference in global scope
    let svgContainer1 = "";
    let circles = "";
    let div = "";
    let selected = "All";
    let selected1 = "All";
    const colors = {

        "Bug": "#4E79A7",

        "Dark": "#A0CBE8",

        "Electric": "#F28E2B",

        "Fairy": "#FFBE&D",

        "Fighting": "#59A14F",

        "Fire": "#8CD17D",

        "Ghost": "#B6992D",

        "Grass": "#499894",

        "Ground": "#86BCB6",

        "Ice": "#86BCB6",

        "Normal": "#E15759",

        "Poison": "#FF9D9A",

        "Psychic": "#79706E",

        "Steel": "#BAB0AC",

        "Water": "#D37295"

    }

    // load data and make scatter plot after window loads
    window.onload = function () {
        svgContainer = d3.select('body')
            .append('svg')
            .attr('width', 500)
            .attr('height', 500);

        svgContainer1 = d3.select('body')
            .append('svg')
            .attr('width', 500)
            .attr('height', 500);

        // d3.csv is basically fetch but it can be be passed a csv file as a parameter
        d3.csv("pokemon.csv")
            .then((data) => makeScatterPlot(data))
            .then((data) => dropDown(data))
            .then((data) => dropDown2(data));
    }

    function dropDown(csvData) {
        var dropDown = d3.select("#filter").append("select")
            .attr("name", "Generation");

        dropDown.append("option")
            .text("All");

        var options = dropDown.selectAll("option")
            .data(d3.map(data, function (d) { return d["Generation"]; }).keys())
            .enter()
            .append("option");

        options.text(function (d) { return d; })
            .attr("value", function (d) { return d['Generation']; });

        dropDown.on("change", function () {
            selected = this.value;
            var displayOthers = this.checked ? "inline" : "none";
            var display = this.checked ? "none" : "inline";

            if (selected == "All" && selected1 == "All") {
                svgContainer.selectAll("circle")
                    .attr("display", display);
            } else if (selected1 == "All") {
                svgContainer.selectAll("circle")
                    .attr("display", display);

                svgContainer.selectAll("circle")
                    .filter(function (d) { return selected != d['Generation']; })
                    .attr("display", displayOthers);
            } else if (selected == "All") {
                svgContainer.selectAll("circle")
                    .attr("display", display);

                svgContainer.selectAll("circle")
                    .filter(function (d) { return selected1 != d['Legendary']; })
                    .attr("display", displayOthers);
            } else {
                svgContainer.selectAll("circle")
                    .attr("display", displayOthers);

                svgContainer.selectAll("circle")
                    .filter(function (d) { return selected1 == d['Legendary'] & selected == d['Generation']; })
                    .attr("display", display);
            }
        });
    }

    function dropDown2(csvData) {
        var dropDown = d3.select("#yearfilter").append("select")
            .attr("name", "Legendary");

        dropDown.append("option")
            .text("All");

        var options = dropDown.selectAll("option")
            .data(d3.map(data, function (d) { return d['Legendary']; }).keys())
            .enter()
            .append("option");

        options.text(function (d) { return d; })
            .attr("value", function (d) { return d['Legendary']; });

        dropDown.append("option")
            .text("False")
            .attr("value", "False");

        dropDown.on("change", function () {
            selected1 = this.value;
            var displayOthers = this.checked ? "inline" : "none";
            var display = this.checked ? "none" : "inline";

            if (selected1 == "All" && selected == "All") {
                svgContainer.selectAll("circle")
                    .attr("display", display);
            } else if (selected == "All") {
                svgContainer.selectAll("circle")
                    .attr("display", display);

                svgContainer.selectAll("circle")
                    .filter(function (d) { return selected1 != d['Legendary']; })
                    .attr("display", displayOthers);

            } else if (selected1 == "All") {
                svgContainer.selectAll("circle")
                    .attr("display", display);

                svgContainer.selectAll("circle")
                    .filter(function (d) { return selected != d['Generation']; })
                    .attr("display", displayOthers);
            } else {
                svgContainer.selectAll("circle")
                    .attr("display", displayOthers);

                svgContainer.selectAll("circle")
                    .filter(function (d) { return selected1 == d['Legendary'] && selected == d['Generation']; })
                    .attr("display", display);
            }
        });
    }

    // make scatter plot with trend line
    function makeScatterPlot(csvData) {
        data = csvData // assign data as global variable

        // get arrays of fertility rate data and life Expectancy data
        let sp_def_data = data.map((row) => parseFloat(row["Sp. Def"]));
        let total_data = data.map((row) => parseFloat(row["Total"]));

        // find data limits
        let axesLimits = findMinMax(sp_def_data, total_data);

        // draw axes and return scaling + mapping functions
        let mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total");

        // plot data as points and add tooltip functionality
        plotData(mapFunctions);

        // draw title and axes labels
        makeLabels();
    }

    // make title and axes labels
    function makeLabels() {
        svgContainer.append('text')
            .attr('x', 100)
            .attr('y', 40)
            .style('font-size', '14pt')
            .text("Pokemon: Special Defense vs Total Stats");

        svgContainer.append('text')
            .attr('x', 220)
            .attr('y', 490)
            .style('font-size', '10pt')
            .text('Sp. Def');

        svgContainer.append('text')
            .attr('transform', 'translate(15, 260)rotate(-90)')
            .style('font-size', '10pt')
            .text('Total');
    }

    // plot all the data points on the SVG
    // and add tooltip functionality
    function plotData(map) {

        // mapping functions
        let xMap = map.x;
        let yMap = map.y;


        // make tooltip
        div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // append data to SVG and plot as points
        circles = svgContainer.selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', xMap)
            .attr('cy', yMap)
            .attr('r', 5)
            //   .attr('fill', "#4286f4")
            .attr('fill', (d) => { return colors[d["Type 1"]]; })
            // add tooltip functionality to points
            .on("mouseover", (d) => {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(d["Name"] + "<br/>" + d["Type 1"] + "<br/>" + d["Type 2"])
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", (d) => {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        svgContainer1.selectAll("mydots")
            .data(Object.keys(colors))
            .enter()
            .append("circle")
            .attr("cx", 100)
            .attr("cy", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", (d) => { return colors[d]; });

        svgContainer1.selectAll("mylabels")
            .data(Object.keys(colors))
            .enter()
            .append("text")
            .attr("x", 120)
            .attr("y", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
            //   .style("fill", function(d){ return color(d)})
            .text(function (d) { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

    }

    // draw the axes and ticks
    function drawAxes(limits, x, y) {
        // return x value from a row of data
        let xValue = function (d) { return +d[x]; }

        // function to scale x value
        let xScale = d3.scaleLinear()
            .domain([limits.xMin - 0.5, limits.xMax + 0.5]) // give domain buffer room
            .range([50, 450]);

        // xMap returns a scaled x value from a row of data
        let xMap = function (d) { return xScale(xValue(d)); };

        // plot x-axis at bottom of SVG
        let xAxis = d3.axisBottom().scale(xScale);
        svgContainer.append("g")
            .attr('transform', 'translate(0, 450)')
            .call(xAxis);

        // return y value from a row of data
        let yValue = function (d) { return +d[y] }

        // function to scale y
        let yScale = d3.scaleLinear()
            .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
            .range([50, 450]);

        // yMap returns a scaled y value from a row of data
        let yMap = function (d) { return yScale(yValue(d)); };

        // plot y-axis at the left of SVG
        let yAxis = d3.axisLeft().scale(yScale);
        svgContainer.append('g')
            .attr('transform', 'translate(50, 0)')
            .call(yAxis);

        // return mapping and scaling functions
        return {
            x: xMap,
            y: yMap,
            xScale: xScale,
            yScale: yScale
        };
    }

    // find min and max for arrays of x and y
    function findMinMax(x, y) {

        // get min/max x values
        let xMin = d3.min(x);
        let xMax = d3.max(x);

        // get min/max y values
        let yMin = d3.min(y);
        let yMax = d3.max(y);

        // return formatted min/max data as an object
        return {
            xMin: xMin,
            xMax: xMax,
            yMin: yMin,
            yMax: yMax
        }
    }


})();
