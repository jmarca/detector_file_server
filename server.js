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
var RedisStore = require('connect-redis');

var server = connect.createServer(
    connect.logger()
    ,connect.favicon(__dirname + '/public/favicon.ico')
    ,connect.bodyParser()
    ,connect.cookieParser()
    ,connect.session({ store: new RedisStore   //RedisStore or MemoryStore
                       , secret: '234kl 0aeyn9' })
    ,jsonp()
    ,cas_validate.validate({})
    ,callback_stripper()   // have to strip the callback param for caching
    ,connect.router(css)

    ,connect.errorHandler({ dumpExceptions: true, showStack: true })
);



server.listen(80);
console.log('Connect server listening on port 80 on service /geojson');
//server.listen(3000);
console.log('Current gid: ' + process.getgid());
try {
    process.setgid(65533);
    console.log('New gid: ' + process.getgid());
}
catch (err) {
    console.log('Failed to set gid: ' + err);
    throw(err);
}
console.log('Current uid: ' + process.getuid());
try {
    process.setuid(65534);
    console.log('New uid: ' + process.getuid());
}
catch (err) {
    console.log('Failed to set uid: ' + err);
    throw(err);
}

function css(app) {
    app.get('/css/*'
            ,connect.static(__dirname+"/public")
           );
}

function vdsid_listing(app) {

    app.get('/vdsid',vdsid_info_service({'db':'vds'
                                         ,'user':cuser
                                         ,'pass':cpass
				         ,'host':chost
                                        }
                                       )
           );

