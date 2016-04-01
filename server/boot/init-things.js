'use strict';

module.exports = function(app) {
    var thingModel = app.models.Thing;

    var ds = app.dataSources.mongoDs;

    var init_things = [{
        name: 'cooler1',
        mqtt_client_id: 'cooler1',
        power: false
    }]
    ds.once('connected', function() {

        init_things.forEach(function(thing) {
            thingModel.findOrCreate({
                where: {
                    name: thing.name
                }
            }, thing, function(err, createdThing, created) {
                if (err) {
                    console.log(err)
                }
                //console.log(createdBusiness);
                (created) ? console.log('Created thing:', createdThing.name) : console.log('Found thing', createdThing.name);
            })
        })
    })
}