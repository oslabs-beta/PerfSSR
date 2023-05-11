import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import MetricContainer from "./components/metricContainer";
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

    let atBegin = Object.keys(metrics).length === 0 ? <h1>Please start analyzing your app by refreshing current page</h1> : <MetricContainer metrics={metrics}/>
    return (
      <div>
        <ThemeProvider theme={theme}>
          <Box id='mainBox' >
            {atBegin}
          </Box>
        </ThemeProvider>
        <BarChart />
        <BarChart />
        <HorizontalBar />
        
      </div>
    )
}

export default App;