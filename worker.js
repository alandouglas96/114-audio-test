let canvas = null

const drawVisualizer = ({ bufferLength, dataArray }) => {
  const barWidth = canvas.width / 2 / bufferLength // the width of each bar in the canvas
  let firstX = 0 // used to draw the bars one after another. This will get increased by the width of one bar

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height) // clears the canvas

  let barHeight
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 2
    const red = (i * barHeight) / 15
    const green = i * 4
    const blue = barHeight / 4 - 12
    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`
    ctx.fillRect(
      canvas.width / 2 - firstX, // this will start the bars at the center of the canvas and move from right to left
      canvas.height - barHeight,
      barWidth,
      barHeight
    )
    firstX += barWidth // increases the x value by the width of the bar
  }

  let secondX = 0
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 2
    const red = (i * barHeight) / 15
    const green = i * 4
    const blue = barHeight / 4 - 12
    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`
    ctx.fillRect(
      canvas.width / 2 + secondX,
      canvas.height - barHeight,
      barWidth,
      barHeight
    ) // this will continue moving from left to right
    secondX += barWidth // increases the x value by the width of the bar
  }
}

onmessage = function (e) {
  console.log('Worker: Message received from main script')
  const { bufferLength, dataArray, canvas: canvasMessage } = e.data
  if (canvasMessage) {
    canvas = canvasMessage
  } else {
    drawVisualizer({ bufferLength, dataArray })
  }
}
