var mergeStream = require('merge-stream')
  , fs = require('fs')
  , shuffle = require('shuffle-stream')
  , csv = require('csv-parser')
  , SVM = require('./svm')
  , Readable = require('stream').Readable
  , createBufferedStream = require('./bufferedStream')
  , createSplitStream = require('./splitStream')

// Stops a stream from ending
function neverending (stream, cb) {
  var oldPush = stream.push

  stream.push = function (chunk, enc) {
    if(chunk != null)
      oldPush.call(stream, chunk, enc)
    else
      cb()
  }

  return stream
}

function train(input, opts, cb) {
  opts = opts || {}

  // Set up options and defaults
  var epoch = 0
    , epochs
    , machine = new SVM(opts.features, opts.classAttribute, {
        regularizer: opts.regularizer
      , stepLength: opts.stepLength
      })
    , merge = mergeStream()
    , shuffleOpts = {batchSize: 1000, objectMode: true}
    , testPercentage
    , stepPercentage
    , aftertrain

    if(typeof opts == 'function') {
      cb = opts
      opts = {}
    }

  epochs = opts.epochs || 1000
  testPercentage = opts.testPercentage || 0.2
  stepPercentage = opts.stepPercentage || 0.5

  // We funnel multiple streams of data into the SVM using this
  merge.pipe(machine)

  // Called once for each epoch
  function _train() {
    epoch++

    machine.setEpoch(epoch)

    if(epoch > epochs) {
      // End the merge stream
      merge.push(null)

      cb(null, machine)
    }
    else {
      var stream
        , testSet = []
        , testStream = new Readable({objectMode: true})
        , splitStream

      testStream._read = function () {
        for(var i=0, ii=testSet.length; i<ii; ++i)
          this.push(testSet[i])
        this.push(null)
      }

      if(typeof input == 'function') {
        stream = input()
      }
      else {
        stream = fs.createReadStream(input).pipe(csv())
      }

      // Splits the stream and puts test examples in testSet
      splitStream = createSplitStream(opts.stepPercentage
                                    , opts.testPercentage
                                    , testSet
                                    , opts.buffer)

      stream = stream.pipe(shuffle(shuffleOpts))
                     .pipe(splitStream)

      // Prevent the stream from ending th merge stream
      merge.add(neverending(stream, function () {
        aftertrain(testStream)
      }))
    }
  }

  if(typeof opts.eachEpoch == 'function') {
    aftertrain = function (testStream) {
      opts.eachEpoch(epoch, machine, testStream, _train)
    }
  }
  else {
    aftertrain = function () {
      _train()
    }
  }

  if(opts.buffer) {
    createBufferedStream(input, function (err, factory) {
      if(err)
        throw err

      input = factory
      _train()
    })
  }
  else {
    _train()
  }
}

module.exports = train
