import React from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const NetworkPanel = (props) => {
  const waterfall = props.chartData ? processData(props.chartData) : null;
  
  //function to process start/end times for waterfall data
  function processData(chartData) {
    //span data received from server is from most recent to oldest
    //need to reverse our array to display chart data chronologically
    chartData.sort((a, b) => a.startTime - b.startTime)
    
      //get earliest time and latest end time in our chartData array
    const minStartTime = Math.min(...chartData.map(item => item.startTime ? item.startTime: Number.POSITIVE_INFINITY));
    const maxEndTime = Math.max(...chartData.map(item => item.endTime ? item.endTime: Number.NEGATIVE_INFINITY));

    // find the min and max duration in the dataset
    const minDuration = Math.min(...chartData.map(item => item.endTime - item.startTime));
    const maxDuration = Math.max(...chartData.map(item => item.endTime - item.startTime));

    // function to normalize a time or duration
    const scale = (value, min, max) => (value - min) / (max - min);
    
    // Generate waterfall bar data for each span object we have
    const barData = chartData.map((item, index) => {
        const scaledStartTime = scale(item.startTime, minStartTime, maxEndTime); 
        const scaledDuration = scale(item.endTime - item.startTime, minDuration, maxDuration); 
        return {
        ...item,
        index: index,
        pv: scaledStartTime, //scaledStartTime,  // pv is the floating part (transparent)
        uv: scaledDuration, //scaledEndTime - scaledStartTime  // uv is the part of the graph we want to show
      }})
    
    //need maxEndTime to get the upperbound limit for waterfall chart
    const maxScaledEndTime = Math.max(...barData.map(item => item.uv + item.pv));

    // generate custom tooltip
    const CustomTooltip = ({ duration }) => {
        if (duration) {
          return (
            <div style={{backgroundColor: "whitesmoke", margin: "2, 2, 2, 2", color: "black"}}>
              <p className="label" >{`Duration: ${duration}`}</p>
            </div>
          );
        }      
        return null;
      };

    const renderRow = (data, i, indent) => {
        const children = barData.filter(child => data.spanId === child.parentSpanId);
        let padding = indent * 20;

        return (
          <React.Fragment>
            <TableRow>
              <TableCell component="th" scope="row" style={{paddingLeft: `${padding}px`, wordWrap: "break-word"}}>{data.route ? data.route : data.url}</TableCell>
              <TableCell>{data.httpMethod ? data.httpMethod : ""}</TableCell>
              <TableCell>{data.statusCode}</TableCell>
              <TableCell>{data.duration}</TableCell>
              <TableCell>
                <BarChart
                layout="vertical"
                width={600} 
                height={30}
                data={[data]}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <XAxis type="number" domain={[0, maxScaledEndTime]} hide={true} />
                  <YAxis type="category" dataKey="index" hide={true} />
                  <Bar dataKey="pv" stackId="a" fill="transparent" />
                  <Bar dataKey="uv" stackId="a" fill="#82ca9d">
                    <Cell fill="#82ca9d" />
                  </Bar>
                </BarChart>
              </TableCell>
            </TableRow>
            {children.map((child, j) => renderRow(child, j, indent+1))}
          </React.Fragment>        
        )
    }

      return (
        <TableContainer component={Paper} >
          <Table sx={{ minWidth: 550 }} aria-label="Server-side Fetching Summary">
            <TableHead>
              <TableRow>
                <TableCell>Endpoint / URL</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Duration (ms)</TableCell>
                <TableCell>Waterfall</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {barData.filter(item => !item.parentSpanId).map((data, i) => renderRow(data, i, 1))}
              {/* {barData.map((data, i) => (
                <TableRow key={i}>  
                  <TableCell component="th" scope="row">{data.route ? data.route : data.url}</TableCell>
                  <TableCell>{data.httpMethod ? data.httpMethod : ""}</TableCell>
                  <TableCell>{data.statusCode}</TableCell>
                  <TableCell>{data.duration}</TableCell>
                  <TableCell>
                    <BarChart
                      layout="vertical"
                      width={600} 
                      height={30}
                      data={[data]}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <XAxis type="number" domain={[0, maxScaledEndTime]} hide={true} />
                      <YAxis type="category" dataKey="index" hide={true} />
                      <Bar dataKey="pv" stackId="a" fill="transparent" />
                      <Bar dataKey="uv" stackId="a" fill="#82ca9d">
                        <Cell fill="#82ca9d" />
                      </Bar>
                    </BarChart>
                  </TableCell>
                </TableRow>
              ))} */}
            </TableBody>
          </Table>
        </TableContainer>
      );
  }

  return (
    <div>
    {waterfall}
    </div>
  )
};

export default NetworkPanel;



// return (
//     <TableContainer component={Paper} >
//       <Table sx={{ minWidth: 550 }} aria-label="Server-side Fetching Summary">
//         <TableHead>
//           <TableRow>
//             <TableCell>Endpoint / URL</TableCell>
//             <TableCell>Method</TableCell>
//             <TableCell>Status</TableCell>
//             <TableCell>Duration (ms)</TableCell>
//             <TableCell>Waterfall</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {barData.map((data, i) => (
//             <TableRow key={i}>
//               <TableCell component="th" scope="row">{data.route ? data.route : data.url}</TableCell>
//               <TableCell>{data.httpMethod ? data.httpMethod : ""}</TableCell>
//               <TableCell>{data.statusCode}</TableCell>
//               <TableCell>{data.duration}</TableCell>
//               <TableCell>
//                 <BarChart
//                   layout="vertical"
//                   width={600} 
//                   height={30}
//                   data={[data]}
//                   margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
//                 >
//                   <XAxis type="number" domain={[0, maxScaledEndTime]} hide={true} />
//                   <YAxis type="category" dataKey="index" hide={true} />
//                   {/* <Tooltip content={<CustomTooltip duration={data.duration}/>} /> */}
//                   <Bar dataKey="pv" stackId="a" fill="transparent" />
//                   <Bar dataKey="uv" stackId="a" fill="#82ca9d">
//                     <Cell fill="#82ca9d" />
//                   </Bar>
//                 </BarChart>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );