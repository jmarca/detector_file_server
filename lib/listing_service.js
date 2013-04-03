/* global require module process console JSON exports */
var glob = require('glob')
var express = require('express')



var parseUrl = require('url').parse;

function fileFilter (strpat) {
  var fre = RegExp(strpat);
  var dre = /\/\./;
  return function (f, type) {
    if(type==="file" && f){
      return f.match(fre) && !f.match(dre);
    }
    return false;
  };
}

/**
 *
 * listing_service(options)
 *
 * Options: 'root' : the root directory to search
 * returns: a service suitable for running on a node web server end point
 *
 */
function listing_service( options ){
    var root = options.root ? options.root : process.cwd();
    if(! /\/$/.test(root) ){
        root += '/'
    }
    var params = ["district","freeway"];
    if(options.params !== undefined) params = options.params;
    return function listing_service(req,res,next){
        var activeParams = params.filter(function(a){return req.params[a];});
        var path = root;
        var morepath = activeParams.map(function(q){return req.params[q];})
        var searchpath = path + morepath.join('/')

        var url = parseUrl(req.url,true);
        // do i need to convert from url escaped to normal? NO
        var pattern = url.query && url.query.pattern ? url.query.pattern : null;
        if(pattern){
            pattern = '**/'+pattern
        }else{
            return next()
        }
        glob(pattern,{cwd:searchpath,dot:true},function(er,files){
	    if(!files){
                //console.log('no files')
	        return next();
	    }
	    if(files.length){
		return res.json(files)
	    }else{
                //console.log('empty files')
		return next();
	    }

        });
        return null;
    }

}

var path = require('path')
var env = process.env


function rfiles(app,options) {
    if(options === undefined) options = {}
    var pems_files = options.pems || env.PEMS_PATH
    var wim_files = options.wim || env.WIM_PATH
    var pems_assets_dir = path.normalize(process.cwd()+'/'+pems_files)
    var wim_assets_dir = path.normalize(process.cwd()+'/'+wim_files)
    app.get('/vdsdata/*RData'
           ,express.static(pems_assets_dir,{hidden:true })
           );

    app.get('/wimdata/*RData'
           ,express.static(wim_assets_dir,{hidden:true })
           );
    return app;
}


/**
 * query filesystem
 */
function qfiles(app,options) {
    if(options === undefined) options = {}
    var pems_files = options.pems || env.PEMS_PATH
    var wim_files = options.wim || env.WIM_PATH
    var pems_assets_dir = path.normalize(process.cwd()+'/'+pems_files)
    var wim_assets_dir = path.normalize(process.cwd()+'/'+wim_files)

    var vdshandler = listing_service({'root': pems_assets_dir})
    app.get('/vdsdata/:district/:freeway?'
           ,function(req,res,next){
                res.connection.setTimeout(0)
                return vdshandler(req,res,next)
            });
    var wimhandler=listing_service({'root': wim_assets_dir
                                   ,'params':['year','site']
                                   })

    app.get('/wimdata/:year?/:site?'
           ,function(req,res,next){
                res.connection.setTimeout(0)
                return wimhandler(req,res,next)
            });
    return app;
}

exports.listing_service = listing_service
exports.rfiles = rfiles
exports.qfiles = qfiles