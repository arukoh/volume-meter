let { ipcRenderer } = require("electron");

require("moment");
require("chartjs-plugin-streaming");
require("chartjs-plugin-annotation");
const Chart = require("chart.js");

let annotationValue = 2.0;
let yAxesMax = 1.0;
const ctx = document.getElementById("chart");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    datasets: [
      {
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        fill: true,
        pointRadius: 1,
        data: []
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    legend: {
      display: false
    },
    scales: {
      xAxes: [
        {
          type: "realtime",
          time: {
            displayFormats: {
              second: "H:mm:ss"
            }
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            stepSize: 0.1,
            min: 0,
            max: yAxesMax
          }
        }
      ]
    },
    plugins: {
      streaming: {
        delay: 1000,
        frameRate: 30,
        pause: false
      }
    },
    annotation: {
      annotations: [
        {
          type: "line",
          mode: "horizontal",
          scaleID: "y-axis-0",
          value: annotationValue,
          borderColor: "rgb(255, 99, 132)",
          borderWidth: 2,
          label: {
            enabled: false,
            content: "warning"
          }
        }
      ]
    }
  }
});

// window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioctx = new AudioContext();

const handleSuccess = stream => {
  const source = audioctx.createMediaStreamSource(stream);
  const processor = audioctx.createScriptProcessor(1024, 1, 1);

  source.connect(processor);
  processor.connect(audioctx.destination);
  // source.connect(audioctx.destination);

  /*
  let analyser = audioctx.createAnalyser();
  analyser.minDecibels = -90;
  analyser.maxDecibels = 0;
  analyser.smoothingTimeConstant = 0.65;
  analyser.fftSize = 2048;

  let bufferLength = analyser.frequencyBinCount;
  let dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  source.connect(analyser);
  getData();
  function getData() {
    analyser.getByteFrequencyData(dataArray);
    console.log(Math.max.apply(null, dataArray));
    requestAnimationFrame(getData);
  }
  */

  processor.onaudioprocess = e => {
    const amp = e.inputBuffer.getChannelData(0);
    const data = Math.max.apply(null, amp);
    if (yAxesMax < data) {
      yAxesMax = parseFloat(data.toFixed(1));
      chart.options.scales.yAxes[0].ticks.max = yAxesMax;
      document.getElementById("warningLevel").max = yAxesMax;
    }

    const current = document.getElementById("warningLevel").value;
    chart.options.annotation.annotations[0].value = current;
    if (parseFloat(data) > parseFloat(current)) {
      ipcRenderer.send("overThreshold", "");
    }

    chart.data.datasets[0].data.push({
      x: Date.now(),
      y: data
    });

    chart.update({
      preservation: true
    });
  };
};
navigator.mediaDevices
  .getUserMedia({ audio: true, video: false })
  .then(handleSuccess);

const warningLevel = document.getElementById("warningLevel");
warningLevel.addEventListener("change", event => {
  chart.options.annotation.annotations[0].value = warningLevel.value;
  chart.update();
});
