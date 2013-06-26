
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
            templateUrl: "blankTemplate"
        })
        .when('/new', {
            templateUrl: 'editTemplate',
            controller: 'ContactsNewCtrl'
        })
        .when('/:id', {
            templateUrl: 'viewTemplate',
            controller: 'ContactsViewCtrl'
        })
        .when('/:id/edit', {
            templateUrl: 'editTemplate',
            controller: 'ContactsEditCtrl'
        })
});


app.factory('ContactResource', function($resource) {
   var ContactResource = $resource('/contacts/:id', {id: '@id'}, {update: {method: 'PUT'}});
    return ContactResource;
});

app.factory('ContactService', function($q, ContactResource){

    var deferred = $q.defer(),
        promise = deferred.promise;

    var contacts = ContactResource.query(function() {
        deferred.resolve(contacts);
    });

    return {
        getAll: function() {
            return promise;
        },

        get: function(id) {
            return promise.then (function(contacts) {
                return _.find(contacts, function(elem) {
                    return elem.id === id;
                });
            });
        },

        new: function() {
            return new ContactResource();
        },

        save: function(contact) {
            contact.$save(function(data) {
                contacts.push(data);
            });
        },
        update: function(contact) {
            contact.$update(function(data) {
                var toUpdate = _.find(contacts, function(elem) {
                    return elem.id === data.id;
                });
                angular.copy(data, toUpdate);
            });
        },
        delete: function(contact) {
            console.log(contact);
            contact.$remove(function(data) {

                // remove item from object
                var objIndex = -1;
                for(var i = 0; i < contacts.length; i++) {
                    if(contacts[i].id === contact.id) {
                        objIndex = i;
                        break;
                    }
                }
                if(objIndex >= 0) {
                    contacts.splice(objIndex, 1);
                }
            });
        }
    }
});


app.controller('ContactsCtrl', function($scope, $location, ContactService) {

    $scope.query = {};
    $scope.query.input = "";
    $scope.title = "Contacts";

    var promise = ContactService.getAll();
    promise.then(function(contacts) {
        $scope.contacts = contacts;
    });

    $scope.search = function (item){
        var firstName = item.first_name ? item.first_name : "",
            lastName = item.last_name ? item.last_name : "";

        if(firstName.indexOf($scope.query.input)!=-1 || lastName.indexOf($scope.query.input)!=-1) {
            return true;
        }
        return false;
    };

    $scope.new = function() {
        console.log('clicked!');
        $location.path('/new');
    };

    $scope.view = function(contact) {
        var path = '/' + contact.id;
        $location.path(path);
    };
});


app.controller('ContactsViewCtrl', function($scope, $location, $routeParams, ContactService) {
    var id = parseInt($routeParams.id);

    var promise =  ContactService.get(id);
    promise.then(function(contact) {
        $scope.contact = contact;
    });

    $scope.delete = function() {
        if(confirm("Are you sure you want to delete this contact?")) {
            ContactService.delete($scope.contact);
            $location.path('/');
        }
    }
});


app.controller('ContactsNewCtrl', function($scope, $location, ContactService) {
    $scope.props = {};
    $scope.props.title = "New Contact";
    $scope.props.saveBtnName = "Create";

    $scope.contact = ContactService.new();

    $scope.save = function() {
        ContactService.save($scope.contact);
        $location.path('/');
    }
});


app.controller('ContactsEditCtrl', function($scope, $location, $routeParams, ContactService, $timeout) {
    var id = parseInt($routeParams.id);
    $scope.props = {};
    $scope.props.title = "Edit Contact";
    $scope.props.saveBtnName = "Update";
    $scope.contact = ContactService.new();

    var promise =  ContactService.get(id);
    promise.then(function(contact) {
        angular.copy(contact, $scope.contact);
    });

    $scope.save = function() {
        ContactService.update($scope.contact);
        $location.path('/'+ id);
    }
});

/*
    BIG NOTE:
    if you set a promise to the $scope, it knows how to deal with it how you would expect! (ACTUALLY NOT READ BELOW)
    E.g.

    This:

    var promise =  ContactService.get(id);
    promise.then(function(contact) {
        $scope.contact = contact;
    });

    Equals:

    $scope.contact = ContactService.get(id);

    // so i created a service and returned promises and then that can be bound directly to the scope!
    // then the scope will take the value returned by the promise and use that!

    but in reality this only works if you are DISPLAYING THE DATA. if you are trying to EDIT the data,
    This doesn't work. I dont know why though.
 */
