//test the webfiles server

/* global require console process it describe after before */

var should = require('should')
var fs = require('fs')
var path = require('path')
var request = require('request')
var http = require('http')
var async = require('async')
var _ = require('lodash')

var listing_service = require('../.').listing_service;
var rfiles = listing_service.rfiles
var qfiles = listing_service.qfiles

var express = require('express')
var jsdom = require('jsdom')

var env = process.env;
var testhost = env.TEST_HOST || '127.0.0.1'
var testport = env.TEST_PORT || 3000
testport += 2

var server_host = 'http://'+testhost + ':'+testport

var app,server

// need to also test that can set paths via environment variables

before(
    function(done){
        app = express()
              .use(express.logger())

        rfiles(app,{'pems':'test/public/pems/breakup'
                   ,'wim':'test/public/wim'}
              )
        qfiles(app,{'pems':'test/public/pems/breakup'
                   ,'wim':'test/public/wim'}
              )
        server=http
               .createServer(app)
               .listen(testport,done)

    })
after(function(done){
    fs.unlinkSync(path.join(__dirname, 'test.RData'))
    fs.unlinkSync(path.join(__dirname, 'test.wim.RData'))
    server.close(done)
})

describe('qfiles',function(){
    describe('can list vds files',function(){
        it('using pattern = *',function(done){
            var pattern = '*'
            request
            .get(server_host+'/vdsdata/d12?pattern='+pattern
                ,function(err,r,b){
                     if(err) return done(err)

                     should.exist(r.body)
                     var c = JSON.parse(r.body)
                     c.should.be.an.instanceOf(Array)
                     c.length.should.eql(6)
                     return done()
                 })
        })

        it('using pattern = *RData',function(done){
            var pattern = '*RData'
            request
            .get(server_host+'/vdsdata/d12?pattern='+pattern
                ,function(err,r,b){
                     if(err) return done(err)
                     should.exist(r.body)
                     var c = JSON.parse(r.body)
                     c.should.be.an.instanceOf(Array)
                     c.length.should.eql(3)
                     return done()
                 })
        })
        it('using pattern = 405/*RData',function(done){
            var pattern = '405/*RData'
            request
            .get(server_host+'/vdsdata/d12?pattern='+pattern
                ,function(err,r,b){
                if(err) return done(err)
                     should.exist(r.body)
                     var c = JSON.parse(r.body)
                     c.should.be.an.instanceOf(Array)
                     c.length.should.eql(1)
                     return done()
                 })
        })
        it('using pattern = *RData and freeway 405 param',function(done){
            var pattern = '*RData'
            request
            .get(server_host+'/vdsdata/d12/405?pattern='+pattern
                ,function(err,r,b){
                if(err) return done(err)
                     should.exist(r.body)
                     var c = JSON.parse(r.body)
                     c.should.be.an.instanceOf(Array)
                     c.length.should.eql(1)
                     return done()
                 })
        })
    })
    describe('can list wim files',function(){
        it('using pattern = *',function(done){
            var pattern = '*'
            request
            .get(server_host+'/wimdata/2007?pattern='+pattern
                ,function(err,r,b){
                if(err) return done(err)
                     should.exist(r.body)
                     var c = JSON.parse(r.body)
                     c.should.be.an.instanceOf(Array)
                     c.length.should.eql(23)
                     return done()
                 })
        })
        it('using pattern = *RData',function(done){
            var pattern = '*RData'
            request
            .get(server_host+'/wimdata/2007?pattern='+pattern,function(err,r,b){
                if(err) return done(err)

                should.exist(r.body)
                var c = JSON.parse(r.body)
                c.should.be.an.instanceOf(Array)
                c.length.should.eql(15)
                return done()
            })
        })
        it('using pattern = *RData for just site 10',function(done){
            var pattern = '*RData'
            request
            .get(server_host+'/wimdata/2007/10?pattern='+pattern,function(err,r,b){
                if(err) return done(err)

                should.exist(r.body)
                var c = JSON.parse(r.body)
                c.should.be.an.instanceOf(Array)
                c.length.should.eql(8)
                return done()
            })
        })
    })
})
describe('rfiles',function(){
    describe('can retrieve',function(){
        it('fetch a file reported using pattern =*RData on the 405',function(done){
            var pattern = '*RData'
            request
            .get(server_host+'/vdsdata/d12/405?pattern='+pattern
                ,function(err,r,b){
                     if(err) return done(err)

                     should.exist(r.body)
                     var c = JSON.parse(r.body)
                     c.should.be.an.instanceOf(Array)
                     c.length.should.eql(1)
                     // now fetch that file
                     var rdataWrite = fs.createWriteStream(path.join(__dirname, 'test.RData'))
                     rdataWrite.on('close', function () {
                         should.deepEqual(fs.readFileSync(path.join(__dirname
                                                                   ,'public/pems/breakup/d12/405'
                                                                   , c[0]))
                                         , fs.readFileSync(path.join(__dirname, 'test.RData')))
                         done()
                     })
                     request
                     .get(server_host+'/vdsdata/d12/405/'+c[0])
                     .pipe(rdataWrite)
                     return null;
                 })
            return null
        })
        it('fetch a file reported using pattern =*RData form wim 10',function(done){
            var pattern = '*RData'
            request
            .get(server_host+'/wimdata/2008/10?pattern='+pattern
                ,function(err,r,b){
                     if(err) return done(err)

                     should.exist(r.body)
                     var c = JSON.parse(r.body)
                     c.should.be.an.instanceOf(Array)
                     c.length.should.be.above(0)
                     // now fetch the first file
                     var rdataWrite = fs.createWriteStream(path.join(__dirname, 'test.wim.RData'))
                     rdataWrite.on('close', function () {
                         should.deepEqual(fs.readFileSync(path.join(__dirname
                                                                   ,'public/wim/2008/10'
                                                                   , c[0]))
                                         , fs.readFileSync(path.join(__dirname, 'test.wim.RData')))
                         done()
                     })
                     request
                     .get(server_host+'/wimdata/2008/10/'+c[0])
                     .pipe(rdataWrite)
                     return null;
                 })
            return null
        })
    })
})


