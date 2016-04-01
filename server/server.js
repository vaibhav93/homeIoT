var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();
var mqtt = require('mqtt');
app.start = function() {
    // start the web server
    return app.listen(function() {
        app.emit('started');
        console.log('Web server listening at: %s', app.get('url'));
    });
};

var mqtt_options = {
    clientId: 'aws_iot_server',
    host: 'm10.cloudmqtt.com',
    port: 12781,
    username: 'awsuser',
    password: 'aws@user'
}
var client = mqtt.connect(mqtt_options);

client.on('connect', function() {
    console.log('Connected to mqtt');
    app.client = client;
    app.client.subscribe('home');
    app.client.publish('home', 'Hello mqtt.' + mqtt_options.clientId + ' connected.');
});
client.on('message', function(topic, message, packet) {
    console.log(topic + ' : ' + message);
    app.models.Thing.findOne({
        where: {
            mqtt_client_id: message
        }
    }, function(err, thing) {
        if (err || !thing)
            console.log('No this with cliend ID: ' + message + ' found.')
        else {
            console.log('Found ' + message);
            if (thing.power) {
                app.client.publish('home', "1");
            } else {
                app.client.publish('home', "0");
            }
        }
    })
})

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module)
        app.start();
});