var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var foods = require('./routes/foods');
var products= require('./routes/products');
var userEssay= require('./routes/userEssay');
var order=require('./routes/order');
var regist=require('./routes/regist');
var log=require('./routes/log');
var search=require('./routes/search');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
if (process.env.NODE_ENV !== "test") {  
  app.use(logger("dev"))
}
app.use('/', routes);
app.use('/users', users);

//Our Custom Routes
app.get('/foods', foods.findAll);
app.get('/foods/:id', foods.findOne);
app.post('/foods', foods.addFood);
app.put('/foods/:id/likes', foods.incrementLikes);
app.delete('/foods/:id', foods.deleteFood);


app.get('/products', products.findAll);
app.get('/products/:id', products.findOne);
app.post('/products',products.addProduct);
app.put('/products/:id/likes', products.incrementLikes);
app.delete('/products/:id', products.deleteProduct);


app.get('/userEssay', userEssay.findAll);
app.get('/userEssay/:id', userEssay.findOne);
app.post('/userEssay',userEssay.addEssay);
app.put('/userEssay/:id/likes', userEssay.incrementLikes);
app.delete('/userEssay/:id', userEssay.deleteEssay);

app.get('/order/:id', order.findOne);
app.post('/order', order.addOrder);


app.post('/regist', regist.addUser);
app.get('/regist/:id',regist.findOne)

app.post('/log', log.logUser);

app.post('/search', search.searchProduct);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
