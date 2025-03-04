import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Paper,
  TextField, Button, Box, Accordion, AccordionSummary, AccordionDetails, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery, useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import WorkoutLineChart from './WorkoutLineChart';

const EditableTable = () => {
  const [workouts, setWorkouts] = useState([]);
  const [editData, setEditData] = useState({});
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newExercise, setNewExercise] = useState({ exercise: '', Neil: '', Ria: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const apiEndpoint = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  console.log(apiEndpoint);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('api/workouts');
        const allExercises = getAllExercises(response.data);
        const latestWorkouts = getLatestWorkouts(response.data, allExercises);
        setExercises(allExercises);
        setWorkouts(latestWorkouts);
        setEditData(formatEditData(latestWorkouts));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const getAllExercises = (data) => {
    console.log(data);
    const allExercises = data.map(d => d.workout);
    const uniqueExercises = [...new Set(allExercises)];
    return uniqueExercises;
  };

  const getLatestWorkouts = (data, exercises) => {
    const users = ['Neil', 'Ria'];
    const latestWorkouts = exercises.map(exercise => {
      const workout = { exercise };
      // console.log("workout:", workout, data);
      users.forEach(user => {

        const userData = data.filter(d => d.workout === exercise && d.user === user);
        // console.log("userData:", userData)
        userData.sort((a, b) => new Date(b.date_edited) - new Date(a.date_edited));
  
        const latestEntry = userData.length > 0 ? userData[0] : { weight: '' };
        const history = userData;
  
        workout[user] = latestEntry.weight;
        workout[`${user}History`] = history;
      });
      return workout;
    });
    return latestWorkouts;
  };
  
  const formatEditData = (workouts) => {
    const editData = {};
    workouts.forEach(workout => {
      editData[workout.exercise] = {
        Neil: workout.Neil,
        Ria: workout.Ria
      };
    });
    console.log("formatEditData:", editData)
    return editData;
  };

  const handleChange = (exercise, user, value) => {
    setEditData(prevState => ({
      ...prevState,
      [exercise]: {
        ...prevState[exercise],
        [user]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      const updates = [];
      for (const ind in workouts) {
        let workout = workouts[ind];
        let exercise = workout.exercise;
        if (editData.hasOwnProperty(exercise)) {
          const neilData = {
            workout: exercise,
            user: 'Neil',
            date_edited: new Date().toISOString(),
            weight: editData[exercise].Neil,
            old_weight: workout.Neil
          };
          const riaData = {
            workout: exercise,
            user: 'Ria',
            date_edited: new Date().toISOString(),
            weight: editData[exercise].Ria,
            old_weight: workout.Ria
          };
          console.log("editData:", editData[exercise].Neil, workout.Neil, editData[exercise].Ria, workout.Ria)
          if (editData[exercise].Neil !== workout.Neil)
            updates.push(neilData);
          if (editData[exercise].Ria !== workout.Ria)
            updates.push(riaData);
        }
      }
      console.log(updates)
      if (updates.length > 0) {
        await axios.post('/api/workouts/update', updates);
      }
      const response = await axios.get('/api/workouts');
      const allExercises = getAllExercises(response.data);
      const latestWorkouts = getLatestWorkouts(response.data, allExercises);
      setExercises(allExercises);
      setWorkouts(latestWorkouts);
      console.log("last:", allExercises, latestWorkouts);
      setEditData(formatEditData(latestWorkouts));
    } catch (error) {
      console.error('Error saving workouts:', error);
    }
  };

  const handleNewExerciseChange = (field, value) => {
    setNewExercise(prevState => ({
      ...prevState,
      [field]: value
    }));
  };

  const handleAddExercise = async () => {
    console.log("adding new exercise...");
    if (newExercise.exercise === "") {
      return;
    }
    try {
      const newNeilData = {
        workout: newExercise.exercise,
        user: 'Neil',
        date_edited: new Date().toISOString(),
        weight: newExercise.Neil
      };
      const newRiaData = {
        workout: newExercise.exercise,
        user: 'Ria',
        date_edited: new Date().toISOString(),
        weight: newExercise.Ria
      };
      await axios.post('/api/workouts', newNeilData);
      await axios.post('/api/workouts', newRiaData);
      const response = await axios.get('/api/workouts');
      const allExercises = getAllExercises(response.data);
      const latestWorkouts = getLatestWorkouts(response.data, allExercises);
      setExercises(allExercises);
      setWorkouts(latestWorkouts);
      setEditData(formatEditData(latestWorkouts));
      setNewExercise({ exercise: '', Neil: '', Ria: '' });  // Reset new exercise fields
      setIsAddModalOpen(false); // Close the modal after adding
    } catch (error) {
      console.error('Error adding new exercise:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleWorkoutSelect = (exercise) => {
    const workoutData = workouts.find(workout => workout.exercise === exercise);
    setSelectedWorkout(workoutData ? { ...workoutData } : null);
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Paper sx={{ width: '100%', overflow: 'hidden', p: isMobile ? 1 : 2 }}>
        {<WorkoutLineChart workoutData={selectedWorkout} />}
        <TableContainer sx={{ maxHeight: 440, width: '100%' }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Exercise 💪🏽</TableCell>
                <TableCell sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Ria 🏋🏽‍♀️</TableCell>
                <TableCell sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Neil 🏋🏽‍♂️</TableCell>
                <TableCell sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workouts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((workout) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={workout.exercise} onClick={() => handleWorkoutSelect(workout.exercise)}>
                  <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold', width: "150px" }}>{workout.exercise}</TableCell>
                  <TableCell>
                    <TextField
                      value={editData[workout.exercise]?.Ria || ''}
                      onChange={(e) => handleChange(workout.exercise, 'Ria', e.target.value)}
                      sx={{ width: "150px" }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={editData[workout.exercise]?.Neil || ''}
                      onChange={(e) => handleChange(workout.exercise, 'Neil', e.target.value)}
                      sx={{ width: "150px" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>View Details</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" style={{ marginTop: '10px' }}>
                          <strong>Ria's Progress:</strong>
                          {workout.RiaHistory.map((entry, index) => (entry.weight !== "" && entry.weight !== "0") ? (
                            <div key={index}>
                              {new Date(entry.date_edited).toLocaleDateString()}: {entry.weight} lbs
                            </div>
                          ) : "")}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Neil's Progress:</strong>
                          {workout.NeilHistory.map((entry, index) => (entry.weight !== "" && entry.weight !== "0") ? (
                            <div key={index}>
                              {new Date(entry.date_edited).toLocaleDateString()}: {entry.weight} lbs
                            </div>
                          ) : "")}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={workouts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Box mt={2} textAlign="center">
          <Button variant="outlined" onClick={openAddModal} startIcon={<EditIcon />} sx={{ width: '50%' }}>
            Add Exercise
          </Button>
        </Box>
        <Box p={2} textAlign="center">
          <Button variant="contained" color="success" onClick={handleSave} startIcon={<SaveIcon />} sx={{ width: '50%' }}>
            Save Changes
          </Button>
        </Box>
      </Paper>

      <Dialog open={isAddModalOpen} onClose={closeAddModal}>
        <DialogTitle>Add New Exercise</DialogTitle>
        <DialogContent>
          <TextField
            label="Exercise"
            value={newExercise.exercise}
            onChange={(e) => handleNewExerciseChange('exercise', e.target.value)}
            margin="normal"
            fullWidth
          />
          <TextField
            label="Ria"
            value={newExercise.Ria}
            onChange={(e) => handleNewExerciseChange('Ria', e.target.value)}
            margin="normal"
            fullWidth
          />
          <TextField
            label="Neil"
            value={newExercise.Neil}
            onChange={(e) => handleNewExerciseChange('Neil', e.target.value)}
            margin="normal"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddExercise} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditableTable;
