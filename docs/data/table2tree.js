import * as d3 from "npm:d3";
//https://observablehq.com/@john-guerra/table-2-tree
export function table2Tree(data, attribs, value = undefined) {
  const valueFn = (v) =>
    value === undefined
      ? v.length // Default value count nodes
      : value instanceof Function // If value is a function just pass it
      ? value(v)
      : d3.sum(v, (d) => +d[value]); // If value is not a function assume it is an attribute and sum it

  return rollupsToTree(
    d3.rollups(...[data, valueFn].concat(...attribs.map((a) => (d) => d[a])))
  );
}

let rollupsToTree = function (rollupsData) {
  const makeTreeNode = (d) => {
    let res = {
      name: "" + d[0],
    };

    if (Array.isArray(d[1])) res.children = rollupsToTree(d[1]);
    else res.value = d[1];
    return res;
  };

  function rollupsToTree(groupedData) {
    if (!groupedData) return;

    return groupedData.map(makeTreeNode);
  }

  return {
    name: "",
    children: Array.isArray(rollupsData)
      ? rollupsToTree(rollupsData)
      : [{ name: "", value: rollupsData }],
  };
};
