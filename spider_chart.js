function spiderChart(chartData) {
  const width = 350
  const height = 350
  const yPadding = 125
  const xPadding = 125

  // NOTE: following could be dynamic
  const features = ["Certainty", "Autonomy", "Purpose", "Belonging", "Competence"];
  const polyAngle = 72 // got by formula 360 / (no. of sides = 5)
  const MAX_SCALE = 13

  const cx = width / 2 + xPadding
  const cy = height / 2 + yPadding
  const halfWidth = width / 2

  const benchmarkColor = {
  positive: "#FF0064",
  negative: "#00A088"
  }


  const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + xPadding * 2)
      .attr("height", height + yPadding * 2)
      .style("background", "#000")


  let data = [];
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

  // coordinates1 = []
  // coordinates2=[]
  // coordinates3 = []
  // coordinates4 = []
  // coordinates5 = []
  // coordinates6 = []

  // all coorindates in single place ..
  coordinates = {}


  for(let i = 0;i<(360 + 1);i++) {
    ticks.forEach(tick => {
        length = radialScale(tick)
        //   let [xNew, yNew] = rotateLineByLength(cx, cy, length, index)
        let angle =  getAngle(i) // Math.PI / 2 + 2 *i * Math.PI / featuresLength;
        let coordinate = angleToCoordinate(angle, dataScale.invert(tick))
        let xNew = coordinate["x"]
        let yNew = coordinate["y"]

        if(coordinates[tick]) {
            coordinates[tick].push([xNew, yNew])
        } else {
            coordinates[tick] = [[xNew, yNew]]
        }
    })
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
      .text(dataScale.invert(tick)) // we are converting ticks to actual value here

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
  let angle = getAngle(i) // Math.PI / 2 + (2 * Math.PI * -i) / featuresLength;
  let x = Math.cos(angle) * radialScale(MAX_SCALE);
  let y = Math.sin(angle) * radialScale(MAX_SCALE);
  let benchDiff = data[1][feature] - data[0][feature]

  const edgeTexts = svg
                      .append('text')
                      .attr('x', cx + x)
                      .attr('y', cy - y)
                      .attr('dy', feature == 'Certainty' ? '-1.5em' : '0.35em')
                      .attr("dx", feature == 'Autonomy' ? '2.35em' : (feature == "Competence" ? '-3.35em' : ""))
                      .attr('fill', 'white')
                      .attr("text-anchor", "middle")
                      .text(`${feature}`)

  edgeTexts.append("tspan")
              .text(`${data[1][feature]} ( ${benchDiff < 0 ? "-" : "+"}${Math.abs(benchDiff)})`)
              .attr('x', cx + x)
              .attr("dx", feature == 'Autonomy' ? '2.35em' : (feature == "Competence" ? '-3.35em' : ""))
              .attr("dy", "20")
              .attr("fill", benchDiff < 0 ? benchmarkColor["positive"]: benchmarkColor["negative"])
  });

// // NOTE: obsolete code.. diverted from this approach already
//   function rotateLine(x1, y1, x2, y2, angle) {
//     // Calculate the angle of the original line
//     const angleOriginal = Math.atan2(y2 - y1, x2 - x1);

//     // Calculate the angle of the rotated line
//     const angleRotated = angleOriginal + angle * Math.PI / 180;

//     // Calculate the length of the line
//     const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

//     // Calculate the new x and y coordinates
//     const xNew = x1 + length * Math.cos(angleRotated);
//     const yNew = y1 + length * Math.sin(angleRotated);

//     return [ xNew, yNew ];
//   }

//   function rotateLineByLength(x1, y1, length, angle) {
//     // Calculate the angle of the original line
//     //const angleOriginal = Math.atan2(y2 - y1, x2 - x1);

//     const angleOriginal = -90 * Math.PI / 180

//     // Calculate the angle of the rotated line
//     const angleRotated = angleOriginal + angle * Math.PI / 180;

//     // Calculate the new x and y coordinates
//     const xNew = x1 + length * Math.cos(angleRotated);
//     const yNew = y1 + length * Math.sin(angleRotated);

//     return [ xNew, yNew ];
//   }

  function getPathCoordinates(data_point){
    let coordinates = [];
    for (var i = 0; i < featuresLength; i++){
        let ft_name = features[i];
        let angle =   getAngle(i) // (Math.PI / 2) + (2 * Math.PI * -i / featuresLength);
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

  function getAngle(index) {
    const startAngle = Math.PI / 2 // starting at 90 degree i.e. vertical line
    // 2 * Math.PI will give us equivalent to 360 degree
    // multiplied with -index to rotate in clockwise direction
    // index / featureLength gives us the ratio by which the line is to be rotated
    // which will be equivalent to 72 degree for pentagon
    const rotationAngle = (2 * Math.PI) * (-index / featuresLength)

    return startAngle + rotationAngle
  }
}

spiderChart([])

