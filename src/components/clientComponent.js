import React, { useState, useEffect, useRef } from "react";
import Chart from 'chart.js/auto'

const ClientComponent = (props) => {

  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);

  const inputData = [];
  const notThese = [
        "InnerLayoutRouter", "RedirectBoundary", "NotFoundBoundary",
        "LoadingBoundary", "ErrorBoundary", "HotReload", "Router",
        "ServerRoot", "RSCComponent", "Root", "ThrottledComponent",
        "OuterLayoutRouter", "RenderFromTemplateContext", 
        "HistoryUpdater", "AppRouterAnnouncer", "ScrollAndFocusHandler"
        ];

  const convertTreeToChart = (tree) => {
    
    const bfs = (...tree) => {
        const q = [...tree];

        while (q.length > 0) {
            const node = q.shift();
            // Only keep nodes that are funtion components and with a component name
            // client components also use Hooks
            if (node.tagObj.tag === 0 && node.componentName !== "" && !notThese.includes(node.componentName) && node._debugHookTypes !== null) {
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

    console.log('inputData: ', inputData)

    if (!chartRef.current) {
      return;
    }
    const ctx = chartRef.current.getContext("2d");
    const newChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: inputData.map((row) => row.componentName),
        datasets: [
          {
            label: props.label,
            data: inputData.map((row) => row.time),
            backgroundColor: '#ff6384',
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

export default ClientComponent;