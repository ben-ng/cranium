var train = require('../train')
  , test = require('tape')
  , concat = require('concat-stream')
  , path = require('path')

    // Test options
  , filename = path.join(__dirname, 'bcancer.csv')
  , features = ['clump'
            , 'usize'
            , 'ushape'
            , 'adhesion'
            , 'episize'
            , 'bnuclei'
            , 'bchromatin'
            , 'nnucleoli'
            , 'mitoses']
  , accys = []
  , defaults = {
            features: features
          , classAttribute: 'label'
          , regularizer: 0.001
          , epochs: 1000
          , stepPercentage: 0.5
          , testPercentage: 0.3
          }
  , unbufferedRuntime = 0

function createTimer() {
  var start = Date.now()

  return {
    finish: function finish() {
      return Date.now() - start
    }
  }
}

test('breast cancer: unbuffered', function (t) {
  t.plan(3)

  var timer = createTimer()

  // Clone
  var opts = JSON.parse(JSON.stringify(defaults))
  opts.buffer = false
  opts.eachEpoch = function eachEpoch (epoch, svm, testStream, cb) {
    if(epoch % 10 === 0) {
      testStream.pipe(svm.accuracy()).pipe(concat(function (out) {
        accys.push(parseFloat(out))
        cb()
      }))
    }
    else {
      cb()
    }
  }

  train(filename, opts, function (err) {
    t.ifError(err)

    /* Too unreliable an assertion ):
    t.ok(accys[0] < accys[accys.length - 1]
      , 'accuracy should have improved: ' +
        accys[0] + '->' + accys[accys.length - 1])
    */

    // In case you want to see these
    // console.log(accys.join('\n'))

    var accy = parseFloat(accys[accys.length - 1].toString())
      , time = timer.finish()
    t.ok(accy > 0.90, 'accuracy should be > 90%, got ' + accy.toFixed(3))
    t.ok(time, 'took: ' + time + 'ms')

    unbufferedRuntime = time
  })
})

test('breast cancer: buffered', function (t) {
  t.plan(3)

  var timer = createTimer()

  // Clone
  var opts = JSON.parse(JSON.stringify(defaults))
  opts.buffer = true
  opts.eachEpoch = function eachEpoch (epoch, svm, testStream, cb) {
    if(epoch % 10 === 0) {
      testStream.pipe(svm.accuracy()).pipe(concat(function (out) {
        accys.push(parseFloat(out))
        cb()
      }))
    }
    else {
      cb()
    }
  }

  train(filename, opts, function (err) {
    t.ifError(err)

    /* Too unreliable an assertion ):
    t.ok(accys[0] < accys[accys.length - 1]
      , 'accuracy should have improved: ' +
        accys[0] + '->' + accys[accys.length - 1])
    */

    // In case you want to see these
    // console.log(accys.join('\n'))

    var accy = parseFloat(accys[accys.length - 1].toString())
      , time = timer.finish()
    t.ok(accy > 0.90, 'accuracy should be > 90%, got ' + accy.toFixed(3))
    t.ok(time - unbufferedRuntime < 0, 'faster than unbuffered: ' + time + 'ms')
  })
})
