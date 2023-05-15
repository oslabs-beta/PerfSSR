import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import MetricContainer from "./components/metricContainer";
import HTTPReqChart from "./components/HTTPReqChart";
import BarChart from "./components/barChart";
import HorizontalBar from "./components/horizontalBar";
import './style.css';

function App() {
    const theme = useMemo(() =>
    createTheme({
      palette: {
        primary: {
          main: "#881dff",
          light: "#d9b6ff",
        },
        secondary: {
          main: "#46b7ff",
          light: "#55fffe",
        },
        background: {
          default: "#131219",
          paper: "#222233",
        },
        text: {
          primary: "#efecfd",
        },
        success: {
          main: "#47ff82",
        },
        warning: {
          main: "#e9f835",
        },
        error: {
          main: "#ff4b4b",
        },
      },
    })
  );

  const [metrics, setMetrics] = useState({});
  const [httpReq, setHttpReq] = useState({data: {}});
  const [httpToggle, setHttpToggle] = useState(false);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      
      setMetrics((prevMetrics) => {
        return {
          ...prevMetrics,
          [message.metricName]: message.value,
        };    
      });

      setHttpReq((prevHttpReq) => {
        if (message.message && message.message.data) {
          if (Object.keys(message.message.data).length !== Object.keys(prevHttpReq.data).length) {            
            console.log('received data: ', message.message.data)
            console.log('prevHttpReq.data: ', prevHttpReq.data)
            // const newHttpReq = {...prevHttpReq};
            // newHttpReq.data = message.message.data;
            const newHttpReq = {data: message.message.data};
            setHttpToggle(true);
            return newHttpReq;
          }
        }
        return prevHttpReq;
      })
    });    
  }, []);


  const handleRefreshClick = () => {
    try {
      setHttpReq({data: {}});
      setHttpToggle(false);
      chrome.devtools.inspectedWindow.reload(); // Refresh the inspected page      
    } catch (error) {
      console.error('Error occurred while refreshing the page:', error);
    }
  };

  useEffect(() => {
    if (Object.keys(httpReq.data).length !== 0) setHttpToggle(true);
  }, [httpReq])

  let showHTTP = httpToggle
    ? (<div>
        <p className='chart-title'>Performance of HTTP Requests</p>
        <HTTPReqChart key={httpToggle} chartData={httpReq.data} label={"Network Requests Time (ms)"}/>
        </div>)
    : (null)

  let atBegin = Object.keys(metrics).length === 0 
    ? (<div>
         <p className='title'>PerfSSR - Your Next.js Analysitcs Tool</p>
         <button className='refresh-button' onClick={handleRefreshClick}>
          Start PerfSSR
         </button>
       </div>) 
    : (<div>
        <button className='reg-button' onClick={handleRefreshClick}>
          Regenerate Analytics for Current Page
        </button>
        <p className='chart-title'>Overall Performance Metrics</p>
        <ThemeProvider theme={theme}>
          <Box id='mainBox' >
            <MetricContainer metrics={metrics}/>
          </Box>
        </ThemeProvider>
        {showHTTP}
        <p className='chart-title'>Server Side Components Rendering Times</p>
        <BarChart />
        <p className='chart-title'>Client Side Components Rendering Times</p>
        <BarChart />
        <p className='chart-title'>Components Rendering Time Benchmarking</p>
        <HorizontalBar />
       </div>)

  return (
    <div>
      {atBegin}
    </div>
  )
}

export default App;