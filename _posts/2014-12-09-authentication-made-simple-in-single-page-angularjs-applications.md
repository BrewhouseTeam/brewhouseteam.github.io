---
layout: post
title: "Authentication made simple in Single Page AngularJS Applications"
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

The following is a login pattern that I've been using in all of my single page AngularJS applications (SPA). We recently introduced it into a client project at Brewhouse, so I thought I would share.

Login on an SPA can be tough and it's important that your integration doesn't interfere with the flow of your application. It can become a crutch if you're not really sure whether the user is
authenticated and resorting to explicit checks all over the place. Here we lay the groundwork for a login modal that is called implicitly only when it's needed, without almost any knowledge from the rest of the application.


<!-- break -->

## The conditions

There are only three points in the application where the login modal should appear:

1. When I'm on a welcome page and I click "Login".
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
    .state('welcome', {
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

As you can see, if the route requires a login and `$rootScope.currentUser` is not yet set, we will prevent the attempted state change and show the modal. (I prefer to attach the `currentUser` to the `$rootScope` only because it's an application-wide
concept. All new scopes will inherit the `currentUser` property and I can always call it from the view. Whether or not you choose to do the same is for another discussion.)

Additionally, it should be noted that I won't be covering how you might store or retrieve the `currentUser` between page refreshes.

## Building the loginModal service

In this post, I will wrap the [AngularUI Bootstrap Modal](http://angular-ui.github.io/bootstrap/#/modal); however, you can use any modal library - I have even used the same pattern in an [ionic](http://ionicframework.com/) app
with the `$ionicModal` service. An important caveat here is that we must be able to tell the modal what to do after authentication is successful or cancelled. Preferably this is done with a promise, so that
multiple actions can be chained together. These are anonymous functions that we will use to re-submit state changes and requests after authenticating. The following is a example of how I might write such a wrapper for the `$modal` service.

{% highlight js %}
// loginModal.js

app.service('loginModal', function ($modal, $rootScope) {

  function assignCurrentUser (user) {
    $rootScope.currentUser = user;
    return user;
  }

  return function() {
    var instance = $modal.open({
      templateUrl: 'views/loginModalTemplate.html',
      controller: 'LoginModalCtrl',
      controllerAs: 'LoginModalCtrl'
    })

    return instance.result.then(assignCurrentUser);
  };

});
{% endhighlight %}

There isn't much magic in this service. It's important to point out that `$modal.open` returns a promise which is either resolved or rejected when the modal is closed or dismissed. When a scope is instantiated for the
`LoginModalCtrl`, the `$close()` and `$dismiss()` methods are attached to it.

{% highlight js %}
// LoginModalCtrl.js

app.controller('LoginModalCtrl', function ($scope, UsersApi) {

  this.cancel = $scope.$dismiss;

  this.submit = function (email, password) {
    UsersApi.login(email, password).then(function (user) {
      $scope.$close(user);
    });
  };

});
{% endhighlight %}

After a successful login, the modal is closed, the `$rootScope.currentUser` is set, and the on success action will be triggered. If the user clicks the cancel button or attempts to click away from the modal, the on cancel action will step in.

## Checking in with the state change

At this point the `loginModal` can be added to the event listener. What makes this approach so slick is being able to capture the desired state transitions in anonymous functions. After authenticating, the SPA will implicitly redirect to the requested state as you would expect with a traditional web app. Additionally, notice how we will redirect to the welcome screen if a dismissal happens.

{% highlight js %}
// app.js

app.run(function ($rootScope, $state, loginModal) {

  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
    var requireLogin = toState.data.requireLogin;

    if (requireLogin && typeof $rootScope.currentUser === 'undefined') {
      event.preventDefault();

      loginModal()
        .then(function () {
          return $state.go(toState.name, toParams);
        })
        .catch(function () {
          return $state.go('welcome');
        });
    }
  });

});
{% endhighlight %}

## Handling unauthorized requests

Storing a `currentUser` on the client for the lifetime of an SPA is not without its challenges. Data that is persisted in memory may become out of sync with the server and a `401` will mean your client-side authentication
is no longer valid. Perhaps the session has expired or perhaps you were never logged in to begin with. This is obviously a good time to capture the request params and show the login modal.

AngularJS makes _intercepting_ incoming responses pretty easy with _interceptors_. Below we call the login modal when we receive a `401` response. (For the sake of brevity, we'll assume that a `401` is the only precondition required to verify that a user is not logged in.)

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
        if (rejection.status !== 401) {
          return rejection;
        }

        var deferred = $q.defer();

        loginModal()
          .then(function () {
            deferred.resolve( $http(rejection.config) );
          })
          .catch(function () {
            $state.go('welcome');
            deferred.reject(rejection);
          });

        return deferred.promise;
      }
    };
  });

});
{% endhighlight %}

With this code, a `401` rejected request will be re-submitted when a successful authentication occurs. In fact, the entity that made the original request will hang until our secondary request is completed. It's completely oblivious to the fact that the original request was even rejected!

## Conclusions

If you're not totally [jacked up](http://media.giphy.com/media/sWBOpINwXnW7K/giphy.gif) right now, I feel bad for you. The modal is so clean and separated. It's effectively a black box. What more could you want? The use of anonymous callbacks to capture the user's intent is key to this approach. With very little code we've integrated a login modal that is almost completely detatched from the rest of our application, helping to minimize the number of moving parts required for authentication.

Please let us know what you think. Do you have suggestions for how this could be improved further? [Tweet at me](http://twitter.com/gabescholz) or [at us](http://twitter.com/BrewhouseTeam) or leave a comment below.

Special thanks to Godfrey Chan, Philippe Creux and Lana Topham for leaving feedback during the drafting of this post.

#### Edit: December 29, 2014

As per a few requests, here is what a simple `views/loginModalTemplate.html` might look like. I hope it helps to answer some questions.

{% highlight html %}
<!-- views/loginModalTemplate.html -->

<div>
  <form ng-submit="LoginModalCtrl.submit(_email, _password)">
    <input type="email" ng-model="_email" />
    <input type="password" ng-model="_password" />
    <button>Submit</button>
  </form>
  <button ng-click="LoginModalCtrl.cancel()">Cancel</button>
</div>
{% endhighlight %}

#### Edit: Feburary 12, 2015

Godfrey did a write-up about [implemented the same thing using Ember.js](http://brewhouse.io/blog/2015/02/12/ember-vs-angular-authentication)
to help compare the two frameworks. If you enjoyed this blog post, you might
like that too!
