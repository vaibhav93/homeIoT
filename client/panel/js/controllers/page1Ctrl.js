app.controller("page1Ctrl", function($scope, Thing) {
    $scope.thing = {};

    $scope.reload = function() {
        Thing.findOne({
            filter: {
                where: {
                    mqtt_client_id: "Cooler_1"
                }
            }
        }, function(thing) {
            $scope.thing = thing;
        });
    }
    $scope.reload();
    $scope.saveChanges = function() {
        Thing.prototype$updateAttributes({
            id: $scope.thing.id
        }, $scope.thing, function(success) {
            console.log(success)
        }, function(err) {
            console.log(err)
        });
    }

});