/*
 * Remote request URL.
 */

var fs = require('fs')
  , http = require('http')
  , querystring = require('querystring')
  , uuid = require('node-uuid')
  , slurp = require('slurp-stream')
  , async = require('async')
  ;

// Path to write the file to.
var PATH_PREFIX = '/nfs/data1/SERVICES/classifier/text_'
  // URL of the web service -- this should be a secret!
  , REMOTE_URL = 'http://localhost:3000'
  ;

/**
 * Given some content, contacts the webservce. Calls the `done(err, data)`
 * callback when the result was obtained, or an error was encountered along the
 * way.
 */
function doClassify(content, done) {
  var filename;

  // Create a new unique name for the file.
  filename = PATH_PREFIX + uuid.v1();

  // [`async.waterfall`][waterfall] will run a bunch of asynchronous routines in a sequence,
  // feeding the result of the last into the proceeding routines.
  //
  // [waterfall]: https://github.com/caolan/async#waterfalltasks-callback
  async.waterfall([

    // Write content to the shared disk.
    function (done) {
      fs.writeFile(filename, content, done);
    },
    
    // Now make a GET request to the *real* service.
    function (done) {
      var getParams
        , serviceURL;

      // Construct the appropriate query string...
      getParams = querystring.stringify({
        filename: filename
      });

      // ... and the full URL.
      serviceURL = REMOTE_URL + '?' + getParams;

      // Make the GET request.
      // Note that this callback is irregular! Must make it nest a little bit...
      http.get(serviceURL, function (message) {

        // Slurp the contents of the server's response,
        // as long as the result was successful.
        if (message.statusCode !== 200) {
          done(new Error('Failed invoking service.'));
        } else {
          slurp(message, done);
        }
      });
    }

  ], done);

};
exports.classifier = function (req, res, next) {

  if (req.body && req.body.content) {
    // Got the content param! Do the classification, doing the following on its
    // return.
    doClassify(req.body.content, function (err, data) {

      // Let the error handling middleware deal with the error, if available.
      if (err) {
        return next(err);
      }

      // Send the response back to the user, verbatim.
      res.send(200, data);
    });

  } else {
    // Did not send proper parameters.
    res.send(400, 'Did not send `content`');
  }

};
