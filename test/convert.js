/**
* Converts the raw data into a cranium compatible csv
*/
var csv = require('csv-parser')
  , cws = require('csv-write-stream')
  , fs = require('fs')
  , through = require('through2')

fs.createReadStream('./bcancer.raw.csv')
.pipe(csv())
.pipe(through.obj(function (chunk, enc, cb) {
  var valid = true
    , arr = [
              chunk.class.toString() == '4' // true if malignant
            , parseInt(chunk.clump,10)
            , parseInt(chunk.usize,10)
            , parseInt(chunk.ushape,10)
            , parseInt(chunk.adhesion,10)
            , parseInt(chunk.episize,10)
            , parseInt(chunk.bnuclei,10)
            , parseInt(chunk.bchromatin,10)
            , parseInt(chunk.nnucleoli,10)
            , parseInt(chunk.mitoses,10)
            ]

  for(var i=0, ii = arr.length; i<ii; ++i)
    if(typeof arr[i] != 'boolean' && isNaN(arr[i]))
      valid = false

  if(valid)
    this.push(arr)

  cb()
}))
.pipe(cws({headers: ['label', 'clump','usize','ushape','adhesion','episize','bnuclei','bchromatin','nnucleoli','mitoses']}))
.pipe(fs.createWriteStream('bcancer.csv'))
