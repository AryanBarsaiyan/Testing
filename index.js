const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Connect to MongoDB Atlas using the connection string from the .env file
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB Atlas');
});

// Define a schema and model for the data (no specific schema)
const webhookSchema = new mongoose.Schema({}, { strict: false });
const Webhook = mongoose.model('Webhook', webhookSchema);

app.use(express.json());

app.post('/webhook', async (request, response) => {
    const data = request.body.data;

    try {
        data.forEach(async (element) => {
            const webhookEntry = new Webhook(element);
            await webhookEntry.save();
            console.log('Data saved successfully:', element);
        });
        response.status(200).send('Data received');
    } catch (err) {
        console.error('Error saving to database:', err);
        response.status(500).send('Internal Server Error');
    }
});

app.get('/webhook', (request, response) => {
    response.status(200).send('Webhook endpoint');
});

app.post('/webhook-test', async (request, response) => {
    const data = request.body;
    // check user name:aryan and password:1234
    if (data.username == process.env.USERNAME && data.password == process.env.PASSWORD) {
        try {
            const dbData = await Webhook.find({});
            console.log('Data read successfully:', dbData);
            response.status(200).send(dbData);
        } catch (err) {
            console.error('Error reading from database:', err);
            response.status(500).send('Internal Server Error');
        }
    } else {
        response.status(401).send('Unauthorized');
    }
});

app.post('/clear', async (request, response) => {
    const data = request.body;
    // check user name:aryan and password:1234
    if (data.username == process.env.USERNAME && data.password == process.env.PASSWORD) {
        try {
            await Webhook.deleteMany({});
            console.log('Database cleared');
            response.status(200).send('Database cleared');
        } catch (err) {
            console.error('Error clearing database:', err);
            response.status(500).send('Internal Server Error');
        }
    } else {
        response.status(401).send('Unauthorized');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on port ${port}`));
