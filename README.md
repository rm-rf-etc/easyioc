Easyioc.js
==========

Stupidly simple _Inversion of Control_ for node.js apps.

`npm install easyioc`


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

## How To Run The Tests

```
$ git clone http://github.com/rm-rf-etc/easyioc.git
$ cd easyioc
$ npm install expect.js
$ npm install -g mocha
$ mocha
```
