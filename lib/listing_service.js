/* global require module process console JSON exports */
var find = require('./utils/find');
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
      pattern = RegExp(pattern);
    }
      console.log([searchpath,pattern].join(' '));
      find(searchpath,fileFilter(pattern),function(er,f){
	  if(!f){
	      next();
	  }else{
	      var files=f.filter(function(a){return a;});
	      files=files.map(function(f){
		  return f.replace(path,'');
	      });
	      if(files.length){
		  res.end(JSON.stringify(files));
	      }else{
		  next();
	      }
	  }
    });
  }

}

function rfiles(app) {
    app.get('/vdsdata/*RData'
            ,express.static(process.cwd()+"/public/pems")
           );


    app.get('/wimdata/*RData'
            ,express.static(process.cwd()+"/public/wim")
           );
}


function qfiles(app) {
  //query filesystem
  app.get('/vdsdata/:district/:freeway?'
  ,listing_service({'root': process.cwd()+"/public/pems/vdsdata/"})
         );
  app.get('/wimdata/:year?/:site?'
  ,listing_service({'root': process.cwd()+"/public/wim/wimdata/"
                    ,'params':['year','site']
                    })
         );
}

exports.listing_service = listing_service
exports.rfiles = rfiles
exports.qfiles = qfiles