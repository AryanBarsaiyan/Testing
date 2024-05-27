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

app.post('/webhook', (request, response) => {
    const data = request.body;

    // Save the data to the database
    const webhookEntry = new Webhook(data);
    webhookEntry.save((err) => {
        if (err) {
            console.error('Error saving to database:', err);
            response.status(500).send('Internal Server Error');
        } else {
            console.log('Data saved successfully:', data);
            response.status(200).send('Data received');
        }
    });
});

app.get('/webhook', (request, response) => {
    response.status(200).send('Webhook endpoint');
});

app.post('/webhook-test', (request, response) => {
    const data = request.body;
    // check user name:aryan and password:1234
    if(data.username == process.env.USERNAME && data.password == process.env.PASSWORD){
        //return the data from the database
        Webhook.find({}, (err, data) => {
            if (err) {
                console.error('Error reading from database:', err);
                response.status(500).send('Internal Server Error');
            } else {
                console.log('Data read successfully:', data);
                response.status(200).send(data);
            }
        });
    }
});

app.post('/clear', (request, response) => {
    const data = request.body;
    // check user name:aryan and password:1234
    if(data.username == process.env.USERNAME && data.password == process.env.PASSWORD){
        //clear the database
        Webhook.deleteMany({}, (err) => {
            if (err) {
                console.error('Error clearing database:', err);
                response.status(500).send('Internal Server Error');
            } else {
                console.log('Database cleared');
                response.status(200).send('Database cleared');
            }
        });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on port ${port}`));
