var find = require('./utils/find');

module.exports = listing_service;


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
  return function listing_service(req,res,next){
    var activeParams = params.filter(function(a){return req.params[a];});
    var path = root;
    activeParams.map(function(q){
      path = path + '/' +req.params[q];
    });
    var url = parseUrl(req.url,true);
    // do i need to convert from url escaped to normal? NO
    var pattern = url.query && url.query.pattern ? url.query.pattern : null;
    if(pattern){
      pattern = RegExp(pattern);
    }
    console.log([path,pattern].join(' '));
    find(path,fileFilter(pattern),function(er,f){
      var files=f.filter(function(a){return a;});
      files=files.map(function(f){
        return f.replace(path,'');
      });
      if(files.length){
        res.end(JSON.stringify(files));
      }else{
        next();
      }
    });
  }

}
