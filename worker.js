module.exports = function () {
  function Worker () {
    this._exec = require('child_process').fork;
  }
  Worker.prototype.execute = function (job, cb) {
    this._cb = cb;
    this._job = job;
    this._proc = this._exec(
      'exec.js',
      [],
      {
        silent: true,
        stdio: [
          'pipe',
          'pipe',
          'pipe',
          'ipc',
        ],
      }
    );
    attachProcesListners.apply(this);
    this._proc.send(job);
  }
  return Worker

  function attachProcesListners () {
    const that = this;
    this._proc.stdout.on('data', function (data) {
      console.log(data.toString());
    })
    this._proc.stderr.on('data', function (data) {
      console.log(data.toString());
    })
    this._proc.on('message', function (data) {
      that._cb(null, data);
      that._proc.kill('SIGINT');
    })
  }
}
