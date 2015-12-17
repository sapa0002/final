angular.module('starter.services', [])


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
                    deferred.notify("STORES... " + search);
                    var url = 'http://api.bestbuy.com/v1/stores(city=' + search + ')?format=json&apiKey=' + bestKey;
                    $http.get(url).then(function (response) {
                            Logger.debug("Stores", JSON.stringify(response));
                            storeList = response.data.stores;
                            deferred.resolve(storeList);
                        },
                        function (err) {
                            Logger.error("Error", JSON.stringify(err));
                            deferred.reject("ERROR");
                        });
                } else {
                    var posOptions = {
                        timeout: 1000,
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
                                    Logger.debug("Stores...", JSON.stringify(response));
                                    storeList = response.data.stores;
                                    deferred.resolve(storeList);
                                },
                                function (err) {
                                    Logger.error("No storelists", JSON.stringify(err));
                                    deferred.reject("No storelists");
                                });
                        }, function (err) {
                            Logger.error("No location is available", JSON.stringify(err));
                            deferred.reject("No location is available");
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
                    alert("check username or password");
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



.factory('Logger', ['localStorageService',
    function (localStorageService) {

        var storage;

        if (localStorageService.get("storage")) {
            storage = localStorageService.get("storage");
        } else {
            storage = [];
        }

        if (!localStorageService.get("counter")) {

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