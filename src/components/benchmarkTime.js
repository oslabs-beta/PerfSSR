import React, { useState, useEffect, useRef } from "react";
import Chart from 'chart.js/auto'

const BenchmarkTime = (props) => {

    const CHART_COLORS = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
    };

  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [toggle, setToggle] = useState(false);
  
  const inputData = [];
  const notThese = [
        "InnerLayoutRouter", "RedirectBoundary", "NotFoundBoundary",
        "LoadingBoundary", "ErrorBoundary", "HotReload", "Router",
        "ServerRoot", "RSCComponent", "Root", "ThrottledComponent",
        "AppRouter", "OuterLayoutRouter", "RenderFromTemplateContext", 
        "HistoryUpdater", "AppRouterAnnouncer", "ScrollAndFocusHandler"
        ];

  const convertTreeToChart = (tree) => {

    //function to perform breadth first search on fiber tree to get nodes
    const bfs = (...tree) => {
        const q = [...tree];

        while (q.length > 0) {
            const node = q.shift();
            // Only keep nodes that are funtion components and with a component name
            if ((node.tagObj.tag === 0 || node.tagObj.tag === 11) && node.componentName !== "" && !notThese.includes(node.componentName)) {
                if (node.renderDurationMS === 0) 
                   inputData.push({componentName: node.componentName, 
                     time: Number(node.selfBaseDuration * 100)
                   })
                else inputData.push({componentName: node.componentName, 
                                time: Number(node.renderDurationMS * 100)
                               })
            }
            if (node.children.length > 0) q.push(...node.children);
        }
    }
    
    bfs(tree);
    let avg = inputData.reduce((acc, curr) => acc + curr.time, 0) / inputData.length;

    const processBenchmarking = (t) => {
      let result;
      result = t < avg ? (avg/t) : -(t/avg)
      return result.toFixed(2);
    }

    inputData.forEach(e => {
      e.time = Number(processBenchmarking(e.time))
    });

  } 

  useEffect(() => {

    if (props.chartData)
      convertTreeToChart(...props.chartData.root.children);

    if (inputData.length === 0) setToggle(false); 
    else setToggle(true);

    if (!chartRef.current) {
      return;
    }

    // If there's an existing chart, destroy it before creating a new one
    if (chart) {
      chart.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    //configuration of data into readable chart data for component
    const newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: inputData.map((row) => row.componentName),
        datasets: [
          {
            label: props.label,
            data: inputData.map((row) => row.time),
          },
        ],
      },
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
            position: 'top',
        },
        title: {
            display: false,
        }
        }
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

  const display = toggle 
  ? (<canvas ref={chartRef} />) 
  : (<p className="toggle-text">No valid components available</p>)

  return (
    <div className='chart-dimension'>
      {display}
    </div>
  );
};

export default BenchmarkTime;