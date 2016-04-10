var app = require('../../server/server');
module.exports = function(Thing) {

    Thing.beforeRemote('prototype.updateAttributes', function(ctx, result, next) {
        console.log('Change power from api.new Power:' + ctx.args.data.power);
        if (ctx.args.data.power) {
            console.log(' Power changed to: 1');
            app.client.publish('home', "1");
        } else if (!ctx.args.data.power) {
            console.log(' Power changed to: 0');
            app.client.publish('home', "0");
        }


        next();
    });
}