require('dotenv').config(); // Load environment variables at the very beginning

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:1344',
  'https://www.gymkhanna.space',
  'https://gymkhanna.space',
];

// const allowedOrigins = [
//   'http://localhost:1344',
// ];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir);
}

// Set up storage and file naming for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    console.log(totalWeight, d)
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


async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db('workout_tracker');
    const collection = db.collection('workouts');
    const rewardsCollection = db.collection('rewards');

    app.post('/upload', upload.single('image'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const image = req.file;
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${image.filename}`;

        await axios.post(discordWebhookUrl, {
          content: `🔥🔥🔥 DAMNNNNNN 🔥🔥🔥`,
          embeds: [
            {
              image: {
                url: imageUrl
              }
            }
          ]
        });

        res.status(200).json({ message: 'File uploaded successfully', url: imageUrl });
      } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Get all workouts
    app.get('/workouts', async (req, res) => {
      try {
        const workouts = await collection.find({}).toArray();
        res.status(200).json(workouts);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Add a new workout
    app.post('/workouts', async (req, res) => {
      const { workout, user, date_edited, weight } = req.body;
      try {
        const result = await collection.insertOne({ workout, user, date_edited, weight });
        res.status(201).json({ id: result.insertedId });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Update multiple workouts and send a Discord message
    app.post('/workouts/update', async (req, res) => {
      const updates = req.body;
      if (!Array.isArray(updates)) {
        return res.status(400).json({ error: 'Request body must be an array' });
      }
      console.log("Received updates: ", updates);
      try {
        const bulkOps = updates.map(update => ({
          updateOne: {
            filter: {
              workout: update.workout,
              user: update.user,
              date_edited: update.date_edited
            },
            update: { 
              $set: { weight: update.weight }
            },
            upsert: true
          }
        }));
        
        await collection.bulkWrite(bulkOps);
        const message = updates.map(update => (
          `**${update.user}** just increased ${update.user == "Ria" ? "her" : "his"} **${update.workout}** from **${update.old_weight} ${/Run|Running/i.test(update.workout) ? 'mi' : 'lbs'}** to **${update.weight} ${/Run|Running/i.test(update.workout) ? 'mi' : 'lbs'}**!`
        )).join('\n\n');
        let imageURL;
        if (message.includes("Ria") && message.includes("Neil")) {
          imageURL = "https://static.wikia.nocookie.net/kirby-fan-fiction/images/6/61/Yoshi_Kirby.png/revision/latest?cb=20200130190545";
        } else if (message.includes("Ria")) {
          imageURL = "https://m.media-amazon.com/images/I/51iJWSjeYDL.__AC_SX300_SY300_QL70_FMwebp_.jpg";
        } else if (message.includes("Neil")) {
          imageURL = "https://d3gz42uwgl1r1y.cloudfront.net/ca/caseyljones/submission/2018/06/096617ad26f0a638e0d413b0b4a3dbc5/2500x1500.jpg";
        }
        
        await axios.post(discordWebhookUrl, {
          content: `Workout Updates:\n\n${message}`,
          embeds: [
            {
              image: {
                url: imageURL
              }
            }
          ]
        });

        res.status(200).json({ message: 'Workouts updated successfully' });
      } catch (err) {
        console.error('Error during bulk write or Discord message creation: ', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Rewards API
    app.get('/rewards', async (req, res) => {
      try {
        const rewards = await rewardsCollection.find({}).toArray();
        res.status(200).json(rewards);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.post('/rewards', async (req, res) => {
      const { title, description, reward, claimed, badge, condition, number, type, workout, user } = req.body;
      try {
        const workoutData = await collection.find({ user }).toArray();
        const progress = calculateProgress(workoutData, condition, number, type, workout, user);

        const result = await rewardsCollection.insertOne({ title, description, progress, reward, claimed, badge, condition, number, type, workout, user });
        res.status(201).json({ id: result.insertedId });
      } catch (err) {
        console.error('Error creating reward:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.put('/rewards/:id', async (req, res) => {
      const { id } = req.params;
      const { title, description, reward, claimed, badge, condition, number, type, workout, user } = req.body;
      try {
        const workoutData = await collection.find({ user }).toArray();
        const progress = calculateProgress(workoutData, condition, number, type, workout, user);

        const result = await rewardsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { title, description, progress, reward, claimed, badge, condition, number, type, workout, user } }
        );
        res.status(200).json({ modifiedCount: result.modifiedCount });
      } catch (err) {
        console.error('Error updating reward:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.delete('/rewards/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const result = await rewardsCollection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).json({ deletedCount: result.deletedCount });
      } catch (err) {
        console.error('Error deleting reward:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log('Server running on port 3001');
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // Comment this line out to keep the server running
    // await client.close();
  }
}



run().catch(console.dir);
