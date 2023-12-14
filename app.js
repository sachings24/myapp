var createError = require('http-errors');
var express = require('express');
// var logger = require('morgan');
var bodyParser = require('body-parser')

var indexRouter = require('./routes/index');
var booksRouter = require('./routes/books');
var app = express();
const port = 3000;

app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({
    extended: true
}));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', indexRouter);
app.use('/books', booksRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    // Send a specific error response if available, otherwise a generic one
    res.status(err.status || 500).json({ error: err.message || 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

module.exports = app;