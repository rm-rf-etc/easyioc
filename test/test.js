
var expect = require('expect.js')
var check = its = it
var easyioc = require('../easyioc')

/**
 */
describe('Dependencies module',function(){
    it('has the expected methods',function(){
        expect( easyioc ).to.have.property( 'add' )
        expect( easyioc ).to.have.property( 'exec' )
        expect( easyioc ).to.have.property( 'empty' )
    })
    it('passes functions as dependencies',function(){

        function a (y,z) {
            expect( y ).to.be('the Y function')
            expect( z ).to.be('the Z function')
        }
        function b (r,s) {
            expect( r ).to.be('the R function')
            expect( s ).to.have.property('a')
            expect( s.a ).to.be( 'the S function' )
        }

        easyioc
            .add('q',function(){ console.log('q has no deps, was loaded w/o deps.') })
            .add('a',a)
            .add('b',b)
            .add('y',function(){ return 'the Y function' })
            .add('z',function(){ return 'the Z function' })
            .add('r',function(){ return 'the R function' })
            .add('s', {a:'the S function'})
            .exec().empty()
    })
    it('detects dependency circles and throws an error',function(){

        function Mod_A (Mod_B) {}
        function Mod_B (Mod_C) {}
        function Mod_C (Mod_A) {}

        expect(function(){
            easyioc
                .add( 'Mod_A', Mod_A )
                .add( 'Mod_B', Mod_B )
                .add( 'Mod_C', Mod_C )
                .exec().empty()
        }).to.throwError(function(err){ console.log(err) })
    })
    it('requires files',function(done){

        easyioc
            .add( __dirname+'/guineapigs/module'   )
            .add( __dirname+'/guineapigs/settings' )
            .add( 'b', function(){ return 'a' } )
            .add( 'a', {a: a} )
            .exec()

        function a (thing) {
            expect( thing ).to.be( 'used value of b to invoke this function' )
            done()
        }
    })
    it('works with arrays containing files and functions',function(done){

        function a (thing) {
            expect( thing ).to.be( 'used value of b to invoke this function' )
        }

        easyioc
            .add( 'list', [__dirname+'/guineapigs/module', __dirname+'/guineapigs/settings', function(c){ c() }] )
            .add( 'c', function(){ return done } )
            .add( 'b', function(){ return 'a' } )
            .add( 'a', {a: a} )
            .add( 'z', function(list){ console.log(list) })
            .exec()
    })
})
