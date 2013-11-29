
var _ = require('lodash-node')
function isObject (thing) { return typeof thing === 'object' }


var public_methods = {
    empty: empty,
    exec: exec,
    add: add
}
module.exports = public_methods



var modules = {} // This is the master list, it will contain all modules.
var adding = {} // Allows add() to be called during exec() execution.
var path = [] // How we detect circular dependencies.


function Module (name, module) {
    var loaded = null

    this.load = function(){
        if (!loaded) {
            if (_.isFunction(module)) {
                var deps = fetchDeps(module)

                deps = deps.map(function(dep){
                    if (_.contains(path, dep))
                        throw new Error('Dependency circle encountered: '+path.concat(dep).join('  ➤  ')) // ▷ ➔ ➤ ▸ ▶ ➠ ⧐ ➞
                    path.push(dep)
                    var mod = load(name, dep)
                    path.pop()
                    return mod
                })
                loaded = module.apply(new Object, deps)
            }
            else if (isObject(module))
                loaded = module
            else
                throw new Error('"'+name+'" module added with invalid target: "'+module+'"')
        }
        return loaded
    }
}

function FileGroup (files) {
    var loaded = null

    this.load = function(){
        if (!loaded) {

            loaded = files.map(function(file){

                if (!_.isString(file))
                    throw new Error('Invalid file path: "'+file+'".')

                if (!require.resolve(file))
                    throw new Error('Require could not resolve "'+file+'".')

                var module = require(file)

                if (_.isFunction(module)) {
                    // var deps = fetchDeps(module)
                    var deps = fetchDeps(module).map(function(dep){
                        return load(file, dep)
                    })
                    return module.apply(new Object, deps)
                }
                else if (isObject(module))
                    return module
            })
        }
        return loaded
    }
}

function load (func, dep) {
    if (_.has(modules, dep))
        return modules[dep].load() //! to-do: detect circular dependencies here.
    else
        throw new Error('Module "'+func+'" requires unknown dependency "'+dep+'".')
}

function fetchDeps (target) {
    if (target.length) {
        var args_regex = /^function\s*[^\(]*\(\s*([^\)]*)\)/m
        var text = target.toString()
        return text.match(args_regex)[1].split(',').map(function(e){return e.trim()})
    }
    return []
}

// credit: http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
function makeId (n) {
    n = n || 10
    var text = ""
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

    for (var i = 0; i < n; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length))

    return text
}

function doAdd (name, object) {
    modules[name] = adding[name] = object
}



// Exposed methods \\

/**
 * target can be a
 * 1) function,
 * 2) any valid string for require(),
 * 3) or array of strings for require().
 * Name is optional except when target is a string path.
 * Method is silent when it fails.
 */
function add (name, target) {
    var module = target

    if (_.isArray(name))
        doAdd(makeId(), new FileGroup(name))

    else if (_.isString(name)) {

        if (_.isArray(target))
            doAdd(name, new FileGroup(target))

        else {
            if (!target)
                module = require(name)

            else if (_.isString(target))
                module = require(target)

            else if (_.isFunction(target))
                module = target
        
            doAdd(name, new Module(name, module))
        }
    }
    return public_methods
}

/**
 *
 */
function exec () {
    var loading = adding
    adding = {}

    for (var each in loading)
        loading[each].load()
    
    return public_methods
}

/**
 *
 */
function empty () {
    adding = {}
    modules = {}
    return public_methods
}

