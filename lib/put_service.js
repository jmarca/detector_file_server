var request = require('request');
var filed = request('filed');

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
      activeParams.map(function(q){
          path = path + '/' +req.params[q];
      });
      req.pipe(filed(path+'.RData')).pipe(resp);
      return null;
  }
}
