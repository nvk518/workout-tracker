import React, { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, useMediaQuery, useTheme, Stack, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const WorkoutLineChart = ({ workoutData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // States for Neil's statistics
  const [neilMean, setNeilMean] = useState(0);
  const [neilMedian, setNeilMedian] = useState(0);
  const [neilStd, setNeilStd] = useState(0);
  const [neilRange, setNeilRange] = useState(0);
  const [neilSeriesData, setNeilSeriesData] = useState([]);
  
  // States for Ria's statistics
  const [riaMean, setRiaMean] = useState(0);
  const [riaMedian, setRiaMedian] = useState(0);
  const [riaStd, setRiaStd] = useState(0);
  const [riaRange, setRiaRange] = useState(0);
  const [riaSeriesData, setRiaSeriesData] = useState([]);
  
  // State for x-axis labels
  const [xLabels, setXLabels] = useState([]);
  
  // eslint-disable-next-line
  const connectNulls = true;

  const processHistory = (history) => {
    const dateMap = {};
    history.forEach(d => {
      const date = new Date(d.date_edited).toISOString().split('T')[0];
      if (!dateMap[date] || (Number(d.weight) > Number(dateMap[date]))) {
        dateMap[date] = d.weight;
      }
    });

    const weights_series = history.map(d => Number(d.weight)).filter(weight => !isNaN(weight));

    return { dateMap, weights_series };
  };

  useEffect(() => {
    if (!workoutData || !workoutData.NeilHistory || !workoutData.RiaHistory) {
      return;
    }

    try {
      const neilHistory = processHistory(workoutData.NeilHistory);
      const riaHistory = processHistory(workoutData.RiaHistory);

      const neilData = Object.keys(neilHistory.dateMap)
        .sort((a, b) => new Date(a) - new Date(b))
        .map(date => ({ x: date, y: neilHistory.dateMap[date] }));

      const riaData = Object.keys(riaHistory.dateMap)
        .sort((a, b) => new Date(a) - new Date(b))
        .map(date => ({ x: date, y: riaHistory.dateMap[date] }));

      // Calculate Neil's statistics
      if (neilHistory.weights_series.length > 0) {
        const meanValue = neilHistory.weights_series.reduce((sum, value) => sum + value, 0) / neilHistory.weights_series.length;
        const sortedWeights = [...neilHistory.weights_series].sort((a, b) => a - b);
        const mid = Math.floor(sortedWeights.length / 2);
        const medianValue = sortedWeights.length % 2 !== 0 ? sortedWeights[mid] : (sortedWeights[mid - 1] + sortedWeights[mid]) / 2;
        const variance = neilHistory.weights_series.reduce((sum, value) => sum + (value - meanValue) ** 2, 0) / neilHistory.weights_series.length;
        const stdValue = Math.sqrt(variance);
        const rangeValue = Math.max(...neilHistory.weights_series) - Math.min(...neilHistory.weights_series);

        setNeilMean(meanValue);
        setNeilMedian(medianValue);
        setNeilStd(stdValue);
        setNeilRange(rangeValue);
      }

      // Calculate Ria's statistics
      if (riaHistory.weights_series.length > 0) {
        const meanValue = riaHistory.weights_series.reduce((sum, value) => sum + value, 0) / riaHistory.weights_series.length;
        const sortedWeights = [...riaHistory.weights_series].sort((a, b) => a - b);
        const mid = Math.floor(sortedWeights.length / 2);
        const medianValue = sortedWeights.length % 2 !== 0 ? sortedWeights[mid] : (sortedWeights[mid - 1] + sortedWeights[mid]) / 2;
        const variance = riaHistory.weights_series.reduce((sum, value) => sum + (value - meanValue) ** 2, 0) / riaHistory.weights_series.length;
        const stdValue = Math.sqrt(variance);
        const rangeValue = Math.max(...riaHistory.weights_series) - Math.min(...riaHistory.weights_series);

        setRiaMean(meanValue);
        setRiaMedian(medianValue);
        setRiaStd(stdValue);
        setRiaRange(rangeValue);
      }

      // Generate all dates between startDate and endDate
      const allDates = [];
      const startDate = new Date(Math.min(
        ...neilData.map(d => new Date(d.x)),
        ...riaData.map(d => new Date(d.x))
      ));
      const endDate = new Date(Math.max(
        ...neilData.map(d => new Date(d.x)),
        ...riaData.map(d => new Date(d.x))
      ));
      for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        allDates.push(new Date(d).toISOString().split('T')[0]);
      }

      setXLabels(allDates);

      // Create series data with null for missing dates
      const createSeriesData = (data, dates) => {
        const dataMap = new Map(data.map(d => [d.x, d.y]));
        return dates.map(date => dataMap.get(date) || null);
      };

      setNeilSeriesData(createSeriesData(neilData, allDates));
      setRiaSeriesData(createSeriesData(riaData, allDates));

    } catch (error) {
      console.log(error);
    }
  }, [workoutData]);

  if (!workoutData || !workoutData.NeilHistory || !workoutData.RiaHistory) {
    return <Box>Click on an exercise to view data</Box>;
  }

  return (
    <Card variant="outlined">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={8} // Increased spacing for better layout
        sx={{ width: '100%', mx: 'auto', my: 2 }}
        textAlign="center"
        alignItems="center" // Center align items
      >
        <Box minWidth={300} maxWidth={500}>
          <Typography fontSize={20} fontWeight={700}>{workoutData.exercise}</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Statistic</TableCell>
                  <TableCell>Ria</TableCell>
                  <TableCell>Neil</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Mean</TableCell>
                  <TableCell>{riaMean.toFixed(2)}</TableCell>
                  <TableCell>{neilMean.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Median</TableCell>
                  <TableCell>{riaMedian.toFixed(2)}</TableCell>
                  <TableCell>{neilMedian.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Std Dev</TableCell>
                  <TableCell>{riaStd.toFixed(2)}</TableCell>
                  <TableCell>{neilStd.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Increase</TableCell>
                  <TableCell>{riaRange.toFixed(2)}</TableCell>
                  <TableCell>{neilRange.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box textAlign="center" sx={{ width: '100%', my: 2, display: 'flex', justifyContent: 'center' }}>
          <LineChart
            width={isMobile ? 300 : 500}
            height={isMobile ? 200 : 300}
            series={[
              { data: neilSeriesData, label: 'Neil', connectNulls, valueFormatter: (value) => (value == null ? '-' : value.toString()) },
              { data: riaSeriesData, label: 'Ria', connectNulls, valueFormatter: (value) => (value == null ? '-' : value.toString()) },
            ]}
            xAxis={[{ scaleType: 'point', data: xLabels }]}
          />
        </Box>
      </Stack>
    </Card>
  );
};

export default WorkoutLineChart;
