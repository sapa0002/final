/*! Ionic Sample - v1.0.0 - 2015-12-06
 * Copyright (c) 2015 SurrealRanch; Licensed  */
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'LocalStorageModule', 'ngCordova', 'monospaced.elastic'])
    //auth token for the factory
    .constant('authKey', 'myAuthToken')
    .constant('authApi', 'http://localhost:3000/')
    .constant('bestKey', 'tqz962ccgbcpygds2tmpdem6')
    //after device is ready
    .run(['$ionicPlatform', function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
  }])

.config(['$stateProvider', '$urlRouterProvider', 'localStorageServiceProvider', '$httpProvider',
    function ($stateProvider, $urlRouterProvider, localStorageServiceProvider, $httpProvider) {

        $httpProvider.interceptors.push('TokenInterceptor');

        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';

        localStorageServiceProvider.setPrefix('g12-ionic-sample-1');

        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppCtrl'
            })

        .state('app.storelist', {
            url: '/storelist',
            views: {
                'menuContent': {
                    templateUrl: 'templates/storelist.html',
                    controller: 'StoreListCtrl'
                }
            }
        })

        .state('app.store', {
            url: '/storelist/:storeId',
            views: {
                'menuContent': {
                    templateUrl: 'templates/storedetail.html',
                    controller: 'StoreDetailCtrl'
                }
            }
        })

        .state('app.productsearch', {
            url: '/productsearch',
            views: {
                'menuContent': {
                    templateUrl: 'templates/productsearch.html',
                    controller: 'ProductsCtrl'
                }
            }
        })

        .state('app.messagelist', {
            url: '/messagelist',
            views: {
                'menuContent': {
                    templateUrl: 'templates/messagelist.html',
                    controller: 'MessageListCtrl' //'PlaylistsCtrl'
                }
            }
        })

        .state('app.single', {
            url: '/messagelist/:playlistId',
            views: {
                'menuContent': {
                    templateUrl: 'templates/playlist.html',
                    controller: 'MessageCtrl'
                }
            }
        });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/storelist');

    }]);

angular.module('starter.controllers', [])


.controller('AppCtrl', ['$scope', '$window', '$ionicModal', '$timeout', 'AuthFactory', '$rootScope', '$cordovaOauth',
  function ($scope, $window, $ionicModal, $timeout, AuthFactory, $rootScope, $cordovaOauth) {
        $rootScope.LoggedIn = function () {
            return AuthFactory.isLogged();
        };
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //$scope.$on('$ionicView.enter', function(e) {
        //});
        $rootScope.$on('showLoginModal',
            function ($event, scope, cancelCallback, callback) {

                // Form data for the login modal
                $scope = scope || $scope;

                $scope.loginData = {};

                // Create the login modal that we will use later
                $ionicModal.fromTemplateUrl('templates/login.html', {
                    scope: $scope
                }).then(function (modal) {
                    $scope.modal = modal;
                    $scope.login();
                });

                // Triggered in the login modal to close it
                $scope.closeLogin = function () {
                    $scope.modal.hide();
                    if (typeof cancelCallback === 'function') {
                        cancelCallback();
                    }
                };

                // Open the login modal
                $scope.login = function () {
                    $scope.modal.show();
                };

                // Perform the login action when the user submits the login form
                $scope.doLogin = function () {
                    AuthFactory.login($scope.loginData.username, $scope.loginData.password);
                    if (AuthFactory.isLogged()) {
                        $scope.modal.hide();
                    }
                    if (typeof callback === 'function') {
                        callback();
                    }
                };

                $scope.googleLogin = function () {
                    $cordovaOauth.google("796871197870-vi5m57fcag4af1r5nb1849iv75f3tcni.apps.googleusercontent.com", ["email"])
                        .then(function (result) {
                            // results
                            $scope.modal.hide();
                            console.log(JSON.stringify(result));
                            alert("SUCCESS: " + JSON.stringify(result));
                            AuthFactory.setKey("GoogleLoginSuccess");

                            //access_token=ya29.PwIBWIzLgobC7RC8iHkgYYDA_9YH0Z6m1IfKdj4Ab-hfOLuuxXfCk7iiE_tnkhv715HX1
                            //var url = "https://www.googleapis.com/userinfo/email?access_token=" + result.access_token;
                            //Use a service to get name
                        }, function (error) {
                            // error
                            console.log(JSON.stringify(error));
                            alert("ERROR: " + JSON.stringify(error));
                        });
                };
            }
        );

        $rootScope.loginFromMenu = function () {
            $rootScope.$broadcast('showLoginModal', $scope, null, function () {
                if (AuthFactory.isLogged()) {
                    alert("Login SUCCESS");
                    $scope.modal.hide();
                    $window.location.reload();
                }
            });
        };

        $rootScope.logoutFromMenu = function () {
            AuthFactory.logout();
            $window.location.reload();
        };
    }
  ])

.controller('ProductsCtrl', ['$scope', '$ionicSlideBoxDelegate', 'AuthFactory', 'BestBuy', 'Logger',
    function ($scope, $ionicSlideBoxDelegate, AuthFactory, BestBuy, Logger) {
        $scope.searchData = {};
        $scope.images = [];

        $scope.isLoggedOut = function () {
            return !AuthFactory.isLogged();
        };

        $scope.doSearch = function () {

            if ($scope.searchData.manufacturer.length = 0) {
                alert("Manufacturer's name is mandatory");
                return;
            }
            BestBuy.search($scope.searchData).then(function (response) {
                    console.log(JSON.stringify(response));
                    Logger.debug("Search Response", JSON.stringify(response));
                    alert("Status: " + response.statusText + " data.total: " + response.data.total);
                    $scope.images = [];
                    var products = response.data.products;
                    for (var i = 0; i < products.length; i++) {
                        var product = products[i];
                        $scope.images.push({
                            MediaUrl: product.image,
                            name: product.name,
                            sku: product.sku,
                            salePrice: product.salePrice
                        });
                    }
                    setTimeout(function () {
                        $ionicSlideBoxDelegate.slide(0);
                        $ionicSlideBoxDelegate.update();
                        $scope.$apply();
                    });

                },
                function (e) {
                    console.log(JSON.stringify(e));
                    alert("ERROR: " + JSON.stringify(e));
                });
        };
    }
  ])

//$cordovaGeolocation
.controller('StoreListCtrl', ['$scope', 'AuthFactory', '$rootScope', 'Logger', 'Geolocation',
    function ($scope, AuthFactory, $rootScope, Logger, Geolocation) {

        var promise;

        $scope.searchData = {};
        $scope.items = [];
        $scope.status = "Searching for Closest Stores";
        $scope.isLoggedOut = function () {
            return !AuthFactory.isLogged();
        };

        if (AuthFactory.isLogged() === false) {
            $rootScope.$broadcast('showLoginModal', $scope, null, function () {
                $scope.status = "Searching";
                $scope.items = [];
                promise = Geolocation.all();
                promise.then(function (storeList) {
                    $scope.status = "Find Stores";
                    $scope.items = storeList;

                }, function (reason) {
                    alert('Failed: ' + reason);
                }, function (update) {
                    $scope.status = update;
                });
            });
        } else {
            $scope.status = "Searching";
            $scope.items = [];
            promise = Geolocation.all();
            promise.then(function (storeList) {
                $scope.status = "Find Stores";
                $scope.items = storeList;

            }, function (reason) {
                alert('Failed: ' + reason);
            }, function (update) {
                $scope.status = update;
            });
        }


        $scope.doSearch = function () {
            //alert(JSON.stringify($scope.searchData));
            var search = null;
            if ($scope.searchData.city) {
                search = $scope.searchData.city;
            } else {
                if (!confirm("Find Stores closest to your location?")) {
                    return;
                }
            }
            $scope.status = "Searching";
            $scope.items = [];
            var promise2 = Geolocation.all(search);
            promise2.then(function (storeList) {
                $scope.status = "Find Stores";
                $scope.items = storeList;

            }, function (reason) {
                alert('Failed: ' + reason);
            }, function (update) {
                $scope.status = update;
            });

        };
    }
  ])

.controller('StoreDetailCtrl', ['$scope', '$stateParams', 'Geolocation',
    function ($scope, $stateParams, Geolocation) {
        //alert(JSON.stringify($stateParams));
        var storeId = $stateParams.storeId;
        $scope.item = Geolocation.details(storeId);

    }])

.controller('MessageListCtrl', ['$scope', 'AuthFactory', '$rootScope', 'Logger',
    function ($scope, AuthFactory, $rootScope, Logger) {
        $scope.items = [];
        $scope.isLoggedOut = function () {
            return !AuthFactory.isLogged();
        };

        if (AuthFactory.isLogged() === false) {
            $rootScope.$broadcast('showLoginModal', $scope, null, function () {
                $scope.items = Logger.all();
            });
        } else {
            $scope.items = Logger.all();
        }
    }
  ])

.controller('MessageCtrl', ['$scope', '$stateParams', 'Logger',
  function ($scope, $stateParams, Logger) {
        var id = $stateParams.playlistId;
        $scope.item = Logger.get(id);
  }]);


angular.module('starter.services', [])

.factory('AuthFactory', ['localStorageService', 'authKey',
    function (localStorageService, authKey) {
        return {
            isLogged: function () {
                if (localStorageService.get(authKey) == null) {
                    return false;
                }
                return true;
            },
            login: function (user, password) {

                if (user !== "guest" && password.length > 5) {
                    localStorageService.set(authKey, "LocalLoginSuccess");
                } else {
                    alert("Incorrect user name or password");
                }
            },
            setKey: function (key) {
                localStorageService.set(authKey, key);
            },
            logout: function () {
                localStorageService.remove(authKey);
            }
        };
    }])

//Todo usefull for retrieving user name from OAth2 ???
.factory('TokenInterceptor', ['localStorageService', 'authKey',
    function (localStorageService, authKey)
    {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                if (config.url === "http://localhost:3000/playlists") {
                    var token = localStorageService.get(authKey);
                    if (token != null) {
                        config.headers['secretkey'] = token;
                        console.log("ADD header: " + JSON.stringify(config));
                    } else {
                        console.log("No header: " + JSON.stringify(config));
                    }
                }
                return config;
            },
            response: function (response) {
                return response;
            }
        };
    }])

.factory('PlayLists', ['$http', 'authApi',
    function ($http, authApi)
    {
        return {
            all: function () {
                return $http.get(authApi + 'playlists');
            }
        };
    }])

.factory('BestBuy', ['$http', 'bestKey',
    function ($http, bestKey) {
        return {
            search: function (searchData) {
                var manufacturer = searchData.manufacturer;
                var shortDescription = searchData.shortDescription;
                var url = 'http://api.bestbuy.com/v1/products((manufacturer=' + manufacturer + '&search=' + shortDescription + '))?show=name,sku,salePrice,image&format=json&apiKey=' + bestKey;
                return $http.get(url);
            }
        };
    }
  ])

.factory('Geolocation', ['$cordovaGeolocation', '$q', '$http', 'Logger', 'bestKey',
    function ($cordovaGeolocation, $q, $http, Logger, bestKey) {

        var storeList = [];
        return {
            all: function (search) {
                var deferred = null;
                deferred = $q.defer();

                if (search) {
                    deferred.notify("Getting stores in " + search);
                    var url = 'http://api.bestbuy.com/v1/stores(city=' + search + ')?format=json&apiKey=' + bestKey;
                    $http.get(url).then(function (response) {
                            Logger.debug("Stores Response", JSON.stringify(response));
                            storeList = response.data.stores;
                            deferred.resolve(storeList);
                        },
                        function (err) {
                            Logger.error("Error getting Storlist", JSON.stringify(err));
                            deferred.reject("Error getting Storlist - see Messages");
                        });
                } else {
                    var posOptions = {
                        timeout: 10000,
                        enableHighAccuracy: false
                    };
                    $cordovaGeolocation
                        .getCurrentPosition(posOptions)
                        .then(function (position) {

                            var lat = position.coords.latitude;
                            var long = position.coords.longitude;
                            deferred.notify("Getting locations close to lat:" + lat + " long:" + long);
                            var url = 'http://api.bestbuy.com/v1/stores(area(' + lat + ',' + long + ',1000))?format=json&apiKey=' + bestKey;
                            $http.get(url).then(function (response) {
                                    Logger.debug("Stores Response", JSON.stringify(response));
                                    storeList = response.data.stores;
                                    deferred.resolve(storeList);
                                },
                                function (err) {
                                    Logger.error("Error getting Storlist", JSON.stringify(err));
                                    deferred.reject("Error getting Storlist - see Messages");
                                });
                        }, function (err) {
                            Logger.error("Error getting Geolocation", JSON.stringify(err));
                            deferred.reject("Error getting Geolocation - see Messages");
                        });

                }
                return deferred.promise;
            },
            details: function (storeId) {
                storeId = parseInt(storeId);
                for (var i = 0; i < storeList.length; i++) {
                    var store = storeList[i];
                    if (storeId === store.storeId) {
                        return store;
                    }
                }
                return null;
            }

        };
    }
  ])

.factory('Logger', ['localStorageService',
    function (localStorageService) {

        var storage;

        if (localStorageService.get("storage")) {
            storage = localStorageService.get("storage");
        } else {
            storage = [];
        }

        if (!localStorageService.get("counter")) {
            //  counter = localStorageService.get("counter");
            //}else
            //{
            localStorageService.set("counter", 0);
        }

        function update(msg, details, type) {
            var currentdate = new Date();
            var datetime = "Date: " + currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " @ " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();

            var counter = localStorageService.get("counter");
            storage.push({
                id: counter,
                datetime: datetime,
                msg: msg,
                details: details,
                type: type
            });
            localStorageService.set("storage", storage);
            counter++;
            localStorageService.set("counter", counter);
        }

        return {
            all: function () {
                //return localStorageService.get("storage");
                return storage;
            },
            get: function (id) {
                id = parseInt(id);
                for (var i = 0; i < storage.length; i++) {
                    var item = storage[i];
                    if (item.id === id) {
                        return item;
                    }
                }
                return null;
            },
            debug: function (msg, details) {
                update(msg, details, "DEBUG");
            },
            error: function (msg, details) {
                update(msg, details, "ERROR");
            }
        };

    }]);