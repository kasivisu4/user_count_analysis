//https://observablehq.com/d/4d6f1e32096eb36b
import * as d3 from "npm:d3";

const color = d3
  .scaleOrdinal()
  .domain(["home", "product", "search", "account", "other", "end"])
  .range(["#5d85cf", "#7c6561", "#da7847", "#6fb971", "#9e70cf", "#bbbbbb"]);

export function SunburstChart(
  data,
  Country = "USA",
  width = 400,
  height = 800
) {
  const partition = (data) =>
    d3.partition().size([2 * Math.PI, radius * radius])(
      d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value)
    );
  const radius = width / 2;

  const arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle(1 / radius)
    .padRadius(radius)
    .innerRadius((d) => Math.sqrt(d.y0))
    .outerRadius((d) => Math.sqrt(d.y1) - 1);

  const mousearc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .innerRadius((d) => Math.sqrt(d.y0))
    .outerRadius(radius);

  const root = partition(data);
  const svg = d3.create("svg");
  // Make this into a view, so that the currently hovered sequence is available to the breadcrumb
  const element = svg.node();
  element.value = { sequence: [], percentage: 0.0 };

  svg
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "1.5em")
    .text(Country)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .attr("font-size", "3em");

  const label = svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("fill", "white");
  // .style("visibility", "hidden");

  label
    .append("tspan")
    .attr("class", "percentage")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "-0.5em")
    .attr("font-size", "3em")
    .text("");

  //   label
  //     .append("tspan")
  //     .attr("x", 0)
  //     .attr("y", 0)
  //     .attr("dy", "-0.1em")
  //     .attr("font-size", "em")
  //     .text("active users");

  svg
    .attr("viewBox", `${-radius} ${-radius} ${width} ${width}`)
    .style("max-width", `${width}px`)
    .style("font", "5px sans-serif");

  const path = svg
    .append("g")
    .selectAll("path")
    .data(
      root.descendants().filter((d) => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth > 1 && d.x1 - d.x0 > 0.001;
      })
    )
    .join("path")
    .attr("fill", (d) => color(d.data.name))
    .attr("d", arc);

  svg
    .append("g")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseleave", () => {
      path.attr("fill-opacity", 1);
      label.style("visibility", "hidden");
      // Update the value of this view
      element.value = { sequence: [], percentage: 0.0 };
      element.dispatchEvent(new CustomEvent("input"));
    })
    .selectAll("path")
    .data(
      root.descendants().filter((d) => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth > 1 && d.x1 - d.x0 > 0.001;
      })
    )
    .join("path")
    .attr("d", mousearc)
    .on("mouseenter", (event, d) => {
      // Get the ancestors of the current segment, minus the root
      const sequence = d.ancestors().reverse().slice(1);
      // Highlight the ancestors
      path.attr("fill-opacity", (node) =>
        sequence.indexOf(node) >= 0 ? 1.0 : 0.3
      );
      const percentage = ((100 * d.value) / root.value).toPrecision(3);
      label
        .style("visibility", null)
        .select(".percentage")
        .text("Active Users:" + percentage + "%");
      // Update the value of this view with the currently hovered sequence and percentage
      element.value = { sequence, percentage };
      element.dispatchEvent(new CustomEvent("input"));
    });

  function breadcrumb() {
    const sunburst = element.value;
    console.log(sunburst, sunburst.sequence);
    const svg = d3
      .create("svg")
      .attr("viewBox", `0 0 300 40`)
      .style("font", "0.5em sans-serif")
      .style("margin", "3px");

    const g = svg
      .selectAll("g")
      .data(sunburst.sequence)
      .join("g")
      .attr("transform", (d, i) => `translate(${i * 50}, 0)`);

    g.append("polygon")
      .attr("points", breadcrumbPoints)
      .attr("fill", (d) => color(d.data.name))
      .attr("stroke", "white");

    g.append("text")
      .attr("x", (breadcrumbWidth + 10) / 2)
      .attr("y", 15)
      .attr("dy", "0.15em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text((d) => d.data.name);

    // svg
    //   .append("text")
    //   .text(
    //     sunburst.percentage > 0
    //       ? "Active Users:" + sunburst.percentage + "%"
    //       : ""
    //   )
    //   .attr("x", (sunburst.sequence.length + 0.5) * breadcrumbWidth)
    //   .attr("y", breadcrumbHeight / 2)
    //   .attr("dy", "0.5em")
    //   .attr("dx", "4em")
    //   .attr("text-anchor", "middle")
    //   .attr("fill", "white")
    //   .style("font", "1.5em sans-serif");

    return svg.node();
  }

  return { chart: element, breadcrumb };
}

const breadcrumbWidth = 50;
const breadcrumbHeight = 40;

// Generate a string that describes the points of a breadcrumb SVG polygon.
function breadcrumbPoints(d, i) {
  const tipWidth = 10;
  const points = [];
  points.push("0,0");
  points.push(`50,0`);
  points.push(`${breadcrumbWidth + tipWidth},${breadcrumbHeight / 2}`);
  points.push(`${breadcrumbWidth},${breadcrumbHeight}`);
  points.push(`0,${breadcrumbHeight}`);
  if (i > 0) {
    // Leftmost breadcrumb; don't include 6th vertex.
    points.push(`${tipWidth},${breadcrumbHeight / 2}`);
  }
  return points.join(" ");
}
