---
layout: post
title: "Seamlessly Integrating a Login Modal into an AngularJS Application"
author: "gabe"
category: blog
date: 2014-12-09 8:00
published: true
tags:
  - angularjs
  - modal
  - javascript
  - integration
  - single page application
shared_square_image:
shared_description: How you integrate features such as a login modal are important so that they don't become a crutch in your application.
---

The following is a login pattern that I've been using in all of my single-page, AngularJS applications (SPAA). We recently introduced it into a client project at Brewhouse, so I thought I would share.

Login on an SPAA can be tough and it's important that your integration doesn't interfere with the flow of your application. It can become a crutch if you're not really sure whether the user is
authenticated and resorting to explicit checks all over the place. Here we lay the groundwork for a login modal that is called implicitly only when it's needed, without any knowledge from the rest of the application.


<!-- break -->

## The conditions

There are only three points in the application where the login modal button should appear:

1. When I'm on a landing page and I click "Login".
2. When I am not logged in and I attempt to visit a page that requires login, _e.g._ my profile page.
3. When I attempt to make a request that requires a login, _e.g._ my session has expired whilst I'm attempting to post something.

We will ignore the first condition as it is trivial.

## Determining which pages require a logged in user

There are many advantages to using `ui-router` over `ngRoute` and in this case we will be taking advantage of how we can attach additional properties to a route and how those properties will cascade
down to the children of that route. In the following code, we make sure to set a `requireLogin` property for each state.

{% highlight js %}
// routes.js

app.config(function ($stateProvider) {

  $stateProvider
    .state('landing', {
      url: '/welcome',
      // ...
      data: {
        requireLogin: false
      }
    })
    .state('app', {
      abstract: true,
      // ...
      data: {
        requireLogin: true // this property will apply to all children of 'app'
      }
    })
    .state('app.dashboard', {
      // child state of `app`
      // requireLogin === true
    })

});
{% endhighlight %}

Clearly, for routes that do not require a login we set `requireLogin` to false. We could leave this `undefined`, but I prefer to show my intent.

## Capturing attempted state changes

At this point, we can start capturing attempted state changes and inspecting them for our `requireLogin` property. The following shows how we are going to subscribe to `ui-router`'s `$stateChangeStart` event.

{% highlight js %}
// app.js

app.run(function ($rootScope) {

  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
    var requireLogin = toState.data.requireLogin;

    if (requireLogin && typeof $rootScope.currentUser === 'undefined') {
      event.preventDefault();
      // get me a login modal!
    }
  });

});
{% endhighlight %}

As you can see, if the route requires a login and a `$rootScope.currentUser` is not yet set, we will want to show the modal. (I prefer to attach the `currentUser` to the `$rootScope` only because it's an application-wide
concept. All new scopes will inherit the `currentUser` property and I can always call it from the view. Whether or not you choose to do the same is for another discussion).

## Building the loginModal service

In this post, I will wrap the [AngularUI Bootstrap Modal](http://angular-ui.github.io/bootstrap/#/modal); however, you can use any modal library - I have even used the same pattern in an [ionic](http://ionicframework.com/) app
with the `$ionicModal` service. An important caveat here is that we must be able to pass `onSuccess` and `onCancel` callbacks so that the modal does something after authentication is successful or cancelled.
These are anonymous functions that we will use to re-submit state changes and requests after authenticating. The following is a example of how I might write such a wrapper for the `$modal` service.

{% highlight js %}
// loginModal.js

app.service('loginModal', function ($modal) {

  return function(args) {
    var onSuccess = args.onSuccess || function () {};
    var onCancel = args.onCancel || function () {};

    var instance = $modal.open({
      templateUrl: 'views/loginModalTemplate.html',
      controller: 'LoginModalCtrl',
      controllerAs: 'LoginModalCtrl'
    });

    instance.then(onSuccess).catch(onCancel);

    return instance;
  };

});
{% endhighlight %}

There isn't much magic in this service. It's important to point out that `$modal.open` returns a promise which is either resolved or rejected when the modal is closed or dismissed. When a scope is instantiated for the
`LoginModalCtrl`, the `$close()` and `$dismiss()` methods are attached to it.

{% highlight js %}
// LoginModalCtrl.js

app.controller('LoginModalCtrl', function ($scope, $rootScope, UsersApi) {

  this.cancel = $scope.dismiss;

  this.submit = function (email, password) {
    UsersApi.login(email, password).then(function (user) {
      $rootScope.currentUser = user;
      $scope.$close();
    });
  };

});
{% endhighlight %}

In the controller, after a successful login the `$rootScope.currentUser` is set, the modal is closed and the `onSuccess` callback will be triggered.
If the user clicks the cancel button, or attempts to click away from the modal, the `onCancel` callback will step in.

## Checking in with the state change

At this point, the `loginModal` can be added to the event listener. What makes this approach so slick is being able to capture the desired state transitions in anonymous callbacks. After authenticating, the app will implicitly
redirect to the requested state as you would expect with a typical web app. Additionally, notice how we will redirect to the welcome screen if a dismissal happens.

{% highlight js %}
// app.js

app.run(function ($rootScope, $state, loginModal) {

  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
    var requireLogin = toState.data.requireLogin;

    if (requireLogin && typeof $rootScope.currentUser === 'undefined') {
      event.preventDefault();

      loginModal({
        onSuccess: function () {
          return $state.go(toState.name, toParams);
        },
        onCancel: function () {
          return $state.go('welcome');
        }
      });
    }
  });

});
{% endhighlight %}

## Handling unauthorized requests

Storing a `currentUser` on the client for the lifetime of an SPAA is not without it's challenges. Data that is persisted in memory may become out of sync with the server and a `401` will mean your client-side authentication
is no longer valid. Perhaps the session has expired or perhaps you were never logged in to begin with. This is obviously a good time to capture the request params and show the login modal.

AngularJS makes _intercepting_ incoming responses pretty easy with _interceptors_. Below we call the login modal when we receive a `401` response.

{% highlight js %}
// app.js

app.config(function ($httpProvider) {

  $httpProvider.interceptors.push(function ($timeout, $q, $injector) {
    var loginModal, $http, $state;

    // this trick must be done so that we don't receive
    // `Uncaught Error: [$injector:cdep] Circular dependency found`
    $timeout(function () {
      loginModal = $injector.get('loginModal');
      $http = $injector.get('$http');
      $state = $injector.get('$state');
    });

    return {
      responseError: function (rejection) {
        // we will assume that a 401 is the only pre-condition for
        // showing the modal
        if (rejection.status !== 401) {
          return rejection;
        }

        var deferred = $q.defer();

        loginModal({
          onSuccess: function () {
            // on a successful login, re-submit the request!
            $http(rejection.config).then(function (response) {
              deferred.resolve(response);
            });
          },
          onCancel: function () {
            $state.go('welcome');
            deferred.reject(rejection);
          }
        });

        return deferred.promise;
      }
    };
  });

});
{% endhighlight %}

With this code, a `401` rejected request will be re-submitted when a successful authentication occurs. In fact, the entity that made the original request will hang until our secondary request is completed. It's completely oblivious to the fact that the original request was even rejected!

If you're not totally [jacked up](http://media.giphy.com/media/sWBOpINwXnW7K/giphy.gif) right now, I feel bad for you. The modal is so clean. So separated. Effectively a black box. What more could you want?

## Conclusions

The use of anonymous callbacks to capture the user's intent is key to this approach. With very little code we've integrated a login modal that is almost completely detatched from the rest of our application, helping to minimize state and dependencies.

Please let us know what you think. [Tweet at me](http://twitter.com/gabescholz) or [at us](http://twitter.com/BrewhouseTeam) or leave a comment below.
