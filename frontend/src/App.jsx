import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { Line } from "react-chartjs-2";

Chart.register(CategoryScale);

function App() {
  const ws = useRef();
  const [data, setData] = useState([]);
  // don't use state
  const chartData = {
    labels: data.map((data) => data.id), 
    datasets: [
      {
        label: "Users Gained ",
        data: data.map((data) => data.sensorData),
        borderColor: "black",
        borderWidth: 2
      }
    ]
  };
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
      console.log(`Data:: ${data}`);
      // setChartData({  
      //   labels: data.map((data) => data.id), 
      //   datasets: [
      //     {
      //       label: "Users Gained ",
      //       data: data.map((data) => data.sensorData),
      //       borderColor: "black",
      //       borderWidth: 2
      //     }
      //   ]
  
      // });
    }
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
  },[]);
  
  function LineChart({ chartData }) {
    return (
      <div className="chart-container">
        <Line
          data={chartData}
          redraw
          options={{
            plugins: {
              title: {
                display: true,
                text: "Users Gained between 2016-2020"
              },
              legend: {
                display: false
              }
            }
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <LineChart chartData={chartData} />
    </div>
  )
}



export default App
