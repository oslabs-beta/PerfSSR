import React, { useState, useEffect, useRef } from "react";
import Chart from 'chart.js/auto';
import "../style.css";
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(zoomPlugin);

const ServerComponent = (props) => {

  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [toggle, setToggle] = useState(false);

  const inputData = [];
  // excluding built-in Next.js components
  const notThese = [
        "InnerLayoutRouter", "RedirectBoundary", "NotFoundBoundary",
        "LoadingBoundary", "ErrorBoundary", "HotReload", "Router",
        "ServerRoot", "RSCComponent", "Root", "ThrottledComponent",
        "AppRouter"
        ];

  //function will take in a fiber tree and parse through all the nodes to generate an input array of components for charts
  const convertTreeToChart = (tree) => {

    //using breadth first search to get all the nodes from fiber tree
    const bfs = (...tree) => {
        const q = [...tree];

        while (q.length > 0) {
            const node = q.shift();
            // Only keep nodes that are funtion components and with a component name
            if ((node.tagObj.tag === 0 || node.tagObj.tag === 11) && node.componentName !== "" && !notThese.includes(node.componentName) && node._debugHookTypes === null) {
                if (node.renderDurationMS === 0) 
                   inputData.push({componentName: node.componentName, 
                     time: Number((node.selfBaseDuration * 100))
                   })
                else inputData.push({componentName: node.componentName, 
                                time: Number((node.renderDurationMS * 100))
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

    if (inputData.length === 0) setToggle(false); 
    else setToggle(true);
    
    if (!chartRef.current) {
      return;
    }

    // If there's an existing chart, destroy it before creating a new one
    if (chart) {
      chart.destroy();
    }

    const scales = {
      x: {
        type: 'category'
      },
      y: {
        type: 'linear'
      },
    };

    const ctx = chartRef.current.getContext("2d");
    const newChart = new Chart(ctx, {
      type: "bar",
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
        scales: scales,
        plugins: {
          zoom: {
            pan: {
              enabled: true,
              mode: 'x',
              threshold: 5,
            },
            zoom: {
              wheel: {
                enabled: true
              },
              pinch: {
                enabled: true
              },
              mode: 'x',
            },
          }
        },
      }
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
  : (<p className="toggle-text">No valid server-side components available</p>)

  return (
    <div className='chart-dimension'>
      {display}
    </div>
  );
};

export default ServerComponent;