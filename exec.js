(function () {
  const {
    JobRequest,
  } = require('./models');
  const fs = require('fs');
  const uuid = require('node-uuid');
  const request = require('request');
  const mongoose = require('mongoose');
  const sharp = require('sharp');
  const resizer = sharp()
    .resize(64, 64)
    .png();
  mongoose.connect(`mongodb://127.0.0.1:27017/jobhub`, { useMongoClient: true });
  process.on('message', function (data) {
    JobRequest.findById(data.jobRequestId, function (err, doc) {
      const tmpImageName = uuid.v4() + '.image';
      request(doc.url).pipe(resizer)
        .pipe(fs.createWriteStream('public/' + tmpImageName))
        .on('finish', function() {
          console.log("image from: " + doc.url + " successfully download")
          doc.status = 'success';
          doc.thumbnailUrl = tmpImageName;
          doc.save(function (err, doc) {
            process.send(data);
          })
        })
      setTimeout(function() {
        console.log("image from: " + doc.url + " failed on downloading");
        doc.status = 'failed';
        doc.save(function (err, doc) {
          process.send(data);
        })
      }, 5000);
    });
  });
})();
