import React, { useState, useEffect, useRef } from "react";
import Chart from 'chart.js/auto'
import colorLib from '@kurkle/color';
import { valueOrDefault } from 'chart.js/helpers';

const HorizontalBar = () => {

//here are some helper functions that the below data utilizes

var _seed = Date.now();

function rand(min, max) {
  min = valueOrDefault(min, 0);
  max = valueOrDefault(max, 0);
  _seed = (_seed * 9301 + 49297) % 233280;
  return min + (_seed / 233280) * (max - min);
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

function months(config) {
  var cfg = config || {};
  var count = cfg.count || 12;
  var section = cfg.section;
  var values = [];
  var i, value;

  for (i = 0; i < count; ++i) {
    value = MONTHS[Math.ceil(i) % 12];
    values.push(value.substring(0, section));
  }

  return values;
}

function transparentize(value, opacity) {
  var alpha = opacity === undefined ? 0.5 : 1 - opacity;
  return colorLib(value).alpha(alpha).rgbString();
}

function numbers(config) {
  var cfg = config || {};
  var min = valueOrDefault(cfg.min, 0);
  var max = valueOrDefault(cfg.max, 100);
  var from = valueOrDefault(cfg.from, []);
  var count = valueOrDefault(cfg.count, 8);
  var decimals = valueOrDefault(cfg.decimals, 8);
  var continuity = valueOrDefault(cfg.continuity, 1);
  var dfactor = Math.pow(10, decimals) || 0;
  var data = [];
  var i, value;

  for (i = 0; i < count; ++i) {
    value = (from[i] || 0) + rand(min, max);
    if (rand() <= continuity) {
      data.push(Math.round(dfactor * value) / dfactor);
    } else {
      data.push(null);
    }
  }

  return data;
}

const CHART_COLORS = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};
//end of helper functions and data


//start of dummy data

  const DATA_COUNT = 7;
  const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};
  
  const labels = months({count: 7});
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Dataset 1',
        data: numbers(NUMBER_CFG),
        borderColor: CHART_COLORS.red,
        backgroundColor: transparentize(CHART_COLORS.red, 0.5),
      },
      {
        label: 'Dataset 2',
        data: numbers(NUMBER_CFG),
        borderColor: CHART_COLORS.blue,
        backgroundColor: transparentize(CHART_COLORS.blue, 0.5),
      }
    ]
  };

  //end of dummy data

  //start of state set

  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  
  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    const ctx = chartRef.current.getContext("2d");

    //configuration of data into readable chart data for component
    const newChart = new Chart(ctx, {
      type: 'bar',
  data: data,
  options: {
    indexAxis: 'y',
    // Elements options apply to all of the options unless overridden in a dataset
    // In this case, we are setting the border of each horizontal bar to be 2px wide
    elements: {
      bar: {
        borderWidth: 2,
      }
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Chart.js Horizontal Bar Chart'
      }
    }
  },
});
    setChart(newChart);
  }, []);


  return (
    <div>
      <canvas ref={chartRef} />
    </div>
  );
};

export default HorizontalBar;
