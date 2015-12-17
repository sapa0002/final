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


                $scope.closeLogin = function () {
                    $scope.modal.hide();
                    if (typeof cancelCallback === 'function') {
                        cancelCallback();
                    }
                };


                $scope.login = function () {
                    $scope.modal.show();
                };


                $scope.doLogin = function () {
                    console.log("I am the normal login.");
                    AuthFactory.login($scope.loginData.username, $scope.loginData.password);
                    if (AuthFactory.isLogged()) {
                        $scope.modal.hide();
                    }
                    if (typeof callback === 'function') {
                        callback();
                    }
                };

                $scope.fbLogin = function () {
                    alert("I am being called");
                    $cordovaOauth.facebook("", ["email"])
                        .then(function (result) {

                            $scope.modal.hide();
                            console.log(JSON.stringify(result));
                            alert("SUCCESS: " + JSON.stringify(result));
                            AuthFactory.setKey("FacebookLoginSuccess");

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
                alert("Check the name");
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
                $scope.status = "search for Stores";
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