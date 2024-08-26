// chart.js
const width = 600
const yPadding = 200
const xPadding = 200

const height = 600
const pentAngle = 72;

const cx = width / 2 + xPadding
const cy = height / 2 + yPadding
const halfWidth = width / 2


const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + xPadding * 2)
    .attr("height", height + yPadding * 2)
    .style("background", "#000")
    
    
let data = [];
const features = ["Certainty", "Autonomy", "Purpose", "Belonging", "Competence"];
const featuresLength = features.length

const line = d3.line()
    .x(d => d.x)
    .y(d => d.y);
const colors = ["#C3C3C3", "#8CFF8C"];
const strokeColors = ["#FFF", "#49FF49"]


//generate the data
for (var i = 0; i < 2; i++){
    var point = {}
    //each feature will be a random number from 0-100
    features.forEach(f => point[f] = parseInt(Math.random() * 100));
    data.push(point);
}
console.log(data);

const dataScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([2, 12])

const radialScale = d3.scaleLinear()
    .domain([0, 12])
    .range([0, halfWidth]);
const ticks = [2, 4, 6, 8, 10, 12]


// // NOTE: this are here to make sure the coordinates are on point.. 
// // TODO: FIXME: Remove this
// svg.selectAll("circle")
//     .data(ticks)
//     .join(
//         enter => enter.append("circle")
//             .attr("cx", cx)
//             .attr("cy", cy)
//             .attr("fill", "none")
//             .attr("stroke", "gray")
//             .attr("r", d => radialScale(d))
//     );
    
index = 0
// coordinates1 = []
// coordinates2=[]
// coordinates3 = []
// coordinates4 = []
// coordinates5 = []
// coordinates6 = []

// all coorindates in single place .. 
coordinates = {}


while(index<(360 + 1)) {
	ticks.forEach(tick => {
  	length = radialScale(tick)
    let [xNew, yNew] = rotateLineByLength(cx, cy, length, index)
    
    if(coordinates[tick]) {
    	coordinates[tick].push([xNew, yNew])
    } else {
    	coordinates[tick] = [[xNew, yNew]]
    }
  })
	index += pentAngle
}

/* coordinates[2].forEach(coordinate1=> {
  coordinates[12].forEach(coordinate => {
  let [xNew, yNew] = coordinate
  
  svg.append("line")
  .attr("x1", coordinate1[0])
  .attr("y1", coordinate1[1])
  .attr("x2", xNew)
  .attr("y2", yNew)
  .attr("stroke", "black")
  .attr("stroke-width", 2);
})
}) */


// axes 
range = [0, 1, 2, 3, 4]
range.forEach(tick => {
	let [x1, y1] = coordinates[2][tick]
	let [x2, y2] = coordinates[12][tick]
  
  svg.append("line")
  .attr("x1", x1)
  .attr("y1", y1)
  .attr("x2", x2)
  .attr("y2", y2)
  .attr("stroke", "#fff")
  .attr("stroke-dasharray", "3, 3")
  .attr("stroke-width", 2);
})

console.log("coordinates", coordinates)

// vertical_labels
ticks.forEach((tick, index) => {
  let [x, y] = coordinates[tick][0]
  svg.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("dy", "-0.2em")
      .attr("dx", "-1.9em")
      .attr("fill", "#FFF")
      .style("font-size", "10px")
      .text(dataScale.invert(tick))

}) 


// here we draw pentagons in each circle
Object.values(coordinates).forEach(coordinateArray => {
	let index = 0
  while(index < 5) {
  	let [x1, y1] = coordinateArray[index]
    let [x2, y2] = coordinateArray[index+1]
    
    svg.append("line")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)
      .attr("stroke", "#fff")
      .attr("stroke-dasharray", "3, 3")
      .attr("stroke-width", 1.5);

    index += 1
  }
	
})

// draw the path element
svg.selectAll("path")
    .data(data)
    .join(
        enter => enter.append("path")
            .datum(d => getPathCoordinates(d))
            .attr("d", line)
            .attr("stroke-width", 3)
            .attr("stroke", (_, i) => strokeColors[i])
            .attr("fill", (_, i) => colors[i])
            .attr("stroke-opacity", 1)
            .attr("opacity", (_, i) => i == 0 ? "0.35" : "0.7")
    );


features.forEach((feature, i) => {
  // -i is required to move / rotate in clockwise direction
  let angle = Math.PI / 2 + (2 * Math.PI * -i) / featuresLength;
  let x = Math.cos(angle) * radialScale(13);
  let y = Math.sin(angle) * radialScale(13);
  let benchDiff = data[1][feature] - data[0][feature]

  const edgeTexts = svg
                      .append('text')
                      .attr('x', cx + x)
                      .attr('y', cy - y)
                      .attr('dy', feature == 'Certainty' ? '-1em' : '0.35em')
                      .attr("dx", feature == 'Autonomy' ? '2.35em' : (feature == "Competence" ? '-6.35em' : ""))
                      .attr('fill', 'white')
                      .attr("text-anchor", "middle")
                      .text(`${feature}`)

  edgeTexts.append("tspan")
            .text(`${data[1][feature]} ( ${benchDiff < 0 ? "-" : "+"}${Math.abs(benchDiff)})`)
            .attr('x', cx + x)
            .attr("dx", feature == 'Autonomy' ? '2.35em' : (feature == "Competence" ? '-6.35em' : ""))
            .attr("dy", "20")
            .attr("fill", benchDiff < 0 ? "red" : "green")
});

// data.forEach(datum => {
//   coordinates = getPathCoordinates(datum)

//   console.log("Object.values(datum) : ", Object.values(datum))

//   coordinates.forEach((coordinate, i) => {
//     console.log("coordinate: ", coordinate['x'])
//     svg.append("text")
//     // .append("text.value")
//       .attr("x", coordinate['x'])
//       .attr("y", coordinate['y'])
//       .text(Object.values(datum)[i])
//       .style("fill", "#fff")
//   })
// })



  
  
function rotateLine(x1, y1, x2, y2, angle) {
  // Calculate the angle of the original line
  const angleOriginal = Math.atan2(y2 - y1, x2 - x1);

  // Calculate the angle of the rotated line
  const angleRotated = angleOriginal + angle * Math.PI / 180;

  // Calculate the length of the line
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  // Calculate the new x and y coordinates
  const xNew = x1 + length * Math.cos(angleRotated);
  const yNew = y1 + length * Math.sin(angleRotated);

  return [ xNew, yNew ];
}

function rotateLineByLength(x1, y1, length, angle) {
	// Calculate the angle of the original line
  //const angleOriginal = Math.atan2(y2 - y1, x2 - x1);
  
  const angleOriginal = -90 * Math.PI / 180
  
  // Calculate the angle of the rotated line
  const angleRotated = angleOriginal + angle * Math.PI / 180;
  
  // Calculate the new x and y coordinates
  const xNew = x1 + length * Math.cos(angleRotated);
  const yNew = y1 + length * Math.sin(angleRotated);

  return [ xNew, yNew ];
}

function getPathCoordinates(data_point){
  let coordinates = [];
  for (var i = 0; i < featuresLength; i++){
      let ft_name = features[i];
      let angle = (Math.PI / 2) + (2 * Math.PI * -i / featuresLength);
      coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
  }

  console.log("coordinates : ", coordinates)
  return coordinates;
}

function angleToCoordinate(angle, value){
  let x = Math.cos(angle) * radialScale(dataScale(value));
  let y = Math.sin(angle) * radialScale(dataScale(value));
  return {"x": cx + x, "y": cy - y};
}

// function getAngleForFeature(feature) {

// }

