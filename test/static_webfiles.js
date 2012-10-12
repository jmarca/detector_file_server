//test the webfiles server

/* global require console process it describe after before */

var should = require('should')

var superagent = require('superagent')
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

before(
    function(done){
        app = express()
              .use(express.logger())

        rfiles(app)
        qfiles(app)
        server=http
               .createServer(app)
               .listen(testport,done)

    })
after(function(done){
    server.close(done)
})

describe('qfiles',function(){
    describe('can list vds files',function(){
        it('using pattern = RData$',function(done){
            var pattern = 'RData$'
            superagent
            .get(server_host+'/vdsdata/D12?pattern='+pattern)
            .set('accept','application/json')
            .set('followRedirect',true)
            .end(function(err,res){
                if(err) return done(err)
                res.ok.should.be.true
                should.exist(res.body)
                var c = res.body
                c.should.have.property('features')
                c.features.length.should.be.below(11)
                _.each(c.features
                      ,function(row){
                           row.should.have.property('type')
                           row.should.have.property('geometry')
                           row.should.have.property('properties')
                           row.properties.should.have.property('id')
                           row.properties.id.should.match(/^\d{6,7}$/)
                       })
                    return done()
            })
        })
    })
})

