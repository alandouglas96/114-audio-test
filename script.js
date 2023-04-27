let audio1 = new Audio()
audio1.crossorigin = 'anonymous'
audio1.src =
  'https://alandouglasphotography.s3.eu-central-1.amazonaws.com/modjo-lady.mp3'
let playing = false

const video = document.querySelector('video')
video.crossorigin = 'anonymous'

var isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/)

container.addEventListener('click', function () {
  playing = !playing
  if (playing) {
    // audio1.play()
    video.play()

    if (isSafari) {
      let canvas = document.getElementById('canvas')
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      let audioSource = null
      let analyser = null

      audioSource = audioCtx.createMediaElementSource(video)
      analyser = audioCtx.createAnalyser()
      audioSource.connect(analyser)
      analyser.connect(audioCtx.destination)

      analyser.fftSize = 128
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      let x = 0
      function animateSafari() {
        x = 0
        analyser.getByteFrequencyData(dataArray)
        drawVisualizerForSafari({ bufferLength, dataArray }, {})
        requestAnimationFrame(animateSafari)
      }

      animateSafari()
    } else {
      let canvas = document
        .getElementById('canvas')
        .transferControlToOffscreen()
      const worker = new Worker(new URL('./worker.js', import.meta.url))

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      worker.postMessage({ canvas }, [canvas])

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

      let audioSource = audioCtx.createMediaElementSource(video)

      let analyser = audioCtx.createAnalyser()
      audioSource.connect(analyser)
      analyser.connect(audioCtx.destination)

      analyser.fftSize = 128
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      let x = 0
      function animate() {
        x = 0
        analyser.getByteFrequencyData(dataArray)
        worker.postMessage({ bufferLength, dataArray }, {})
        requestAnimationFrame(animate)
      }

      animate()
    }
  } else {
    video.pause()
    // audio1.pause()
  }
})

const drawVisualizerForSafari = ({ bufferLength, dataArray }) => {
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
