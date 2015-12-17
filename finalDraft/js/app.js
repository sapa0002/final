// Ionic Starter App


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

                StatusBar.styleDefault();
            }
        });
  }])

.config(['$stateProvider', '$urlRouterProvider', 'localStorageServiceProvider', '$httpProvider',
    function ($stateProvider, $urlRouterProvider, localStorageServiceProvider, $httpProvider) {



        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';

        localStorageServiceProvider.setPrefix('sapa');

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