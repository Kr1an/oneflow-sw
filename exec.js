(function () {
  const {
    JobRequest,
  } = require('./models');
  const fs = require('fs');
  const uuid = require('uuid');
  const request = require('request');
  const mongoose = require('mongoose');
  const sharp = require('sharp');
  const resizer = sharp()
    .resize(64, 64)
    .png()
  mongoose.connect(`mongodb://mongo/jobhub`, { useMongoClient: true });
  process.on('message', function (data) {
    JobRequest.findById(data.jobRequestId, function (err, doc) {
      const tmpImageName = uuid.v4() + '.png';
      request(doc.url)
        .pipe(
          sharp()
            .resize(64, 64)
            .png()
            .toFile('public/' + tmpImageName, (err, info) => {
              if (err) {
                console.log('error: ' + doc.url);
                doc.status = 'failed';
                doc.save(function (err, doc) {
                  process.send(data);
                })
              } else {
                console.log('saved: ' + doc.url)
                doc.status = 'success';
                doc.thumbnailUrl = tmpImageName;
                doc.save(function (err, doc) {
                  process.send(data);
                })
              }
            })
        )
    });
  })
})();
