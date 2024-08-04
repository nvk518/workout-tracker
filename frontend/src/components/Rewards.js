import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Backdrop, CircularProgress, Typography, LinearProgress, Button, CardActions, ImageList, ImageListItem, ImageListItemBar, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem } from '@mui/material';
import Header from './Header';

// const API_BASE_URL = 'https://perfect-dog-supposedly.ngrok-free.app';
const API_BASE_URL = 'https://workout-tracker-hdq7.onrender.com';

const Rewards = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newReward, setNewReward] = useState({
    title: '',
    description: '',
    progress: 0,
    reward: '',
    claimed: false,
    badge: '',
    condition: '>=',
    number: 0,
    type: 'streak',
    workout: '',
    user: 'Ria'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workoutResponse = await axios.get(`${API_BASE_URL}/workouts`);
        const workouts = workoutResponse.data;

        const rewardsResponse = await axios.get(`${API_BASE_URL}/rewards`);
        const rewards = rewardsResponse.data;

        const updatedRewards = rewards.map(reward => {
          const progress = calculateProgress(workouts, reward.condition, reward.number, reward.type, reward.workout, reward.user);
          return { ...reward, progress };
        });

        setAchievements(updatedRewards);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const calculateStreak = (data, user, milestone) => {
    const userWorkouts = data.filter(workout => workout.user === user).sort((a, b) => new Date(a.date_edited) - new Date(b.date_edited));
    let streak = 0;
    let maxStreak = 0;

    userWorkouts.forEach((workout, index) => {
      if (index === 0) {
        streak = 1;
      } else {
        const prevDate = new Date(userWorkouts[index - 1].date_edited);
        const currDate = new Date(workout.date_edited);
        const diffInDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

        if (diffInDays === 1) {
          streak++;
        } else {
          streak = 1;
        }

        maxStreak = Math.max(maxStreak, streak);
      }
    });

    return Math.min(maxStreak / milestone, 1) * 100;
  };

  const calculateProgress = (data, condition, number, type, workout, user) => {
    let progress = 0;
    if (type === 'streak') {
      progress = calculateStreak(data, user, number);
    } else if (type === 'weight') {
      const totalWeight = data
        .filter(d => d.user === user && d.workout === workout)
        .reduce((total, d) => total + Number(d.weight), 0);
      switch (condition) {
        case '>=':
          progress = totalWeight >= number ? 100 : (totalWeight / number) * 100;
          break;
        case '>':
          progress = totalWeight > number ? 100 : (totalWeight / number) * 100;
          break;
        case '=':
          progress = totalWeight === number ? 100 : 0;
          break;
        case '<=':
          progress = totalWeight <= number ? 100 : (1 - (totalWeight - number) / number) * 100;
          break;
        case '<':
          progress = totalWeight < number ? 100 : (1 - (totalWeight - number) / number) * 100;
          break;
      }
    }
    return progress;
  };

  const handleClaimReward = async (index, rewardId) => {
    try {
      await axios.put(`${API_BASE_URL}/rewards/${rewardId}`, {
        ...achievements[index],
        claimed: true
      });

      setAchievements(prevAchievements => {
        const newAchievements = [...prevAchievements];
        newAchievements[index] = { ...newAchievements[index], claimed: true };
        return newAchievements;
      });
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReward(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCreateReward = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/rewards`, newReward);
      setAchievements(prevAchievements => [...prevAchievements, { ...newReward, _id: response.data.id }]);
      setOpen(false);
      setNewReward({
        title: '',
        description: '',
        progress: 0,
        reward: '',
        claimed: false,
        badge: '',
        condition: '>=',
        number: 0,
        type: 'streak',
        workout: '',
        user: 'Ria'
      });
    } catch (error) {
      console.error('Error creating reward:', error);
    }
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
        <Box>
          <Typography fontSize={24} gutterBottom>Achievements</Typography>
          {achievements.map((achievement, index) => (
            <Card key={index} sx={{ maxWidth: 800, marginBottom: 2 }}>
              <CardContent>
                <Typography variant="h6">{achievement.title}</Typography>
                <Typography variant="body2" color="textSecondary">{achievement.description}</Typography>
                <LinearProgress variant="determinate" value={achievement.progress} sx={{ margin: 1 }} />
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  disabled={achievement.progress < 100 || achievement.claimed}
                  onClick={() => handleClaimReward(index, achievement._id)}
                >
                  Claim {achievement.reward}!
                </Button>
              </CardActions>
            </Card>
          ))}
          <Box my={10}><Button variant="contained" onClick={() => setOpen(true)}>Add New Achievement</Button></Box>
        </Box>
        <Box>
          <Typography fontSize={24} gutterBottom>Badges</Typography>
          <ImageList sx={{ width: 500 }}>
            {achievements.filter((w) => w.progress >= 100).map((achievement, index) => (
              <ImageListItem key={index}>
                <img
                  src={achievement.badge}
                  loading="lazy"
                  style={{ 
                    height: '200px', 
                    width: '200px', 
                    borderRadius: '10%', 
                    objectFit: 'cover',
                  }}
                />
                <ImageListItemBar
                  title={achievement.title}
                  position="below"
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Create New Achievement</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Title"
              type="text"
              fullWidth
              value={newReward.title}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              value={newReward.description}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="reward"
              label="Reward"
              type="text"
              fullWidth
              value={newReward.reward}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="badge"
              label="Badge URL"
              type="text"
              fullWidth
              value={newReward.badge}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="condition"
              label="Condition"
              select
              fullWidth
              value={newReward.condition}
              onChange={handleInputChange}
            >
              <MenuItem value=">=">{'>='}</MenuItem>
              <MenuItem value=">">{'>'}</MenuItem>
              <MenuItem value="=">{'='}</MenuItem>
              <MenuItem value="<">{'<'}</MenuItem>
              <MenuItem value="<=">{'<='}</MenuItem>
            </TextField>
            <TextField
              margin="dense"
              name="number"
              label="Number"
              type="number"
              fullWidth
              value={newReward.number}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="type"
              label="Type"
              select
              fullWidth
              value={newReward.type}
              onChange={handleInputChange}
            >
              <MenuItem value="streak">Streak</MenuItem>
              <MenuItem value="weight">Weight</MenuItem>
            </TextField>
            <TextField
              margin="dense"
              name="workout"
              label="Workout"
              type="text"
              fullWidth
              value={newReward.workout}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="user"
              label="User"
              type="text"
              fullWidth
              value={newReward.user}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateReward}>Create</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Rewards;
