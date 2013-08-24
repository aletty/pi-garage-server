
/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , routes = require('./routes')
  , userRoute = require('./routes/user')
  , devRoute = require('./routes/dev')
  , models = require('./models/models.js')
  , path = require('path')
  , passport = require('passport')
  , mongoose = require('mongoose');

// all environments
app.configure(function(){
    app.set('port', process.env.PORT || 4000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());

    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(express.cookieParser());
    app.use(express.session({secret : 'aboys'}));

    //passport initialization
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

    //mongoDB settings
    var uristring = process.env.MONGODB_URI || 
    process.env.MONGOLAB_URI ||
    'mongodb://localhost/garage';
    var mongoOptions = {db : {safe: true}};

    mongoose.connect(uristring, mongoOptions, function(err, res){
      if (err){
        console.log('error connecting to: ' + uristring);
      } else{
        console.log('succeeded connecting to: ' + uristring);
      }
    });
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//configure passport
passport.use(models.userModel.createStrategy());
passport.serializeUser(models.userModel.serializeUser());
passport.deserializeUser(models.userModel.deserializeUser());

//passport middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {return next(); }
  res.redirect('/login');
}

//routes
app.get('/', ensureAuthenticated, routes.index);

app.get('/login', userRoute.getLogin);
app.post('/login', passport.authenticate('local'), userRoute.postLogin);

app.get('/register',userRoute.getRegister);
app.post('/register', userRoute.postRegister);

app.get('/logout', userRoute.logout);

server.listen(app.get('port'));

//heroku socket.io config settings
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});


//real time notification logic
io.of('/notify').on('connection', function (socket) {
  socket.once('user', function(userData){
    socket.join(userData.name);
  });

  socket.on('push', function(data){
    if (data.name){
      socket.broadcast.to(data.name, data).emit('update', data);
    } else {
      socket.broadcast.emit('update', data);
    }
  });
});

//communication with pi
io.of('/pi').on('connection', function (socket) {
  socket.on('garage', function(){
    socket.broadcast.emit('start garage');
  });
});