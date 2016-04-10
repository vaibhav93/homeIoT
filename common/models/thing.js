var app = require('../../server/server');
module.exports = function(Thing) {
    var clearAllIntervals = function() {
        for (var i = 1; i < 99999; i++)
            window.clearInterval(i);
    }
    var onInterval = function(mqttID, onTime, offTime) {
        //on
        thingSetPower(mqttID, true);
        var me = setTimeout(function(mqttID, offTime, onTime) {
            console.log('mqtt id :' + 'mqttID' + '\n' + 'off time :' + offTime);
            offInterval(mqttID, offTime, onTime);
        }, onTime, mqttID, offTime, onTime);
    };

    var offInterval = function(mqttID, offTime, onTime) {
        //off
        thingSetPower(mqttID, false);
        var me = setTimeout(function(mqttID, onTime, offTime) {
            onInterval(mqttID, onTime, offTime);
        }, offTime, mqttID, onTime, offTime)
    };
    var thingSetPower = function(mqttID, power) {
        app.models.Thing.findOne({
            where: {
                mqtt_client_id: mqttID
            }
        }, function(err, thing) {
            if (err || !thing)
                console.log(err);
            else {
                thing.updateAttributes({
                    power: power
                }, function(err, updatedThing) {
                    if (!power)
                        app.client.publish('home', "0");
                    else
                        app.client.publish('home', "1");
                })
            }
        })
    }
    Thing.beforeRemote('prototype.updateAttributes', function(ctx, result, next) {
        console.log('Change power from api.new Power:' + ctx.args.data.power);
        if (ctx.args.data.power) {
            console.log(' Power changed to: 1');
            app.client.publish('home', "1");

            if (ctx.args.data.timer.status) {
                clearAllIntervals();
                //switch ON
                onInterval(ctx.args.data.mqtt_client_id, ctx.args.data.timer.on * 60 * 1000, ctx.args.data.timer.off * 60 * 1000);
            } else if (!ctx.args.data.timer.status) {
                clearAllIntervals();
            }

        } else if (!ctx.args.data.power) {
            console.log(' Power changed to: 0');
            app.client.publish('home', "0");
        }



        next();
    });
}