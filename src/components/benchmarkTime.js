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
  
  const inputData = [];
  const notThese = [
        "InnerLayoutRouter", "RedirectBoundary", "NotFoundBoundary",
        "LoadingBoundary", "ErrorBoundary", "HotReload", "Router",
        "ServerRoot", "RSCComponent", "Root", "ThrottledComponent",
        "AppRouter", "OuterLayoutRouter", "RenderFromTemplateContext", 
        "HistoryUpdater", "AppRouterAnnouncer", "ScrollAndFocusHandler"
        ];

  const convertTreeToChart = (tree) => {
    
    const processBenchmarking = (t) => {
        const avg = 22;
        let result;
        result = t < avg ? (avg/t) : -(t/avg)
        return result.toFixed(2);
    }

    const bfs = (...tree) => {
        const q = [...tree];

        while (q.length > 0) {
            const node = q.shift();
            // Only keep nodes that are funtion components and with a component name
            if (node.tagObj.tag === 0 && node.componentName !== "" && !notThese.includes(node.componentName)) {
                if (node.renderDurationMS === 0) 
                   inputData.push({componentName: node.componentName, 
                     time: Number(processBenchmarking(node.selfBaseDuration * 100))
                   })
                else inputData.push({componentName: node.componentName, 
                                time: Number(processBenchmarking(node.renderDurationMS * 100))
                               })
            }
            if (node.children.length > 0) q.push(...node.children);
        }
    }
    
    bfs(tree);
  } 

  useEffect(() => {

    if (props.chartData)
      convertTreeToChart(...props.chartData.root.children);

    console.log('inputData: ', inputData)

    if (!chartRef.current) {
      return;
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
  }, []);


  return (
    <div>
      <canvas ref={chartRef} />
    </div>
  );
};

export default BenchmarkTime;