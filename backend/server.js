require('dotenv').config(); // Load environment variables at the very beginning

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Configure CORS to allow requests from your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:1344', // Replace with your frontend URL
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

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db('workout_tracker');
    const collection = db.collection('workouts');

    app.get('/workouts', async (req, res) => {
      try {
        const workouts = await collection.find({}).toArray();
        res.status(200).json(workouts);
      } catch (err) {
        console.error('Error fetching workouts:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.post('/workouts', async (req, res) => {
      const { workout, user, date_edited, weight } = req.body;
      try {
        const result = await collection.insertOne({ workout, user, date_edited, weight });
        res.status(201).json({ id: result.insertedId });
      } catch (err) {
        console.error('Error adding workout:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.post('/workouts/update', async (req, res) => {
      const updates = req.body;
      if (!Array.isArray(updates)) {
        return res.status(400).json({ error: 'Request body must be an array' });
      }
      console.log("Received updates: ", updates);
      try {
        const bulkOps = updates.map(update => ({
          updateOne: {
            filter: { workout: update.workout, user: update.user },
            update: { $set: { date_edited: update.date_edited, weight: update.weight } },
            upsert: true
          }
        }));

        await collection.bulkWrite(bulkOps);

        const message = updates.map(update => (
          `**${update.user}** just increased ${update.user === "Ria" ? "her" : "his"} **${update.workout}** from **${update.old_weight} lbs** to **${update.weight} lbs**!`
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
        console.error('Error during bulk write or Discord message creation:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } finally {
    // Keep the connection open, especially if the server is expected to handle continuous requests.
    // await client.close(); // Uncomment if you want to close the connection after the script runs
  }
}

run().catch(console.dir);
