import React from 'react';
import Metric from "./metric";
import { Box, Paper } from "@mui/material";
import '../style.css';

const MetricContainer = ({metrics}) => {

  // to process FCP data
  let FCP_score = 0;
  if (metrics.FCP < 500) FCP_score = Math.round(90 + ((500 - metrics.FCP) / (500 - 50)) * (10 - 0.01));
  else if (metrics.FCP < 1800) FCP_score = Math.round(90 - ((metrics.FCP - 500) / (1800 - 500)) * (90 - 80));
  else if (metrics.FCP < 3000) FCP_score = Math.round(80 - ((metrics.FCP - 1800) / (3000 - 1800)) * (80 - 60));
  else FCP_score = Math.round(60 * Math.exp(-0.003 * (metrics.LCP - 3000)));

  // to process LCP data
  let LCP_score = 0;
  if (metrics.LCP < 1000) LCP_score = Math.round(90 + ((1000 - metrics.LCP) / (1000 - 80)) * (10 - 0.01));
  else if (metrics.LCP < 2500) LCP_score = Math.round(90 - ((metrics.LCP - 1000) / (2500 - 1000)) * (90 - 80));
  else if (metrics.LCP < 4000) LCP_score = Math.round(80 - ((metrics.LCP - 2500) / (4000 - 2500)) * (80 - 60));
  else LCP_score = Math.round(60 * Math.exp(-0.005 * (metrics.LCP - 4000)));

  // to process CLS data  
  let CLS_score = 0;
  if (metrics.CLS < 0.05) CLS_score = Math.round(90 + ((0.05 - metrics.CLS) / (0.05 - 0)) * (10 - 0.01));
  else if (metrics.CLS < 0.1) CLS_score = Math.round(90 - ((metrics.CLS - 0.05) / (0.1 - 0.05)) * (90 - 80));
  else if (metrics.CLS < 0.25) CLS_score = Math.round(80 - ((metrics.CLS - 0.1) / (0.25 - 0.1)) * (80 - 60));
  else CLS_score = Math.round(60 * Math.exp(-0.003 * (metrics.CLS - 0.25)));
  const clsShow = isNaN(metrics.CLS) ? 0 : CLS_score;
  const clsValue = isNaN(metrics.CLS) ? 0 : metrics.CLS.toFixed(2);

  // to process TBT data
  let TBT_score = 0;
  if (metrics.TBT < 100) TBT_score = Math.round(90 + ((100 - metrics.TBT) / (100 - 0)) * (10 - 0.01));
  else if (metrics.TBT < 200) TBT_score = Math.round(90 - ((metrics.TBT - 100) / (200 - 100)) * (90 - 80));
  else if (metrics.TBT < 600) TBT_score = Math.round(80 - ((metrics.TBT - 200) / (600 - 200)) * (80 - 60));
  else TBT_score = Math.round(60 * Math.exp(-0.003 * (metrics.TBT - 600)));

  // to process FID data
  let FID_score = 0;
  if (metrics.FID < 50) FID_score = Math.round(90 + ((50 - metrics.FID) / (50 - 0)) * (10 - 0.01));
  else if (metrics.FID < 100) FID_score = Math.round(90 - ((metrics.FID - 50) / (100 - 50)) * (90 - 80));
  else if (metrics.FID < 300) FID_score = Math.round(80 - ((metrics.FID - 100) / (300 - 100)) * (80 - 60));
  else FID_score = Math.round(60 * Math.exp(-0.003 * (metrics.FID - 300)));
  const fidShow = isNaN(metrics.FID) ? 0 : FID_score;
  const fidValue = isNaN(metrics.FID) ? 0 : metrics.FID;
  
  return (
    <div id='overall-metric-container'>
      <Paper sx={{ boxShadow: 3 }}>
        <div className='metric-container-inner'>
          <Box sx={{ display: "flex", gap: 5 }}>
            <Metric
            name={"FCP"}
            value={FCP_score}
            description={`First Contentful Paint: ${Math.round(metrics.FCP)}ms -
                            Marks the time at which the first text or image is painted`}
            />
            <Metric
            name={"LCP"}
            value={LCP_score}
            description={`Largest Contentful Paint: ${Math.round(metrics.LCP)}ms -
                            Marks the time at which the largest text or image is painted`}
            />
            <Metric
            name={"CLS"}
            value={clsShow}
            description={`Cumulative Layout Shift: ${clsValue} -
                            Measures the movement of visible elements within the viewport`}
            />
            <Metric
            name={"TBT"}
            value={TBT_score}
            description={`Total Blocking Time: ${Math.round(metrics.TBT)}ms -
                            Sum of all time periods between FCP and Time to Interactive,\n
                            when task length exceeds 50ms`}
            />
            <Metric
            name={"FID"}
            value={fidShow}
            description={`First Input Delay: ${Math.round(fidValue)}ms -
            Measures the time from when a user first interacts with a page to the time when the browser\n 
            is actually able to begin processing event handlers in response to that interaction`}
            />
          </Box>
        </div>
      </Paper>
    </div>
  )
}

export default MetricContainer