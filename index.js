'use strict';

exports.handler = function(event, context, callback) {
  const AWS = require('aws-sdk');
  var http = require('http');

  const queryStringParameters = event['queryStringParameters'];

  let surfPoint = 'North-Piha';
  if (queryStringParameters['surfpoint']) 
    surfPoint = queryStringParameters['surfpoint'];

  var options = {
    host: 'www.surf-forecast.com',
    path: '/breaks/' + surfPoint + '/forecasts/latest/six_day'
  };

  var request = http.request(options, function(res) {
    var data = '';
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      var ilkAra = 'starimg" src="/staricons/star.';
      var sonAra = '.gif';
      var bas = data.indexOf(ilkAra);
      var son = data.indexOf(sonAra, bas);
      var rating = data.substring(bas + ilkAra.length, son);

      ilkAra = 'largeswellicons/swell.';
      sonAra = '.gif';
      bas = data.indexOf(ilkAra);
      son = data.indexOf(sonAra, bas);
      var swellRaw = data.substring(bas + ilkAra.length, son);

      var winds = swellRaw.substring(0, swellRaw.indexOf('.'));
      var swell = swellRaw.substring(winds.length + 1, swellRaw.indexOf('.metric'));

      var surfResult = {
        rating: parseInt(rating),
        winds: winds,
        swell: parseInt(swell) / 10
      };

      const response = {
        statusCode: 200,
        headers: {},
        body: JSON.stringify(surfResult)
      };

      context.succeed(response);
    });
  });
  request.on('error', function(e) {
    console.log(e.message);
  });

  request.end();
};
