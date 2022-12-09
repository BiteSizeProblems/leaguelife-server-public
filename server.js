const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const searchRoutes = require('./routes/search-routes');
const usersRoutes = require('./routes/users-routes');
const leaguesRoutes = require('./routes/leagues-routes');
const driversRoutes = require('./routes/drivers-routes');
const discordRoutes = require('./routes/discord-routes');
const HttpError = require('./models/http-error');

const port = process.env.PORT;
const server = express();

server.use(bodyParser.json());

server.use('/uploads/images', express.static(path.join('uploads', 'images')));

server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

server.use('/api/users', usersRoutes);
server.use('/api/leagues', leaguesRoutes);
server.use('/api/drivers', driversRoutes);
server.use('/api/search', searchRoutes);
server.use('/api/discord', discordRoutes);

server.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

server.use((error, req, res, next) => {
    if (req.file) { fs.unlink(req.file.path, (err) => { console.log(err); }); }

    if (res.headerSent) { return next(error); }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error has occured.' });
});

const db_username = 'xxxxxx';
const db_password = 'xxxxxx';
const db_name = 'xxxxxx';

mongoose.connect(
    `mongodb+srv://${db_username}:${db_password}@slipstreamcluster.nnurn.mongodb.net/${db_name}?retryWrites=true&w=majority`
).then(() => { server.listen(process.env.PORT || 5000); console.log(`listening on ${process.env.PORT || 5000}...`); console.log(process.version); }).catch(err => { console.log(err); });
