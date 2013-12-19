Easyioc.js
==========

Stupidly simple _Inversion of Control_ for node.js apps.

[![NPM](https://nodei.co/npm/easyioc.png?downloads=true)](https://nodei.co/npm/easyioc/)


## Description

```js
easyioc
    .add( ['file1','file2','file3'] )
    .add( 'moduleA', 'my_file_a' )
    .add( 'moduleB', 'my_file_b' )
    .add( '_', 'lodash-node' )
    .exec()
```

Detects and explains circular dependencies: `[Error: Dependency circle encountered: Mod_B  ➤  Mod_C  ➤  Mod_A  ➤  Mod_B]`

Alerts for missing dependencies: `Error: Module "a" requires unknown dependency "thing".`

Accepts objects, `require()` strings, functions, arrays of files, json files... Just about anything you could want.

Because you can specify any function as a dependency, you can easily adapt any existing
modules (lodash, express, etc) to suit your use-case.

Use add() to include any of the following:
* any function
* any object
* any valid string for require()
* an array containing any of the above

Optionally provide a name as the first argument. Every function passed to `add()` will be
parsed for the names in the arguments list, and easyioc will then invoke that function
during `exec()`, by providing the corresponding modules which match the identifier.


## Usage

```js
// madeup example, but here we go...
var easyioc = require('easyioc')

function route_filters (server, router) {
    // do stuff...
}
function models (orm, settings) {
    // do stuff...
}
function appStart (express) {
    // do stuff...
}

easyioc
    .add(  appStart  )
    .add( 'settings' ) // could be node_modules/settings.json
    .add( 'filters',   route_filters     )
    .add( 'server',   'server_thing'     )
    .add( 'router',   'my_router_module' ) // could be node_modules/my_router_module.js
    .add( 'orm',      'orm2'             )
    .add( ['./file1', './file2', './file3'] )
    .add( '_', 'lodash-node' )
    .add( 'express' )
    .exec()
```

Let's say you have some of your own modules in `node_modules/` in your project. Since you
can `require()` them, you can pass them by name as a string to add(), and it will require
them. You can also name your module, so if your file is called "framework_views_module",
you can do `.add('views', 'framework_views_module')`, and now your module will be available
to all other modules which require a "views" parameter in the arguments list. Like this:
```js
module.exports = function(views, controllers, router) {
    //...
}
```

Easyioc works really well with filefetcher ([git](http://github.com/rm-rf-etc/filefetcher))
([npm](http://npmjs.org/package/filefetcher)). Together, they can automatically load your
entire project, very simply, and according to your own specs.

## Recursive Design
Easyioc also supports providing itself as a dependency, which allows subsequent modules to
add even more modules and execute once more.
```js
var easyioc = require('easyioc')

// None of this will happen until...
function myApp (easyioc) {
    function bestModuleEvar(_){
        return function MakeRofls(){
            // I don't even know...
        }
    }
    easyioc
        .add( 'best_evar', bestModuleEvar )
        .add( '_', 'lodash-node' )
        .exec()
}

// ...we call exec() after adding myApp here.
easyioc
    .add(  myApp  )
    .add(  'easyioc', easyioc  )
    .exec()
```

## Sequential Loading
Easyioc supports a convention over configuration solution for sequentially loading object data.
"Wtf does that mean?", you're probably thinking...

`some_fileA.js`
```js
module.exports = function(models){
    models.modelA = {property: 'some data'}
    models.modelB = {property: 'some data'}
}
```
`some_fileB.js`
```js
module.exports = function(models){
    models.modelC = {property: 'some data'}
    models.modelD = {property: 'some data'}
}
```

So lets say we have these ^ files, and we need to have the data in these objects loaded so we can use
them in other files. Easyioc has no way of detecting if every expected model has been added, and if
you have numerous files with data that you want loaded, and all of them constitute one module of your
application, you need a way to load all of them before loading any modules which might try to access
a particular model. So here's the solution for that:

```js
var easyioc = require('easyioc')

easyioc
    .add( 'models', {} )
    .add( ['some_fileA', 'some_fileB'] )
    .exec()
    .add( 'model_manipulator_thing' ) // some module which expects models A, B, C, or D, to exist.
    .exec()
```

How about a real example from another project. I have an arbitrary number of models in an arbitrary
number of files, and an arbitrary number of controllers in an arbitrary number of controller files.
I want my controllers to be able to reference any of my models whenever I decide that they need to.
Here's how to solve that:

```js
var easyioc = require('easyioc')
var filefetcher = require('filefetcher')

// so here we're adding an empty object and calling it models.
easyioc.add('models', {})
filefetcher([
    { path:'./app/models/', recursive:true, type:'js', cb:easyioc.add }
])
easyioc.exec()

// and we're doing the same thing again to create our controllers object.
easyioc.add('controllers', {})
filefetcher([
    { path:'./app/controllers/', recursive:true, type:'js', cb:easyioc.add }
])
easyioc.exec()
```

And those files basically do this:
`any model js file in my project`
```js
module.exports = function(models){
    models.whatever = 'some data'
}
```
`any controller js file in my project`
```js
module.exports = function(controllers, models){
    controllers.index = function(req,res){
        res.end( models.whatever )
    }
}
```

## How To Run The Tests

```
$ git clone http://github.com/rm-rf-etc/easyioc.git
$ cd easyioc
$ npm install expect.js
$ npm install -g mocha
$ mocha
```

## License
The MIT License (MIT)

Copyright (c) 2013 Rob

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
