import * as d3 from "npm:d3";
export function groupBy(data, src, tgt) {
  let flatRollup = d3.flatRollup(
    data,
    (count) => d3.sum(count, (v) => v["Active user count"]),
    (d) => d[src],
    (d) => d[tgt]
  );

  return flatRollup.map(([source, target, value]) => ({
    source: src + ":" + (source != undefined ? source : "Active Users"),
    target: tgt + ":" + target,
    value,
  }));
}
