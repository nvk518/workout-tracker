require('dotenv').config(); // Load environment variables at the very beginning

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:1344', // Replace with your frontend URL
  // origin: 'http://localhost:1344',
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


async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db('workout_tracker');
    const collection = db.collection('workouts');

    app.post('/upload', upload.single('image'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const image = req.file;
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${image.filename}`;

        await axios.post(discordWebhookUrl, {
          content: `RAHHHH.`,
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
          `**${update.user}** just increased ${update.user == "Ria" ? "her" : "his"} **${update.workout}** from **${update.old_weight} lbs** to **${update.weight} lbs**!`
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
