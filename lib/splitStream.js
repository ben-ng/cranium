var through = require('through2')

function createSplitStream (stepPercentage, testPercentage, testSet, shouldSetImm) {
  return through.obj(function (chunk, enc, cb) {
      if(Math.random() < stepPercentage) {
        if(Math.random() < testPercentage) {
          testSet.push(chunk)
        }
        else {
          this.push(chunk)
        }
      }

      // Needed to prevent a recursive nextTick
      if(shouldSetImm) {
        setImmediate(cb)
      }
      else {
        cb()
      }
    })
}

module.exports = createSplitStream
