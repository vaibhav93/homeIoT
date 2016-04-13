var app = require('../../server/server');
module.exports = function(Thing) {
    var timeoutList = [];
    var clearAllIntervals = function() {
        timeoutList.forEach(function(timeout) {
            clearTimeout(timeout);
        })
        timeoutList = [];
    }
    var onInterval = function(mqttID, onTime, offTime) {
        //on
        console.log("Timer set for mqtt: " + mqttID);
        thingSetPower(mqttID, true);
        console.log("Setting on interval for ")
        var me = setTimeout(function(mqttID, offTime, onTime) {
            offInterval(mqttID, offTime, onTime);
        }, onTime, mqttID, offTime, onTime);
        timeoutList.push(me);
        console.log("On timer value: " + me);
    };

    var offInterval = function(mqttID, offTime, onTime) {
        //off
        thingSetPower(mqttID, false);
        var me = setTimeout(function(mqttID, onTime, offTime) {
            onInterval(mqttID, onTime, offTime);
        }, offTime, mqttID, onTime, offTime);
        timeoutList.push(me);
        console.log("Off timer value: " + me);
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
                console.log("Timer set. On time " + ctx.args.data.timer.on + " minutes. Off time " + ctx.args.data.timer.on + " minutes.")
                clearAllIntervals();
                //switch ON
                onInterval(ctx.args.data.mqtt_client_id, ctx.args.data.timer.on * 60 * 1000, ctx.args.data.timer.off * 60 * 1000);
            } else if (!ctx.args.data.timer.status) {
                clearAllIntervals();
            }

        } else if (!ctx.args.data.power) {
            clearAllIntervals();
            console.log(' Power changed to: 0');
            app.client.publish('home', "0");
        }

        next();
    });
}