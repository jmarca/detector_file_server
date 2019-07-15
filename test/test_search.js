//test the webfiles server

/* global require console process it describe after before */

const tap = require('tap')

const fs = require('graceful-fs')
const path = require('path')
const superagent = require('superagent')

const express = require('express')

const listing_service = require('../.').listing_service;
const rfiles = listing_service.rfiles
const qfiles = listing_service.qfiles


const env = process.env;
const testhost = env.TEST_HOST || '127.0.0.1'
var testport = env.TEST_PORT || 3000
testport += 2

const server_host = 'http://'+testhost + ':'+testport

var app,server

function launch_server(){
    app = express()
    // parse urlencoded request bodies into req.body
    rfiles(app,{'pems':'test/public/pems/breakup'
                ,'wim':'test/public/wim'}
          )
    qfiles(app,{'pems':'test/public/pems/breakup'
                ,'wim':'test/public/wim'}
          )

    return new Promise((resolve,reject)=>{
        server = app.listen(testport,function(){
            console.log('listening')
            resolve(server)
        })
    })


}

// need to also test that can set paths via environment variables

function setup_server( c ){

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

}

function tear_down(){
    fs.unlinkSync(path.join(__dirname, 'test.RData'))
    //fs.unlinkSync(path.join(__dirname, 'test.wim.RData'))
    return new Promise((resolve,reject)=>{
        //console.log('server stopped')
        server.close(resolve,reject)
    })
}

async function qfiles_test(t){

    t.test('can list vds files', tt => {
        tt.test('using pattern = *', ttt =>{
            const pattern = '*'
            superagent.get(server_host+'/vdsdata/d12?pattern='+pattern)
                .then( r =>{
                    //console.log(r.body)
                    ttt.ok(r.body)
                    const c  = r.body
                    ttt.type(c,Array)
                    ttt.equal(c.length,6)
                    //console.log('test passes')
                    return ttt.end()
                })
                .catch(e=>{
                    console.log('caught error',e)
                    ttt.fail('query pattern * returned an error')
                    return ttt.end()
                })
        })
        tt.test('using pattern = *RData', ttt =>{
            const pattern = '*RData'
            superagent
                .get(server_host+'/vdsdata/d12?pattern='+pattern)
                .then( r => {
                    ttt.ok(r.body)
                    const c = r.body
                    ttt.type(c, Array)
                    ttt.equal(c.length,3)
                    return ttt.end()
                })
                .catch(e=>{
                    console.log('caught error',e)
                    ttt.fail('query pattern *RData returned an error')
                    return ttt.end()
                })

        })

        tt.test('using pattern = 405/*RData', ttt=>{
            const pattern = '405/*RData'
            superagent
                .get(server_host+'/vdsdata/d12?pattern='+pattern)
                .then( r => {
                    ttt.ok(r.body)
                    const c = r.body
                    ttt.type(c, Array)
                    ttt.equal(c.length,1)
                    ttt.equal(c[0],'405/test.RData')
                    return ttt.end()
                })
                .catch(e=>{
                    console.log('caught error',e)
                    ttt.fail()
                    return ttt.end()
                })
        })
        tt.test('using pattern = *RData and url path vdsdata/d12/405', ttt=>{
            const pattern = '*RData'
            superagent
                .get(server_host+'/vdsdata/d12/405?pattern='+pattern)
                .then( r => {
                    ttt.ok(r.body)
                    const c = r.body
                    ttt.type(c, Array)
                    ttt.equal(c.length,1)
                    ttt.equal(c[0],'test.RData')
                    return ttt.end()
                 })
                .catch(e=>{
                    console.log('caught error',e)
                    ttt.fail()
                    return ttt.end()
                })
        })
        return tt.end()
    })
    t.test('can list wim files', tt => {
        tt.test('using pattern = *',ttt => {
            const pattern = '*'
            superagent
                .get(server_host+'/wimdata/2007?pattern='+pattern)
                .then( r => {
                    ttt.ok(r.body)
                    const c = r.body
                    ttt.type(c, Array)
                    ttt.equal(c.length,23)
                    ttt.same(c,
                             [
                                 "10",
                                 "10/N",
                                 "10/N/wim.10.N.vdsid.600064.2007.paired.RData",
                                 "10/N/wim.10.N.vdsid.600282.2007.paired.RData",
                                 "10/N/wim.10.vds.N.imputed.2007.RData",
                                 "10/N/wim.agg.RData",
                                 "10/S",
                                 "10/S/wim.10.S.vdsid.600064.2007.paired.RData",
                                 "10/S/wim.10.S.vdsid.600282.2007.paired.RData",
                                 "10/S/wim.10.vds.S.imputed.2007.RData",
                                 "10/S/wim.agg.RData",
                                 "100",
                                 "100/S",
                                 "100/S/wim.100.S.vdsid.1111525.2007.paired.RData",
                                 "100/S/wim.100.vds.S.imputed.2007.RData",
                                 "100/S/wim.agg.RData",
                                 "110",
                                 "110/N",
                                 "110/N/wim.110.vds.N.imputed.2007.RData",
                                 "110/N/wim.agg.RData",
                                 "110/S",
                                 "110/S/wim.110.vds.S.imputed.2007.RData",
                                 "110/S/wim.agg.RData",
                             ]
                            )
                    return ttt.end()
                 })
                .catch(e=>{
                    console.log('caught error',e)
                    ttt.fail()
                    return ttt.end()
                })
        })
        tt.test('using pattern = *RData',ttt => {
            const pattern = '*RData'
            superagent
                .get(server_host+'/wimdata/2007?pattern='+pattern)
                .then( r => {
                    ttt.ok(r.body)
                    const c = r.body
                    ttt.type(c, Array)
                    ttt.equal(c.length,15)
                    ttt.same(c,
                              [
                                  "10/N/wim.10.N.vdsid.600064.2007.paired.RData",
                                  "10/N/wim.10.N.vdsid.600282.2007.paired.RData",
                                  "10/N/wim.10.vds.N.imputed.2007.RData",
                                  "10/N/wim.agg.RData",
                                  "10/S/wim.10.S.vdsid.600064.2007.paired.RData",
                                  "10/S/wim.10.S.vdsid.600282.2007.paired.RData",
                                  "10/S/wim.10.vds.S.imputed.2007.RData",
                                  "10/S/wim.agg.RData",
                                  "100/S/wim.100.S.vdsid.1111525.2007.paired.RData",
                                  "100/S/wim.100.vds.S.imputed.2007.RData",
                                  "100/S/wim.agg.RData",
                                  "110/N/wim.110.vds.N.imputed.2007.RData",
                                  "110/N/wim.agg.RData",
                                  "110/S/wim.110.vds.S.imputed.2007.RData",
                                  "110/S/wim.agg.RData",
                              ]
                             )
                    return ttt.end()
                })
                .catch(e=>{
                    console.log('caught error',e)
                    ttt.fail()
                    return ttt.end()
                })
        })
        tt.test('using pattern = *RData for just site 10',ttt => {
            const pattern = '*RData'
            superagent
                .get(server_host+'/wimdata/2007/10?pattern='+pattern)
                .then( r =>{
                    ttt.ok(r.body)
                    const c = r.body
                    ttt.type(c, Array)
                    ttt.equal(c.length,8)
                    ttt.same(c,
                              [ 'N/wim.10.N.vdsid.600064.2007.paired.RData',
                                'N/wim.10.N.vdsid.600282.2007.paired.RData',
                                'N/wim.10.vds.N.imputed.2007.RData',
                                'N/wim.agg.RData',
                                'S/wim.10.S.vdsid.600064.2007.paired.RData',
                                'S/wim.10.S.vdsid.600282.2007.paired.RData',
                                'S/wim.10.vds.S.imputed.2007.RData',
                                'S/wim.agg.RData' ]
                             )
                    return ttt.end()
                })
                .catch(e=>{
                    console.log('caught error',e)
                    ttt.fail()
                    return ttt.end()
                })
        })
        return tt.end()
    })
    return t.end()
}

async function rfiles_test(t){
    t.test('can retrieve', tt => {
        tt.test('fetch a file reported using pattern =*RData on the 405',async ttt => {
            const pattern = '*RData'
            await superagent
                .get(server_host+'/vdsdata/d12/405?pattern='+pattern)
                .then( async r => {
                    ttt.ok(r.body)
                    const c = r.body
                    ttt.type(c, Array)
                    ttt.equal(c.length,1)
                    ttt.same(c[0],'test.RData')
                    // now fetch that file
                    return new Promise((resolve,reject)=>{

                        var rdataWrite = fs.createWriteStream(path.join(__dirname, 'test.RData'))
                        rdataWrite.on('close', function () {
                            //console.log('calling stream close')
                            ttt.same(fs.readFileSync(path.join(__dirname
                                                               ,'public/pems/breakup/d12/405'
                                                               , c[0]))
                                     , fs.readFileSync(path.join(__dirname, 'test.RData')))
                            ttt.end()
                            return resolve()

                        })
                        superagent
                            .get(server_host+'/vdsdata/d12/405/'+c[0])
                            .pipe(rdataWrite)

                    })
                })
            return null
        })
        tt.test('fetch a file reported using pattern =*RData form wim 10',async ttt => {
            const pattern = '*RData'
            await superagent
                .get(server_host+'/wimdata/2008/10?pattern='+pattern)
                .then( async r => {
                    ttt.ok(r.body)
                    const c = r.body
                    ttt.type(c, Array)
                    ttt.equal(c.length,8)
                    ttt.same(c[0],'N/wim.10.N.vdsid.600064.2008.paired.RData')
                    // now fetch the first file
                    return new Promise((resolve,reject)=>{
                        var rdataWrite = fs.createWriteStream(path.join(__dirname, 'test.wim.RData'))
                        rdataWrite.on('close', function () {
                            //console.log('calling stream close')
                            ttt.same(fs.readFileSync(
                                path.join(
                                    __dirname
                                    ,'public/wim/2008/10'
                                    , c[0]
                                )
                            )
                                     , fs.readFileSync(path.join(__dirname, 'test.wim.RData')))
                            ttt.end()
                            return resolve()
                        })

                        superagent
                            .get(server_host+'/wimdata/2008/10/'+c[0])
                            .pipe(rdataWrite)
                    })
                })
            return null
        })
        return tt.end()
    })
    return t.end()
}

async function runit() {
    const server = await launch_server()
    //console.log('test server launched')
    await tap.test('query files', qfiles_test)
        .catch(e => {
            console.log('error caught')
            // tap.end()
            // server.close()
        })
    await tap.test('retrieve files', rfiles_test)
        .catch(e => {
            console.log('error caught')
            // tap.end()
            // server.close()
        })
    tap.end()
    //console.log('tear down server')
    await tear_down()
    //console.log('end of test')
    return null
}

runit()
