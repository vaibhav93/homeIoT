app.controller("page1Ctrl", function($scope, Thing) {
    $scope.thing = {};
    Thing.findOne({
        filter: {
            where: {
                mqtt_client_id: "Cooler_1"
            }
        }
    }, function(thing) {
        $scope.thing = thing;
    })
    $scope.message = "hi I am new angular app";
    $scope.persons = [{
        fName: "Vaibhav",
        lName: "Gupta"
    }, {
        fName: "Shubhangi",
        lName: "Gupta"
    }];

});