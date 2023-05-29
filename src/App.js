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
// import HTTPReqChart from "./components/HTTPReqChart";
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

  const networkData = [
    { name: 'request1', method: 'GET', status: 200, type: 'document', startTime: 0, endTime: 500 },
    { name: 'request2', method: 'GET', status: 304, type: 'stylesheet', startTime: 100, endTime: 400 },
    { name: 'request3', method: 'POST', status: 200, type: 'xhr', startTime: 200, endTime: 600 },
    { name: 'request4', method: 'GET', status: 200, type: 'image', startTime: 300, endTime: 700 },
    // more requests...
  ];



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
      console.log("message: ", message)
      setMessagesList((prevMessagesList) => {
        if (message.length > 0) return [].concat(message, prevMessagesList);
      })
    }
  }, [ws.data]);

  useEffect(() => {
    console.log("messagesList: ", messagesList);}, [messagesList])

  useEffect(() => {
    console.log("fiberTree: ", fiberTree);
  }, [fiberTree]);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      setMetrics((prevMetrics) => {
        return {
          ...prevMetrics,
          [message.metricName]: message.value,
        };
      });

      // setHttpReq((prevHttpReq) => {
      //   if (message.message && message.message.data) {
      //     if (
      //       Object.keys(message.message.data).length !==
      //       Object.keys(prevHttpReq.data).length
      //     ) {
      //       // console.log('received data: ', message.message.data)
      //       const newHttpReq = { data: message.message.data };
      //       setHttpToggle(true);
      //       return newHttpReq;
      //     }
      //   } else {
      //     setHttpToggle(false);
      //   }
      //   return prevHttpReq;
      // });

      setFiberTree((prevFiberTree) => {
        if (
          message.type === "UPDATED_FIBER" ||
          message.type === "FIBER_INSTANCE"
        ) {
          console.log("UPDATED_FIBER received: ", message);
          return JSON.parse(message.payload);
        }
        return prevFiberTree;
      });
    });
  }, []);

  const handleRefreshClick = () => {
    try {
      // setHttpReq({ data: {} });
      // setHttpToggle(false);
      chrome.devtools.inspectedWindow.reload(); // Refresh the inspected page
    } catch (error) {
      console.error("Error occurred while refreshing the page:", error);
    }
  };

  // useEffect(() => {
  //   if (Object.keys(httpReq.data).length !== 0) setHttpToggle(true);
  //   else setHttpToggle(false);
  // }, [httpReq]);

  // let showHTTP = httpToggle ? (
  //   <div>
  //     <p className="chart-title">Performance of HTTP Requests</p>
  //     <HTTPReqChart
  //       key={httpToggle}
  //       chartData={httpReq.data}
  //       label={"Network Requests Time (ms)"}
  //     />
  //   </div>
  // ) : null;

  let atBegin =
    Object.keys(metrics).length === 0 ? (
      <div>
        <p className="title">PerfSSR - Your Next.js Analysitcs Tool</p>
        <button className="refresh-button" onClick={handleRefreshClick}>
          Start PerfSSR
        </button>
      </div>
    ) : (
      <div>
        <button className="reg-button" onClick={handleRefreshClick}>
          Regenerate Analytics for Current Page
        </button>
        <p className="chart-title">Overall Performance Metrics</p>
        <ThemeProvider theme={theme}>
          <Box id="mainBox">
            <MetricContainer metrics={metrics} />
          </Box>
        </ThemeProvider>
        {/* {showHTTP} */}
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
        <ThemeProvider theme={theme}>
          <NetworkPanel chartData={messagesList} />
        </ThemeProvider>
      </div>
    );

  return <div>{atBegin}</div>;
}

export default App;
