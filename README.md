Easyioc.js
=======

Really easy to use IoC for node.js apps.


## Description

Really stupidly simple IoC loading system. Detects and explains circular dependencies,
and accepts objects, require modules, functions, json files... Just about anything you
might want to depend upon.

Because you can specify any function as a dependency, you can easily adapt any existing
modules (lodash, express, etc) to suit your use-case.

Use add() to include as a dependency, any of the following:
  * any function
  * any object
  * any valid string for require()
  * an array containing any of the above

Optionally provide a name as the first argument. Every function passed to add() will be
parsed for the names in the arguments list, and easyioc will then invoke that function
during exec(), by providing the corresponding modules with a matching identifier.

## Usage

```js
var easyioc = require('easyioc')

function a (y,z) {
    expect( y ).to.be('the Y function')
    expect( z ).to.be('the Z function')
}
function b (r,s) {
    expect( r ).to.be('the R function')
    expect( s ).to.be('the S function')
}

easyioc
    .add('q',function(){ console.log('q has no dependencies!') })
    .add('a',a)
    .add('b',b)
    .add('y',function(){ return 'the Y function' })
    .add('z',function(){ return 'the Z function' })
    .add('r',function(){ return 'the R function' })
    .add('s',function(){ return 'the S function' })
    .add('_', 'lodash-node' )
    .add('express')
    .add( ['../myfile.js', '../myotherfile.js'] )
    .add( 'express' )
    .exec()
```

## How To Run The Tests

```
$ git clone http://github.com/rm-rf-etc/easyioc.git
$ cd easyioc
$ npm install expect.js
$ npm install -g mocha
$ mocha
```
