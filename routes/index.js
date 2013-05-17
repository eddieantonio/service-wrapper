/*
 * Remote request URL.
 */

var fs = require('fs')
  , http = require('http')
  , querystring = require('querystring')
  , uuid = require('node-uuid')
  , slurp = require('slurp-stream')
  // Path to write the file to.
  , PATH_PREFIX = '/nfs/data1/SERVICES/classifier/text_'
  // URL of the web service -- this should be internal!
  , REMOTE_URL = 'http://abrolhos.nis.ualberta.ca:8080/simpleweka/rest/defaultmodel'
  ;

exports.classifier = function (req, res, next) {
  var content
    , id
    , filename
    , getParams
    , serviceURL
    ;

  if (req.body && req.body.content) {

    // Got the content param! Now write it to the disk, send a request, and send things
    // back.

    content = req.params.content;

    // Create a new unique name for the file.
    id = uuid.v1();
    filename = PATH_PREFIX + id;

    // Write the file, then make the request.
    fs.writeFile(filename, content, function (err) {

      // Make the appropriate query string.
      getParams = querystring.stringify({
        filename: filename
      });

      // Construct the URL.
      serviceURL = REMOTE_URL + '?' + getParams;

      // Make the GET request.
      http.get(serviceURL, function (serviceReply) {

        // Make sure the status code is ok.
        if (serviceReply.statusCode !== 200) {
          throw new Error('Failed invoking service.');
        }

        // Now send the response back to the user, verbatim.
        slurp(serviceReply, function (err, data) {
          // Boilerplate error "handling".
          if (err) throw err;

          res.send(data);
        });

      }).on('error', function (err) {
        // Let the error handling middleware deal with it, if available.
        next(err);
      });

    });


  } else {
    // Did not send proper parameters.
    res.send(400, 'Did not send `content`');
  }

};
