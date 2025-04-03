const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = express();

let mongoServer;
let server;

//DB connection
async function startInMemoryMongoDB() {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
}

startInMemoryMongoDB().catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

app.use(express.json());

//MongoDB Schema
const ResourceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    id: { type: Number, required: true, unique: true },
    quantity: { type: Number, required: true }
});

const Resource = mongoose.model('Resource', ResourceSchema);

//Server connection
if (process.env.NODE_ENV !== 'test') {
    const PORT = 3000;
    server = app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
}

//Routes

//Get id
app.get('/resources/:id', async (req, res) => {
    try {
        const resource = await Resource.findOne({ id: Number(req.params.id) });
        if (!resource) return res.status(404).send();
        res.status(200).send(resource);
    } catch (error) {
        res.status(500).send(error);
    }
});

//Get
app.get('/resources', async (req, res) => {
    try {
        const resources = await Resource.find();
        res.status(200).send(resources);
    } catch (error) {
        res.status(500).send(error);
    }
});

//Post
app.post('/resources', async (req, res) => {
    try {
        const resource = new Resource(req.body);
        await resource.save();
        res.status(201).send(resource);
    } catch (error) {
        res.status(400).send(error);
    }
});

//Patch
app.patch('/resources/:id', async (req, res) => {
    try {
        const resource = await Resource.findOneAndUpdate(
            { id: Number(req.params.id) },
            req.body,
            { new: true }
        );
        if (!resource) return res.status(404).send();
        res.status(200).send(resource);
    } catch (error) {
        res.status(400).send(error);
    }
});

//Delete
app.delete('/resources/:id', async (req, res) => {
    try {
        const resource = await Resource.findOneAndDelete({ id: Number(req.params.id) });
        if (!resource) return res.status(404).send();
        res.status(204).send(resource);
    } catch (error) {
        res.status(500).send(error);
    }
});

//Cleanup on exit
process.on('SIGTERM', async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    server.close();
});

module.exports = app;