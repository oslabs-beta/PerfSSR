import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box, Paper } from "@mui/material";
import Metric from "./components/metric";
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

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      setMetrics((prevMetrics) => {
        return {
          ...prevMetrics,
          [message.metricName]: message.value,
        };
      });
    });
  }, []);

  const clsValue = isNaN(metrics.CLS) ? 'N/A' : metrics.CLS.toFixed(2);
  const clsShow = isNaN(metrics.CLS) ? 'N/A' : (100 - ((metrics.CLS.toFixed(2) - 0.1) / 0.15) * 30);

    return (
        <ThemeProvider theme={theme}>
          <Box id='mainBox' >
            <div id='overall-metric-container'>
              <Paper sx={{ boxShadow: 3 }}>
                <div className='metric-container-inner'>
                  <Box sx={{ display: "flex", gap: 5 }}>
                    <Metric
                    name={"FCP"}
                    value={Math.min(97, 100 - ((Math.round(metrics.FCP) - 2500) / 1500) * 20)}
                    description={`First Contentful Paint: ${Math.round(metrics.FCP)}ms -
                                  Marks the time at which the first text or image is painted`}
                    //handleClick={handleClick}
                    //isActive={currentMetric === "Performance"}
                    />
                    <Metric
                    name={"LCP"}
                    value={Math.min(97, 100 - ((Math.round(metrics.LCP) - 2500) / 1500) * 20)}
                    description={`Largest Contentful Paint: ${Math.round(metrics.LCP)}ms -
                                  Marks the time at which the largest text or image is painted`}
                    />
                    <Metric
                    name={"CLS"}
                    value={clsValue}
                    description={`Cumulative Layout Shift: ${clsShow} -
                                  Measures the movement of visible elements within the viewport`}
                    />
                    <Metric
                    name={"TBT"}
                    value={Math.min(97, 100 - ((metrics.TBT - 200) / 400) * 30)}
                    description={`Total Blocking Time: ${Math.round(metrics.TBT)}ms -
                                  Sum of all time periods between FCP and Time to Interactive,\n
                                  when task length exceeds 50ms`}
                    />
                    <Metric
                    name={"FID"}
                    value={100 - ((metrics.FID - 100) / 200) * 30}
                    description={`First Input Delay: ${Math.round(metrics.FID)}ms -
                    Measures the time from when a user first interacts with a page to the time when the browser\n 
                    is actually able to begin processing event handlers in response to that interaction`}
                    />
                  </Box>
                </div>
              </Paper>
            </div>
          </Box>
        </ThemeProvider>
    )
}

export default App;


{/* <Metric
name={"FCP"}
value={0.9 * 100}
//handleClick={handleClick}
//isActive={currentMetric === "Performance"}
/>
<Metric
name={"LCP"}
value={0.85 * 100}
/>
<Metric
name={"CLS"}
value={0.7 * 100}
/>
<Metric
name={"TBT"}
value={0.45 * 100}
/>
<Metric
name={"FID"}
value={0.6 * 100}
/> */}