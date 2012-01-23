var request = require('request');
var filed = require('filed');
var dirs = require('makedir');
var fs = require('fs');

module.exports = put_service;
var parseUrl = require('url').parse;


/**
 *
 * put_service(options)
 *
 * Options: 'root' : the root directory to search
 * returns: a service suitable for running on a node web server end point
 *
 */
function put_service( options ){
  var root = options.root ? options.root : process.cwd();
  return function put_service(req,res,next){

      var params = ["year","wimid","file"];
      var activeParams = params.filter(function(a){return req.params[a];});
      if(activeParams.length != 3){
          return next(new Error('invalid post'));
      }
      var path = root;
      var file = req.params.file;
      path = [path,req.params.year,req.params.wimid].join('/');
      var fpath = path+'/'+file+'.RData'
      fs.stat(fpath,function(err,stats){
          if(err){
              // okay to write
              console.log('going to make' +path);
              dirs.makedir(path
                           ,function(err){
                               if(err){
                                   console.log('puke')
                                   return next(new Error(err));
                               }
                               console.log('piping content');
                               req.pipe(filed(fpath)).pipe(res);
                               return null;
                           });

          }else{
              // already have file, carp
              next(new Error('file exists'));
          }
      });
      return null;
  }
}
