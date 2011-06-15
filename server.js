var env = process.env;
var puser = process.env.PSQL_USER ;
var ppass = process.env.PSQL_PASS ;
var phost = process.env.PSQL_HOST ;
var cuser = process.env.COUCHDB_USER ;
var cpass = process.env.COUCHDB_PASS ;
var chost = process.env.COUCHDB_HOST ;
var connect = require('connect');
var jsonp = require('connect-jsonp');

// for user validation
var callback_stripper = require('callback_stripper');
var cas_validate = require('cas_validate');

// for context
var RedisStore = require('connect-redis')(connect);

var listing_service = require('./lib/listing_service');

var server = connect.createServer(
    connect.logger()
    ,connect.favicon(__dirname + '/public/favicon.ico')
    ,connect.bodyParser()
    ,connect.cookieParser()
    ,connect.session({ store: new RedisStore   //RedisStore or MemoryStore
                       , secret: '234kl 0aeyn9' })
    ,jsonp()
    //,cas_validate.validate({})
    ,callback_stripper()   // have to strip the callback param for caching
    ,connect.router(rfiles)

    ,connect.errorHandler({ dumpExceptions: true, showStack: true })
);



server.listen(3000);
console.log('Connect server listening on port 3000, working on '+__dirname+ ' but of course, there is always the fact that '+process.cwd());
// //server.listen(3000);
// console.log('Current gid: ' + process.getgid());
// try {
//     process.setgid(65533);
//     console.log('New gid: ' + process.getgid());
// }
// catch (err) {
//     console.log('Failed to set gid: ' + err);
//     throw(err);
// }
// console.log('Current uid: ' + process.getuid());
// try {
//     process.setuid(65534);
//     console.log('New uid: ' + process.getuid());
// }
// catch (err) {
//     console.log('Failed to set uid: ' + err);
//     throw(err);
// }

server.on('error',function(e){
    // this handler exists purely to swallow bad file descriptor errors
    if (e.errno != EBADF) {
        // rethrow exception
        throw e;
    }
    console.log('file transfer choked on bad file descriptor');
    console.log(JSON.stringify(e));
});

function rfiles(app) {
  app.get('/vdsdata/*RData'
  ,connect.static(process.cwd()+"/public/pems/breakup")
         );
  app.get('/wimdata/*RData'
  ,connect.static(process.cwd()+"/public/wim")
         );
  //query filesystem
  app.get('/vdsdata/:district/:freeway?'
  ,listing_service({'root': process.cwd()+"/public/pems/breakup"})
         );
  app.get('/wimdata'
  ,listing_service({'root': process.cwd()+"/public/wim"})
         );
}

// query couchdb
function vdsid_listing(app) {

  app.get('/vdsid',vdsid_info_service({'db':'vds'
                                     ,'user':cuser
                                     ,'pass':cpass
				     ,'host':chost
                                      }
                                     )
         );
}

