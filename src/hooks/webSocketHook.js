import { useState, useEffect } from "react";

function useWebSocket({
  socketUrl,
  retry: defaultRetry = 3,
  retryInterval = 1500,
}) {
  const [data, setData] = useState();
  // send function
  const [send, setSend] = useState(() => () => undefined);
  // state of our connection
  const [retry, setRetry] = useState(defaultRetry);
  // retry counter
  const [readyState, setReadyState] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(socketUrl);
    ws.onopen = () => {
      console.log("Connected to socket");
      setReadyState(true);

      // function to send messages
      setSend(() => {
        return (data) => {
          try {
            const d = JSON.stringify(data);
            ws.send(d);
            return true;
          } catch (err) {
            return false;
          }
        };
      });

      // receive messages
      ws.onmessage = (event) => {
        const msg = formatMessage(event.data);
        setData({ message: msg, timestamp: getTimestamp() });
      };
    };

    // on close we should update connection state
    // and retry connection
    ws.onclose = () => {
      setReadyState(false);
      // retry logic
      if (retry > 0) {
        setTimeout(() => {
          setRetry((retry) => retry - 1);
        }, retryInterval);
      }
    };
    // terminate connection on unmount
    return () => {
      ws.close();
    };
    // retry dependency here triggers the connection attempt
  }, [retry]);

  return { send, data, readyState };
}

// small utilities that we need
// handle json messages
const formatMessage = (data) => {
  try {
    const parsed = JSON.parse(data);
    return parsed;
  } catch (err) {
    return data;
  }
};

// get epoch timestamp
const getTimestamp = () => {
  return new Date().getTime();
};

export default useWebSocket;
