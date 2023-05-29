import React from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const NetworkPanel = (props) => {
  console.log("chartData: ", props.chartData)
  const waterfall = props.chartData ? processData(props.chartData) : null;
  
  //function to process start/end times for waterfall data
  function processData(chartData) {
    //span data received from server is from most recent to oldest
    //need to reverse our array to display chart data chronologically
    chartData.sort((a, b) => a.startTime - b.startTime)
    
    //get earliest time in our chartData array
    const minStartTime = Math.min(...chartData.map(item => item.startTime ? item.startTime: Number.POSITIVE_INFINITY));

    //normalize start and end times since timestamp gaps can be very large
    const normalizedData = chartData.map(item => ({
        ...item,
        startTime: item.startTime - minStartTime,
        endTime: item.endTime - minStartTime,
    }));
    
    // Generate waterfall bar data for each span object we have
    const barData = normalizedData.map((item, index) => {
        const scaledStartTime = Math.log(item.startTime + 1); 
        const scaledEndTime = Math.log(item.endTime + 1); 
        return {
        ...item,
        index: index,
        pv: scaledStartTime,  // pv is the floating part (transparent)
        uv: scaledEndTime - scaledStartTime  // uv is the part of the graph we want to show
      }})
    
    //need maxEndTime to get the upperbound limit for waterfall chart
    const maxEndTime = Math.max(...barData.map(item => item.uv + item.pv));

      return (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="Server-side Fetching Summary">
            <TableHead>
              <TableRow>
                <TableCell>Endpoint</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Waterfall</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {barData.map((data, i) => (
                <TableRow key={i}>
                  <TableCell component="th" scope="row">{data.route}</TableCell>
                  <TableCell>{data.method ? data.method : ""}</TableCell>
                  <TableCell>{data.statusCode}</TableCell>
                  <TableCell>
                    <BarChart
                      layout="vertical"
                      width={500} 
                      height={30}
                      data={[data]}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <XAxis type="number" domain={[0, maxEndTime]} hide={true} />
                      <YAxis type="category" dataKey="index" hide={true} />
                      <Tooltip />
                      <Bar dataKey="pv" stackId="a" fill="transparent" />
                      <Bar dataKey="uv" stackId="a" fill="#82ca9d">
                        <Cell fill="#82ca9d" />
                      </Bar>
                    </BarChart>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
  }

  // const maxEndTime = Math.max(...props.chartData.map(item => {
  //   if (item.spanId) return item.endTime;
  // }));

  // // Generate bar data
  // const barData = props.chartData.map((item, index) => item.spanId ? {
  //   ...item,
  //   index: index,
  //   pv: item.startTime,  // pv is the floating part (transparent)
  //   uv: item.endTime - item.startTime  // uv is the part of the graph we want to show
  // }
  // : null).filter(item => item !== null);

  // return (
  //   <TableContainer component={Paper}>
  //     <Table sx={{ minWidth: 650 }} aria-label="Server-side Fetching Summary">
  //       <TableHead>
  //         <TableRow>
  //           <TableCell>Endpoint</TableCell>
  //           <TableCell>Status</TableCell>
  //           <TableCell>Waterfall</TableCell>
  //         </TableRow>
  //       </TableHead>
  //       <TableBody>
  //         {barData.map((data, i) => (
  //           <TableRow key={i}>
  //             <TableCell component="th" scope="row">{data.route}</TableCell>
  //             <TableCell>{data.method ? data.method : ""}</TableCell>
  //             <TableCell>{data.statusCode}</TableCell>
  //             <TableCell>
  //               <BarChart
  //                 layout="vertical"
  //                 width={500} 
  //                 height={30}
  //                 data={[data]}
  //                 margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
  //               >
  //                 <XAxis type="number" domain={[0, maxEndTime]} hide={true} />
  //                 <YAxis type="category" dataKey="index" hide={true} />
  //                 <Tooltip />
  //                 <Bar dataKey="pv" stackId="a" fill="transparent" />
  //                 <Bar dataKey="uv" stackId="a" fill="#82ca9d">
  //                   <Cell fill="#82ca9d" />
  //                 </Bar>
  //               </BarChart>
  //             </TableCell>
  //           </TableRow>
  //         ))}
  //       </TableBody>
  //     </Table>
  //   </TableContainer>
  // );
  return (
    <div>
    {waterfall}
    </div>
  )
};

export default NetworkPanel;
