var Readable = require('stream').Readable
  , csv = require('csv-parser')
  , fs = require('fs')

function createStreamFactory (filename, cb) {
  var instances = []

  function bufferedStreamFactory () {
    var readable = new Readable({objectMode: true})

    readable._read = function () {
      for(var i=0, ii=instances.length; i<ii; ++i)
        this.push(instances[i])

      this.push(null)
    }

    return readable
  }

  fs.createReadStream(filename).pipe(csv())
  .on('data', function (chunk) {
    instances.push(chunk)
  })
  .on('end', function () {
    cb(null, bufferedStreamFactory)
  })
}

module.exports = createStreamFactory
