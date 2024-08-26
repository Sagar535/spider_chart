// chart.js
const width = 600
const yPadding = 50
const xPadding = 50

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
const features = ["A", "B", "C", "D", "E"];
const featuresLength = features.length

const line = d3.line()
    .x(d => d.x)
    .y(d => d.y);
const colors = ["#8CFF8C", "#C3C3C3"];


//generate the data
for (var i = 0; i < 1; i++){
    var point = {}
    //each feature will be a random number from 1-9
    features.forEach(f => point[f] = 2 + Math.random() * 9);
    data.push(point);
}
console.log(data);

const radialScale = d3.scaleLinear()
    .domain([0, 12])
    .range([0, halfWidth]);
const ticks = [2, 4, 6, 8, 10, 12]


// NOTE: this are here to make sure the coordinates are on point.. 
// TODO: FIXME: Remove this
svg.selectAll("circle")
    .data(ticks)
    .join(
        enter => enter.append("circle")
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("r", d => radialScale(d))
    );
    
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


// // here we draw pentagons in each circle
// Object.values(coordinates).forEach(coordinateArray => {
// 	let index = 0
//   while(index < 5) {
//   	let [x1, y1] = coordinateArray[index]
//     let [x2, y2] = coordinateArray[index+1]
    
//     svg.append("line")
//       .attr("x1", x1)
//       .attr("y1", y1)
//       .attr("x2", x2)
//       .attr("y2", y2)
//       .attr("stroke", "#fff")
//       .attr("stroke-dasharray", "3, 3")
//       .attr("stroke-width", 1.5);

//     index += 1
//   }
	
// })

// draw the path element
svg.selectAll("path")
    .data(data)
    .join(
        enter => enter.append("path")
            .datum(d => getPathCoordinates(d))
            .attr("d", line)
            .attr("stroke-width", 3)
            .attr("stroke", (_, i) => colors[i])
            .attr("fill", (_, i) => colors[i])
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.5)
    );



  
  
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
      let angle = (Math.PI / 2) + (2 * Math.PI * i / featuresLength);
      coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
  }

  console.log("coordinates : ", coordinates)
  return coordinates;
}

function angleToCoordinate(angle, value){
  let x = Math.cos(angle) * radialScale(value) + xPadding;
  let y = Math.sin(angle) * radialScale(value) + yPadding;
  return {"x": width / 2 + x, "y": height / 2 - y};
}

// function getAngleForFeature(feature) {

// }

