import React, { useEffect, useRef, useState } from "react";

function App() {
  const ws = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    //Send request to our websocket server using the "/request" path
    ws.current = new WebSocket("ws://localhost:8080/request");

    ws.current.onmessage = (ev) => {
      const message = JSON.parse(ev.data);
      console.log(`Received message :: ${message.sensorData}`);
      // Upon receiving websocket message then add it to the list of data that we are displaying
      let newDataArray = [
        ...data,
        {
          id: message.date,
          sensorData: message.sensorData,
        },
      ];
      console.log(newDataArray);
      setData((currentData) => limitData(currentData, message));
    };
    ws.current.onclose = (ev) => {
      console.log("Client socket close!");
    };

    //We limit the number of reads to the last 24 reading and drop the last read
    function limitData(currentData, message) {
      // if (currentData.length > 24) {
      //   console.log("Limit reached, dropping first record!");
      //   currentData.shift();
      // }
      return [
        ...currentData,
        {
          id: message.date,
          sensorData: message.sensorData,
        },
      ];
    }

    return () => {
      console.log("Cleaning up! ");
      ws.current.close();
    };
  }, []);
  
  return (
    <div>
      <h1>Hello React</h1>
    </div>
  )
}

export default App
