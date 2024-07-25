import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, useMediaQuery, useTheme, Stack, Typography } from '@mui/material';

const WorkoutLineChart = ({ workoutData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // eslint-disable-next-line
  const connectNulls = true;

  if (!workoutData || !workoutData.NeilHistory || !workoutData.RiaHistory) {
    return <Box>Click on an exercise to view data</Box>;
  }

  let neilData = [];
  let riaData = [];
  let neilSeriesData = [];
  let riaSeriesData = [];
  let xLabels = [];

  const processHistory = (history) => {
    const dateMap = {};
    history.forEach(d => {
      const date = new Date(d.date_edited).toISOString().split('T')[0]; // Ensure consistent date format
      if (!dateMap[date] || (Number(d.weight) > Number(dateMap[date]))) {
        dateMap[date] = d.weight;
      }
    });

    return Object.keys(dateMap)
      .sort((a, b) => new Date(a) - new Date(b)) // Sort dates in ascending order
      .map(date => ({ x: date, y: dateMap[date] }));
  };

  try {
    neilData = processHistory(workoutData.NeilHistory);
    riaData = processHistory(workoutData.RiaHistory);

    // Get the earliest and latest date across both datasets
    const startDate = new Date(Math.min(
      ...neilData.map(d => new Date(d.x)),
      ...riaData.map(d => new Date(d.x))
    ));

    const endDate = new Date(Math.max(
      ...neilData.map(d => new Date(d.x)),
      ...riaData.map(d => new Date(d.x))
    ));

    // Generate all dates between startDate and endDate
    const allDates = [];
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.push(new Date(d).toISOString().split('T')[0]);
    }

    xLabels = allDates;

    // Create series data with null for missing dates
    const createSeriesData = (data, dates) => {
      const dataMap = new Map(data.map(d => [d.x, d.y]));
      return dates.map(date => dataMap.get(date) || null);
    };

    neilSeriesData = createSeriesData(neilData, xLabels);
    riaSeriesData = createSeriesData(riaData, xLabels);

  } catch (error) {
    console.log(error);
    return <Box>Click on an exercise to view data</Box>;
  }

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={{ xs: 4, md: 8 }}
      sx={{ width: '100%', mx: 'auto', my: 2 }}
      textAlign="center"
    >
      <Box minWidth={100}>
        <Typography fontSize={20} fontWeight={700}>{workoutData.exercise}</Typography>
      </Box>
      <Box textAlign="center" sx={{ width: '100%', my: 2 }}>
        <LineChart
          width={isMobile ? 300 : 500}
          height={isMobile ? 200 : 300}
          series={[
            { data: neilSeriesData, label: 'Neil', connectNulls, valueFormatter: (value) => (value == null ? 'NaN' : value.toString()) },
            { data: riaSeriesData, label: 'Ria', connectNulls, valueFormatter: (value) => (value == null ? 'NaN' : value.toString()) },
          ]}
          xAxis={[{ scaleType: 'point', data: xLabels }]}
        />
      </Box>
    </Stack>
  );
};

export default WorkoutLineChart;
