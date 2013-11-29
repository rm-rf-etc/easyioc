
var expect = require('expect.js')
var check = its = it
var easyioc = require('../easyioc')

/**
 *
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
            expect( s ).to.be('the S function')
        }

        easyioc
            .add('q',function(){ console.log('q has no deps, was loaded w/o deps.') })
            .add('a',a)
            .add('b',b)
            .add('y',function(){ return 'the Y function' })
            .add('z',function(){ return 'the Z function' })
            .add('r',function(){ return 'the R function' })
            .add('s',function(){ return 'the S function' })
            .exec().empty()
    })
    it('detects dependency circles and throws an error',function(){

        function Mod_A (Mod_B) {}
        function Mod_B (Mod_C) {}
        function Mod_C (Mod_A) {}

        // var files1 = ['encore_filefinder','encore_controllers']
        // var files2 = ['encore_router','encore_models']

        expect(function(){
            easyioc
                .add( 'Mod_A', Mod_A )
                .add( 'Mod_B', Mod_B )
                .add( 'Mod_C', Mod_C )
                .exec().empty()
        }).to.throwError(function(err){ console.log(err) })
    })
})
