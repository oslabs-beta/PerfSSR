import React, { useState, useEffect, useRef } from "react";
import Chart from 'chart.js/auto'

const BarChart = () => {

  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);

  const data = [
    { year: 2010, count: 10 },
    { year: 2011, count: 20 },
    { year: 2012, count: 15 },
    { year: 2013, count: 25 },
    { year: 2014, count: 22 },
    { year: 2015, count: 30 },
    { year: 2016, count: 28 },
  ];
  
  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    const ctx = chartRef.current.getContext("2d");
    const newChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((row) => row.year),
        datasets: [
          {
            label: "Acquisitions by year",
            data: data.map((row) => row.count),
          },
        ],
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

export default BarChart;