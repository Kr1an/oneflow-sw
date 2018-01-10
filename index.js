const {
  JobRequest,
} = require('./models');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const uuid = require('uuid');
const manager = require('./manager.js')(20);
const path = require('path');
let totalRun = 0;

const app = express();

app.use(express.static(path.join(__dirname, 'public')))
app.use(cors());
app.use(bodyParser.json());


mongoose.connect(`mongodb://mongo/jobhub`, { useMongoClient: true });

app.post('/jobrequest', (req, res) => {
  const jr = new JobRequest(req.body);
  jr.save((err, doc) => {
    if (err) {
      res.send(err.toJSON());
    } else {
      const jobToSend = {
        jobRequestId: doc._id,
        block: 4000,
        id: uuid.v4(),
      }
      manager.process(jobToSend, function done (err, jobResult) {
        console.log('Worker response. I processed ' + (++totalRun) + ' job(s)');
      })
      res.send(doc.toJSON());
    }
  })
})


app.listen(
  3000,
  err => console.log(err || 'running on localhost:3000')
);
