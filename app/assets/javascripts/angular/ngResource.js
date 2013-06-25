

/*
This is just a test testing out how ng resource works. Use console.for debugging
 */
var app = angular.module('resourceTest', ['ngResource']);
//
//app.factory('ContactResource', function($resource) {
//    var ContactResource = $resource('/contacts/:id', undefined, {update: 'PUT'});
//    window.ContactResource = ContactResource;
//    return ContactResource;
//});
//
//var result = window.ContactResource.query(function(){console.log("complete");});
//


app.controller('Ctrl', function($resource) {

    // add update method and say that the id passed into the url should be the id from the object
    var ContactResource = $resource('/contacts/:id', {id: '@id'}, {update: {method: "PUT"}});
    window.ContactResource = ContactResource;
    window.result = window.ContactResource.query(function(){
        console.log(result);

        // test the update method after the initial query is done
        var a = window.result[0];
        a.age = a.age + 1;
        a.$update(function(data) {
            console.log("success!");
            console.log(data);
        });

    });
    console.log(window.result);
});

