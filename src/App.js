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

    return (
        <ThemeProvider theme={theme}>
          <Box id='mainBox' >
            <div id='overall-metric-container'>
              <Paper sx={{ boxShadow: 3 }}>
                <div className='metric-container-inner'>
                  <Box sx={{ display: "flex", gap: 5 }}>
                    <Metric
                    name={"FCP"}
                    value={180 * 50 / metrics.FCP}
                    // value={0.9 * 100}
                    //handleClick={handleClick}
                    //isActive={currentMetric === "Performance"}
                    />
                    <Metric
                    name={"LCP"}
                    value={180 * 50 / metrics.LCP}
                    // value={0.85 * 100}
                    />
                    <Metric
                    name={"CLS"}
                    value={metrics.CLS}
                    // value={0.7 * 100}
                    />
                    <Metric
                    name={"TBT"}
                    value={metrics.TBT}
                    // value={0.45 * 100}
                    />
                    <Metric
                    name={"FID"}
                    value={metrics.FID}
                    // value={0.6 * 100}
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