import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Paper, Table, TableBody, TableCell, Backdrop, TableContainer,
  TableHead, TablePagination, TableRow, CircularProgress, Box,
  Typography
} from '@mui/material';
import Header from './Header';

// const API_BASE_URL = 'https://perfect-dog-supposedly.ngrok-free.app';
const API_BASE_URL = 'https://workout-tracker-hdq7.onrender.com';

const columns = [
  { id: 'date', label: 'Date & Time', minWidth: 170 },
  { id: 'exercise', label: 'Exercise 💪🏽', minWidth: 170 },
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'weight', label: 'Weight (lbs)', minWidth: 100, align: 'right' },
];

const History = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/workouts`);
        let workoutData = response.data;

        workoutData.sort((a, b) => new Date(b.date_edited) - new Date(a.date_edited));

        setData(workoutData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching workout data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <>
      <Header />
      <Box sx={{ padding: 2 }}>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>   
        <Typography fontSize={24} gutterBottom>Our History</Typography>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((workout, index) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      <TableCell>{new Date(workout.date_edited).toLocaleString()}</TableCell>
                      <TableCell>{workout.workout}</TableCell>
                      <TableCell>{workout.user}</TableCell>
                      <TableCell align="right">{workout.weight}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
      </Box>
    </>
  );
};

export default History;
