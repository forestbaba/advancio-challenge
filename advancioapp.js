const express = require('express'),
    app = express(),
    bodyParser = require("body-parser"),
    cors = require("cors"),
    pool = require('./app/utility/worker'),
    logger = require('morgan'),
    User = require('./app/api/user/users');
    Comment = require('./app/api/comment/comment');



app.use(cors({ credentials: true, origin: true }));
app.use(logger('dev'));
app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api/v1/users', User);
app.use('/api/v1/comments', Comment);



app.get('/api/', (req, res) => {
    res.status(200).json({ error: false, message: 'Hello Advancio' })
});


const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`)
})