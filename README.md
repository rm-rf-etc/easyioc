Easyioc.js
=======

Really easy to use IoC for node.js apps.

`npm install easyioc`


## Description

Stupidly simple IoC loading system. Detects and explains circular dependencies,
and accepts objects, require() strings, functions, arrays of files, json files... Just about anything you
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
    .add( ['../myfile.js', '../myotherfile.js'] )
    .add( '_', 'lodash-node' )
    .add( 'express' )
    .exec()
```

Let's say you have some of your own modules in node_modules/ in your project. Since you can require() them, you can pass them by name as a string to add(), and it will require them. You can also name your module, so if your file is called "framework_views_module", you can doing `.add('views', 'framework_views_module')`, and now your module will be available to all other modules of yours, which have "views" in the arguments list. Like this:
```js
module.exports = function(views, controllers, router) {
    //...
}
```

Easyioc works really well with [filefetcher](http://github.com/rm-rf-etc/filefetcher). Together, you can use them to automatically load your entire project structure, really easily and according to your own specs.

## How To Run The Tests

```
$ git clone http://github.com/rm-rf-etc/easyioc.git
$ cd easyioc
$ npm install expect.js
$ npm install -g mocha
$ mocha
```
