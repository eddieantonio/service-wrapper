// Main Dependencies:
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , cors = require('cors')
  ;

// Initialize the Express app.
var app = express()
  , corsOptions = {
    methods: ['POST']
  }
  ;



// Allow requests from all origins, but only for POST.
app.set('port', process.env.PORT || 3000);

// Middleware configurarion
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(cors(corsOptions));
app.use(app.router);

// Development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


/* Configure routes. */
app.post('/',  routes.classifier);
// CORS automatically gives us an OPTIONS route for pre-flighted requests.


// Create the HTTP server, listening on the desired port.
http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

