avalanche
=========

[![Build Status](https://travis-ci.org/ben-ng/avalanche.svg?branch=master)](https://travis-ci.org/ben-ng/avalanche)

Machine learning with streams.

```js
var train = require('avalanche').train
  , opts = {
            features: ['attr1', 'attr2']
          , classAttribute: 'class'
          }

train('input.csv', opts, function (err, machine) {
  if(machine.predict({attr1: 5, attr2: 2}) > 0)
    console.log('true')
  else
    console.log('false')
})
```

Accuracy rates of around 99% can be achieved once parameters are tuned for your data.

An example run with 100 epochs on [the University of Wisconsin's breast cancer data](https://archive.ics.uci.edu/ml/machine-learning-databases/breast-cancer-wisconsin/).

![Accuracy v Epoch](https://cldup.com/Z7AdIowe9V.png)

## Training Options

#### train.opts.features

**Required** An array of strings. Strings should be the headers of columns in the csv that should be used as features.

#### train.opts.classAttribute

**Required** A string, the header of the column to use as the class. Only binary classification is supported right now, so valid class attributes are `true` and `false`.

#### train.opts.regularizer

Default `0.001`. How hard to try to fit the data. Passed to the SVM.

#### train.opts.stepLength

Default `0.01`. The learning rate. Passed to the SVM.

#### train.opts.eachEpoch

Default no-op.

`function eachEpoch (epoch, svm, testStream, cb) {}`

 * **epoch** - An integer, the current epoch
 * **svm** - The SVM object
 * **testStream** - A readable stream of instances
 * **cb** - Call when done to continue training

#### train.opts.epochs

Default `1000`. How many epochs to train for.

#### train.opts.stepPercentage

Default `0.4`. The percentage of instances to use for each epoch.

#### train.opts.testPercentage

Default `0.3`. The percentage of instances in each epoch to leave out. These instances are fed into the test stream passed to `eachEpoch`.

## License
The MIT License (MIT)

Copyright (c) 2014 Ben Ng

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
