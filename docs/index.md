---
theme: dashboard
title: Active User Analysis
toc: false
---

# Active Users

<!-- Load and transform the data -->

```js
const data = FileAttachment("./data/sankey.csv").csv({typed: true});
import SankeyChart from "./components/sankey.js"
import {table2Tree} from "./data/table2tree.js"
import {SunburstChart} from "./components/sunburst.js"
import {groupBy} from "./data/groupBy.js"
import {html} from "npm:htl";
```

```js
let groupByData =  [...groupBy(data,'','Continent'), ...groupBy(data,'Continent','Country')]
let sankeyChart = SankeyChart(
  {
    links: groupByData
  },
  {
    nodeGroup: (d) => d.id,
    nodeSort: (d) => d.src,
    nodeLabel: (d) => d.id.split(":")[1],
    width: 0.6 * width,
    align: "left",
    height: 800
  }
)
sankeyChart.addEventListener("click",(e)=>{
    if(e.target.tagName === "rect" ){
        let [col,val] = e.target.__data__.id.split(":")
        if(col != "Country"){
            return
        }
        let  filteredData = data.filter(d=>d[col]===val)
        let {chart:newChart, breadCrumbDiv:newBreadCrumbDiv} = generateSunBurstChart(filteredData, val)
        sunburstDiv.replaceChildren(newChart)
        breadCrumbDiv.replaceChildren(newBreadCrumbDiv)
        tableDiv.replaceChildren(generateTable(val))
    }})

```

```js
function generateSunBurstChart(data, Country){
let heirarchical_data = table2Tree(
  data,
  ["Country", "State", "City"],
  (v) => d3.sum(v, (d) => d["Active user count"])
)


let {chart, breadcrumb} = SunburstChart(heirarchical_data, Country)
let breadCrumbDiv = html`<div>${breadcrumb()}</div>`

chart.addEventListener("input",(d)=>{
    console.log("input", breadcrumb())

     breadCrumbDiv.replaceChildren(breadcrumb());
})

return {chart, breadCrumbDiv}
}
```

```js
let {chart, breadCrumbDiv} = generateSunBurstChart(data.filter(d=>d.Country==="United States"), "United States")
let sunburstDiv = html`<div>${chart}</div>`
```

```js
function generateTable(country){
      return Inputs.table(data.filter(d=>d.Country === country), {columns : ["State","City","Active user count"]})}
```

```js
let tableDiv = html`<div>${generateTable("United States")}</div>`

```

<div class="grid grid-cols-2" style="grid-template-columns: 65% 35%">
<div class="card">
    <h2>Total Active Users</h2>
    <span class="big">${d3.sum(data, (d) => d["Active user count"]).toLocaleString("en-US")}</span>
</div>
<div class="" style="margin-left:60px">
     ${breadCrumbDiv}
</div> 
</div>





<div class="grid grid-cols-2;" style="grid-template-columns: 65% 35%">
    <div class="card">
    <h5> * Click the <b><u>country</u></b> to get <i>state wise</i> & <i>city wise </i> active users </h5>
${sankeyChart}
  </div>
<div class="card" >
    <h2 style = "margin-bottom:40px">Country Wise Active Users</h2>
    ${sunburstDiv}
    <h5 style="margin-top:10px">* Hover on the State/City to know active users  % </h5>
    <div class="grid">
  <div class="card" style='margin-top:50px'>
  ${tableDiv}
  </div>
</div>

</div> 
   </div>
</div>