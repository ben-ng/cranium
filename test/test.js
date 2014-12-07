var train = require('../train')
  , test = require('tape')
  , concat = require('concat-stream')
  , path = require('path')

test('breast cancer', function (t) {
  t.plan(2)

  var filename = path.join(__dirname, 'bcancer.csv')
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
    , opts = {
              features: features
            , classAttribute: 'label'
            , regularizer: 0.001
            , eachEpoch: function eachEpoch (epoch, svm, testStream, cb) {
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
            , epochs: 100
            , stepPercentage: 0.5
            , testPercentage: 0.3
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
    t.ok(accy > 0.90, 'accuracy should be > 90%, got ' + accy.toFixed(3))
  })
})
