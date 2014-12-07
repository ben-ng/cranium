var util = require('util')
  , Writable = require('stream').Writable
  , through = require('through2')

// Simple dot product
function dot (a, b) {
  var out = 0.0

  for (var i=0, ii=b.length; i<ii; ++i)
    out += a[i] * b[i]

  return out
}

/**
* features - An array of strings, one for each feature, excluding the class
* classAttribute - The feature to treat as the class
*/
function SVM (features, classAttribute, opts) {
  Writable.call(this, {objectMode: true})

  opts = opts || {}

  var dimensions = features.length
    , functionRows = []

  this.features = features
  this.classAttribute = classAttribute
  this.regularizer = parseFloat(opts.regularizer || 0.001)
  this.stepLength = parseFloat(opts.stepLength || 0.01)
  this.slope = new Array(dimensions)
  this.intercept = 0.0

  functionRows.push(this.classAttribute + ': (example[\'' + classAttribute + '\'] == \'true\' ? 1 : -1)')

  for(var i=0; i<dimensions; ++i) {
    this.slope[i] = 0.0
    functionRows.push(this.features[i] + ': parseFloat(example.' + this.features[i] + ')')
  }


  // jshint ignore:start
  this._parseExample = new Function('example', 'return {' + functionRows.join(',') + '}')
  // jshint ignore:end
}

util.inherits(SVM, Writable)

SVM.prototype._write = function _write (chunk, enc, cb) {
  this.update(chunk)
  cb()
}

SVM.prototype.update = function update (example, stepLength) {
  example = this._parseExample(example)

  var label = example[this.classAttribute]
    , prediction = this.predict(example)
    , agreement = label * prediction
    , i=0
    , ii=this.features.length

  stepLength = stepLength || this.stepLength

  if(agreement >= 1.0) {
    for(; i<ii; ++i)
      this.slope[i] -= stepLength * (this.regularizer * this.slope[i])
  }
  else {
    for(; i<ii; ++i) {
      this.slope[i] -= stepLength * (this.regularizer * this.slope[i] - label * example[this.features[i]])
    }

    this.intercept -= stepLength * -label
  }
}

SVM.prototype.cost = function cost () {
  var self = this
    , out = 0.0
    , exampleCount = 0
    , example

  return through.obj(function (chunk, enc, cb) {
    example = self._parseExample(chunk)
    out += Math.max(0, 1 - example[self.classAttribute] * self.predict(example))
    exampleCount += 1

    cb()
  }, function (cb) {
    // average out the cost over the examples
    out /= exampleCount

    // Add the regularization term and return
    this.push(out + (self.regularizer/2) * dot(self.slope, self.slope))
    this.push(null)
    cb()
  })
}

// You only care if it is greater than or less than zero
SVM.prototype.predict = function predict (example) {
  example = this._parseExample(example)

  // Turn the features into an array
  var featureArray = []

  for(var i=0, ii=this.features.length; i<ii; ++i)
    featureArray.push(example[this.features[i]])

  return dot(featureArray, this.slope) + this.intercept
}

SVM.prototype.accuracy = function accuracy () {
  var self = this
    , correct = 0
    , exampleCount = 0
    , example

  return through.obj(function (chunk, enc, cb) {
    example = self._parseExample(chunk)

    if(example[self.classAttribute] * self.predict(example) > 0)
      correct += 1

    exampleCount += 1

    cb()
  }, function (cb) {
    this.push(correct/exampleCount)
    this.push(null)
    cb()
  })
}

module.exports = SVM
