
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

/*
ajax loading module.
 */
var ajaxLoading = angular.module('ajaxLoading', []);
ajaxLoading.config(function($httpProvider) {
    $httpProvider.responseInterceptors.push('myHttpInterceptor');
});
ajaxLoading.run(function($http, $rootScope) {
    // if you set the templateUrl as a local template on the page, the $http service
    // still registers it as an an ajax call. so have to account for that.
    //http://jsfiddle.net/dBR2r/©/
    //https://groups.google.com/forum/#!topic/angular/BbZ7lQgd1GI

    //set up http request counts
    $rootScope.ajaxLoading = {
        count: 0
    };
    $rootScope.ajaxLoading.show = function() {
        return $rootScope.ajaxLoading.count > 0;
    };

    var spinnerFunction = function (data) {
        $rootScope.ajaxLoading.count++;
        return data;
    };
    $http.defaults.transformRequest.push(spinnerFunction);
});


// register the interceptor as a service, intercepts ALL angular ajax http calls
ajaxLoading.factory('myHttpInterceptor', function ($q, $rootScope) {
    return function (promise) {
        return promise.then(function (response) {
            $rootScope.ajaxLoading.count--;
            return response;

        }, function (response) {
            $rootScope.ajaxLoading.count--;
            return $q.reject(response);
        });
    };
});


var app = angular.module('ContactsApp', ['ajaxLoading', 'ngResource']);

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
        });
});


app.factory('ContactResource', function($resource) {
   var ContactResource = $resource('/contacts/:id', {id: '@id'}, {update: {method: 'PUT'}});
    return ContactResource;
});

app.factory('ContactService', function($q, ContactResource){
    console.log('contact Service loaded');


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
            var deferred = $q.defer();

            contact.$save(function(data) {
                contacts.push(data);
                deferred.resolve(data);
            });
            return deferred.promise;
        },

        update: function(contact) {
            var deferred = $q.defer();

            contact.$update(function(data) {
                var toUpdate = _.find(contacts, function(elem) {
                    return elem.id === data.id;
                });
                angular.copy(data, toUpdate);
                deferred.resolve(data);
            });
            return deferred.promise;
        },

        delete: function(contact) {
            var deferred = $q.defer();

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
                deferred.resolve(data);
            });
            return deferred.promise;
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
        if(contact) {
            $scope.contact = contact;
        }
        else {
            $location.path('/');
        }
    });

    $scope.delete = function() {
        if(confirm("Are you sure you want to delete this contact?")) {
            var promise = ContactService.delete($scope.contact);
            promise.then(function(contact) {
                $location.path('/');
            });
        }
    }
});


app.controller('ContactsNewCtrl', function($scope, $location, ContactService) {
    $scope.props = {};
    $scope.props.title = "New Contact";
    $scope.props.saveBtnName = "Create";

    $scope.contact = ContactService.new();

    $scope.save = function() {
        var promise = ContactService.save($scope.contact);
        promise.then(function(contact) {
            $location.path('/' + contact.id);
        });
    }
});


app.controller('ContactsEditCtrl', function($scope, $location, $routeParams, ContactService) {
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
        var promise = ContactService.update($scope.contact);
        promise.then(function(contact) {
            $location.path('/' + contact.id);
        });
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


    Another note:

    Services are not instantiated until there is a dependency. i.e. if you have a controller with an dependency
    on ContactsResource, and that controller is loaded, then ContactsResource is instantiated. If you have a controller,
    without a dependency on ContactsResource, then ContactsResource isn't instantiated, until say a different controller,
    that has a dependency on it is loaded. Basically Service's are lazy instantiated.

 */
