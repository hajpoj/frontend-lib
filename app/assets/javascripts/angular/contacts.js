
//var app = angular.module('contacts', ['ngResource']);
//app.factory('contactFactory', function($resource) {
//    window.Contacts = $resource('/contacts/');
//    return Contacts;
//});


// 2 ways to define a controller. either using the .notation / or just creating a function
// with the name of the controller. The function has to be in the global scope so it's probably
// better to use the controller notation to not pollute the global namespace. might be good for
// a quick and dirty job.

//    .controller('ContactsController', function($scope) {
//        $scope.contacts = [
//           {lastName: "Peter", firstName: "Ryan", age: 24, contactType: "friend"},
//           {lastName: "Peter2", firstName: "Ryan2", age: 24, contactType: "friend"}
//        ];
//        $scope.title = "a title";
//    });


var app = angular.module('ContactsApp', ['ngResource']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl:'listTemplate',
            controller: 'ContactsCtrl'
        })
        .when('/new', {
            templateUrl: 'newTemplate',
            controller: 'ContactsNewCtrl'
        })
        .when('/edit/:id', {
            templateUrl: 'newTemplate',
            controller: 'ContactsEditCtrl'
        });
});


app.factory('ContactResource', function($resource) {
   var ContactResource = $resource('/contacts/:id', {id: '@id'}, {update: {method: 'PUT'}});
    return ContactResource;
});

app.factory('ContactService', function(ContactResource){
    var contacts;

    return {
        getContacts: function(callback) {
            if(contacts) {
                setTimeout(callback, 0);
                return contacts;
            }
            else {
                contacts =  ContactResource.query(callback);
                return contacts;
            }
        },

        getContact: function(id, callback) {
            if(contacts) {
                setTimeout(callback, 0);
                var contact =  _.find(contacts, function(element) {
                    return element.id = id;
                });
                return contact;
            }
            else {
                return ContactResource.get({id: id}, callback);
            }
        },

        newContact: function() {
            return new ContactResource();
        },

        saveContact: function(contact, callback) {
            if(contacts) {
                contact.$save(function(data) {
                    contacts.add(data);
                    callback(arguments);
                });
            }
            else {
                contact.$save(callback(arguments));
            }
        }
//        updateContact: function(contact, callback) {
//            if(contacts)
//        }
    }
});


app.controller('ContactsCtrl', function($scope, $location, ContactService) {

    $scope.title = "Contacts";

//    $scope.contacts = ContactResource.query(function() {
//        console.log("complete!");
//    });

    $scope.contacts = ContactService.getContacts(function() {
        console.log('complete!');
    });

    $scope.new = function() {
        console.log('clicked!');
        $location.path('/new');
    };
});

app.controller('ContactsNewCtrl', function($scope, $location, ContactService) {
    $scope.title = "New Contact";
    //$scope.contact = new ContactResource();
    $scope.contact = ContactService.newContact();

    $scope.create = function() {
//        $scope.contact.$save(function() {
//            console.log("success!");
//        });
        ContactService.saveContact($scope.contact, function(){
            console.log('success!');
        });
        $location.path('/');
    }
});
