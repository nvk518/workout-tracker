import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Backdrop, CircularProgress, Typography, LinearProgress, Button, CardActions, ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
import Header from './Header';

// const API_BASE_URL = 'https://perfect-dog-supposedly.ngrok-free.app';
const API_BASE_URL = 'https://workout-tracker-hdq7.onrender.com';

const Rewards = () => {
  const [achievements, setAchievements] = useState([
    { title: 'First Lift', description: 'Completed your first lift!', progress: 0, reward: 'Massage', claimed: false, badge: '/badges/heart.png' },
    { title: '50kg Milestone', description: 'Lifted a total of 50kg!', progress: 0, reward: '', claimed: false, badge: '/badges/milestone-50kg.png' },
    { title: '100kg Milestone', description: 'Lifted a total of 100kg!', progress: 0, reward: '', claimed: false, badge: '/badges/milestone-100kg.png' },
    { title: 'Streak Milestone', description: '5 Days in a Row!', progress: 0, reward: '', claimed: false, badge: '/badges/streak-milestone.png' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/workouts`);
        const workoutData = response.data;

        const getTotalWeightForExercise = (exercise, user = 'Ria') => {
          return workoutData
            .filter((workout) => workout.user === user && workout.workout === exercise)
            .reduce((total, workout) => Number(total) + Number(workout.weight), 0);
        };

        const newAchievements = [
          { title: 'First Lift', description: `Completed your first lift! Current: ${workoutData.some(workout => workout.user === 'Ria')}`, progress: workoutData.some(workout => workout.user === 'Ria') ? 100 : 0, reward: "Massage", claimed: false, badge: '/badges/heart.png' },
          { title: 'Leg Press 3x10 150lb Milestone', description: `Lifted a total of 50! Current: ${getTotalWeightForExercise('Leg Press')} lbs`, progress: Math.min(getTotalWeightForExercise('Leg Press') / 50, 1) * 100, reward: "", claimed: false, badge: '/badges/milestone-50kg.png' },
          { title: 'Leg Press 3x10 175lb Milestone', description: `Lifted a total of 100lbs! Current: ${getTotalWeightForExercise('Leg Press')} lbs`, progress: Math.min(getTotalWeightForExercise('Leg Press') / 100, 1) * 100, reward: "", claimed: false, badge: '/badges/milestone-100kg.png' },
          { title: 'Streak Milestone', description: `5 Days in a Row! Current: ${calculateStreak(workoutData, 'Ria', 5) / 100 * 5}`, progress: calculateStreak(workoutData, 'Ria', 5), reward: "", claimed: false, badge: '/badges/streak-milestone.png' },
        ];

        setAchievements(newAchievements);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching workout data:', error);
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

    return Math.min(maxStreak / milestone, 1) * 100; // Assuming 5 is the milestone for a streak
  };

  const handleClaimReward = (index) => {
    setAchievements(prevAchievements => {
      const newAchievements = [...prevAchievements];
      newAchievements[index] = { ...newAchievements[index], claimed: true };
      return newAchievements;
    });
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
                      onClick={() => handleClaimReward(index)}
                    >
                      Claim {achievement.reward}!
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
            <Box>
              <Typography fontSize={24} gutterBottom>Badges</Typography>
              <ImageList sx={{ width: 500 }}>
                {achievements.filter((w) => w.progress >= 100).map((achievement, index) => (
                  (
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
                  )
                ))}
              </ImageList>
            </Box>
          </Box>
        
      </Box>
    </>
  );
};

export default Rewards;
