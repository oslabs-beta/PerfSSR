import React, { useState, useEffect, useRef } from "react";
import Chart from 'chart.js/auto'

const HTTPReqChart = (props) => {

  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  
  useEffect(() => {
    // convert raw network data to displayable datasets
    let inputData = [];
    if (props.chartData) {
      const temp = Object.entries(props.chartData)
      if (temp.length !== 0) {
        //console.log(temp);
        inputData = temp.map((item, i) => {
          if (item[1].networkRes) {
            return {request: `HTTP Req${i+1}`, time: (item[1].networkRes.timeStamp - item[1].networkReq.timeStamp).toFixed(2)}        
          }
          return null;
        }).filter(item => item !== null)
        //console.log("new datasets!!!!", inputData)
      }
    }

    if (!chartRef.current) { 
      return;
    }

    if (chart) {
      chart.destroy(); // Destroy the previous chart instance
    }

    const ctx = chartRef.current.getContext("2d");
    const newChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: inputData.map((row) => row.request),
        datasets: [
          {
            label: props.label,
            data: inputData.map((row) => row.time),
          },
        ],
      },
    });
    setChart(newChart);
    
    // Clean up the previous chart instance when the component unmounts
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [props.chartData]);


  return (
    <div>
      <canvas ref={chartRef} />
    </div>
  );
};

export default HTTPReqChart;
