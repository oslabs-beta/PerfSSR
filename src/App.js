import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";
import useWebSocket from "./hooks/webSocketHook";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import MetricContainer from "./components/metricContainer";
import ServerComponent from "./components/serverComponent";
import ClientComponent from "./components/clientComponent";
import BenchmarkTime from "./components/benchmarkTime";
import "./style.css";
import NetworkPanel from './components/NetworkPanel';

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
  const [httpReq, setHttpReq] = useState({ data: {} });
  const [httpToggle, setHttpToggle] = useState(false);
  const [fiberTree, setFiberTree] = useState();
  const [messagesList, setMessagesList] = useState([]);
  const ws = useWebSocket({ socketUrl: "ws://localhost:4000" });

  useEffect(() => {
    const getMessageFromQueue = () => {
      chrome.runtime.sendMessage(
        { type: "GET_MESSAGE_FROM_QUEUE" },
        (message) => {
          if (message) {
            // Process the message retrieved from the queue
            console.log("Message from queue:", message);
            setFiberTree(JSON.parse(message.payload));
          }
        }
      );
    };
    getMessageFromQueue();
  }, []);

  // receive messages from socket
  useEffect(() => {
    if (ws.data) {
      const { message } = ws.data;
      // console.log("message: ", message)
      setMessagesList((prevMessagesList) => {
        if (message.length > 0) return [].concat(message, prevMessagesList);
      })
    }
  }, [ws.data]);

  // useEffect(() => {
  //   console.log("fiberTree: ", fiberTree);
  // }, [fiberTree]);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      setMetrics((prevMetrics) => {
        return {
          ...prevMetrics,
          [message.metricName]: message.value,
        };
      });

      setFiberTree((prevFiberTree) => {
        if (
          message.type === "UPDATED_FIBER" ||
          message.type === "FIBER_INSTANCE"
        ) {
          // console.log("UPDATED_FIBER received: ", message);
          return JSON.parse(message.payload);
        }
        return prevFiberTree;
      });
    });
  }, []);

  const handleRefreshClick = () => {
    try {
      setMessagesList([]);
      chrome.devtools.inspectedWindow.reload(); // Refresh the inspected page
    } catch (error) {
      console.error("Error occurred while refreshing the page:", error);
    }
  };

  const handleClear = () => {
    setMessagesList([]);
  }

  let atBegin =
    Object.keys(metrics).length === 0 ? (
      <div className="container">
        <img src="../assets/perfssr_logo.png"/>
        <p className="title">PerfSSR - Your Next.js Analysitcs Tool</p>
        <button className="refresh-button" onClick={handleRefreshClick}>
          Start PerfSSR
        </button>
      </div>
    ) : (
      <div className="container">
        <button className="reg-button" onClick={handleRefreshClick}>
          Regenerate Analytics for Current Page
        </button>
        <p className="chart-title">Overall Performance Metrics</p>
        <ThemeProvider theme={theme}>
          <Box id="mainBox">
            <MetricContainer metrics={metrics} />
          </Box>
        </ThemeProvider>
        <p className="chart-title">Server Side Components Rendering Times</p>
        <ServerComponent
          chartData={fiberTree}
          label={"Rendering Time (100ms)"}
        />
        <p className="chart-title">Client Side Components Rendering Times</p>
        <ClientComponent
          chartData={fiberTree}
          label={"Rendering Time (100ms)"}
        />
        <p className="chart-title">Components Rendering Time Benchmarking</p>
        <BenchmarkTime
          chartData={fiberTree}
          label={
            "Rendering Time Compared with Average (+/- times faster/slower)"
          }
        />
        <p className="chart-title">Server-side Fetching Summary</p>
        <button className="clear-button" onClick={handleClear}>
          Clear network data
        </button>
        <ThemeProvider theme={theme}>
          <NetworkPanel chartData={messagesList} />
        </ThemeProvider>
      </div>
    );

  return <div>{atBegin}</div>;
}

export default App;
