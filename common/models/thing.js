var app = require('../../server/server');
module.exports = function(Thing) {

    Thing.beforeRemote('prototype.updateAttributes', function(ctx, result, next) {
        if (ctx.args.data.power) {
            app.client.publish('home', "1");
        } else if (!ctx.args.data.power)
            app.client.publish('home', "0");
        next();
    });
}