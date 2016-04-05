var loopback = require('loopback');
var boot = require('loopback-boot');
var moment = require('moment');
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
setInterval(function() {
    app.models.Thing.findOne({
        where: {
            mqtt_client_id: 'Cooler_1'
        }
    }, function(err, thing) {
        if (err || !thing)
            console.log(err);
        else {
            if (thing.power) {
                console.log('Cooler was on. Switching off at ' + moment(new Date()).format('DD-MM-YYYY HH:mm'));
                thing.updateAttributes({
                    power: false
                }, function(err, updatedThing) {
                    app.client.publish('home', "0");
                    console.log('Switched off')
                })
            } else {
                console.log('Cooler was off. Switching on at ' + moment(new Date()).format('DD-MM-YYYY HH:mm'));
                thing.updateAttributes({
                    power: true
                }, function(err, updatedThing) {
                    app.client.publish('home', "1");
                    console.log('Switched on')
                })
            }
        }
    })
}, 300000)
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module)
        app.start();
});