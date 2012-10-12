var filed = require('filed');
var dirs = require('makedir');
var path = require('path');
var fs = require('fs');
var async = require('async');

/**
 *
 * put_service(options)
 *
 * Options: 'root' : the root directory to search
 * returns: a service suitable for running on a node web server end point
 *
 */
function check_service( options ){
  var root = options.root ? options.root : process.cwd();
  return function check_service(req,res,next){

      var params = ["year","wimid","file"];
      var activeParams = params.filter(function(a){return req.params[a];});
      if(activeParams.length != 3){
          return next(new Error('invalid post'));
      }
      var p = root;
      var file = req.params.file;
      p = p+[req.params.year,req.params.wimid].join('/');
      var fp = p+'/'+file+'.RData';
      path.exists(fp, function (exists) {
          if (exists) return next(new Error('file already exists'));
          fs.unlink(fp,function(){next()});
      });
  }
}

function dir_service( options ){
    var root = options.root ? options.root : process.cwd();
    return function dir_service(req,next){

        var params = ["year","wimid","file"];
        var activeParams = params.filter(function(a){return req.params[a];});
        if(activeParams.length != 3){
            return next(new Error('invalid post'));
        }
        var p = root;
        var file = req.params.file;
        p = [p,req.params.year,req.params.wimid].join('/');
        console.log('going to make' +p);
        var fp = p+'/'+file+'.RData';
        dirs.makedir(p
                     ,function(err){
                         if(err){
                             console.log('puke')
                             return next(new Error(err));
                         }
                         return next()
                      });
        return null
    }
}


function put_service_only( options ){
    var root = options.root ? options.root : process.cwd();
    return function put_service(req,res,next){

        var params = ["year","wimid","file"];
        var activeParams = params.filter(function(a){return req.params[a];});
        if(activeParams.length != 3){
            return next(new Error('invalid post'));
        }
        var p = root;
        var file = req.params.file;
        p = [p,req.params.year,req.params.wimid].join('/');
        var fp = p+'/'+file+'.RData';
        console.log('piping content');
        req.pipe(filed(p+'/'+file+'.RData')).pipe(res);
        return null;
    }
}

function put_service(options){
    var p = put_service_only(options);
    var d = dir_service(options);

    return function(req,res,next){
        var oldreq = req;
        async.series([function(callback){
            d(req,callback);
        }]

                     ,function(err, results){
                         //
                         if(err) next(err);
                         p(oldreq,res,next);
                     });
    }
}


function dput_service( options ){
    var root = options.root ? options.root : process.cwd();
    return function put_service(req,res,next){

        var params = ["year","wimid","file"];
        var activeParams = params.filter(function(a){return req.params[a];});
        if(activeParams.length != 3){
            return next(new Error('invalid post'));
        }
        var p = root;
        var file = req.params.file;
        p = [p,req.params.year,req.params.wimid].join('/');
        console.log('going to make' +p);
        var fp = p+'/'+file+'.RData';
        dirs.makedir(p
                     ,function(err){
                         if(err){
                             console.log('puke')
                             return next(new Error(err));
                         }
                         console.log('piping content');
                         req.pipe(filed(p+'/'+file+'.RData')).pipe(res);
                         return null;
                     });
    }
}
function rfiles(app) {
    app.put('/wimdata/:year/:wimid/:file.RData'
            ,put_service({'root': process.cwd()+"/public/wim/wimdata/"})
           );
}


exports.check_service = check_service;
exports.put_service = put_service;
exports.rfiles=rfiles;

