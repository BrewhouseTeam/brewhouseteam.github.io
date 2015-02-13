---
layout:    post
title:     "Ember vs Angular: Authentication Example"
author:    "godfrey"
category:  blog
date:      2015-02-12 10:00
published: true
tags:
- emberjs
- javascript
- integration
- single page application
---

<div class="callout callout-info">
  <h4>Shameless Plug</h4>
  <p>I'll be <a href="http://emberconf.com/speakers.html#gchan" target="_blank">speaking at EmberConf</a>
  next month, hope to see you there!</p>
</div>

A while back, Gabe showed us an approach to [handling authentications in AngularJS](http://brewhouse.io/blog/2014/12/09/authentication-made-simple-in-single-page-angularjs-applications.html).
This is a good opportunity to compare the similarity and differences between [AngularJS](https://angularjs.org/)
and [Ember.js](http://emberjs.com/), so in this blog post, we will look at how
you would achieve the same thing with Ember.js.

It is worth mentioning that there are plenty of [plugins](https://github.com/simplabs/ember-simple-auth)
and [tutorials](http://www.embercasts.com/episodes/client-side-authentication-part-1)
on the same topic in the Ember world. However, for comparison's sake, let's
build this example from scratch.

<!-- break -->

## The task

Similar to Gabe's example, we will be building a single page app that hosts a
mix of public and protected content. When the user tries to access a protected
page, the app should present a login screen. Just like the Angular counterpart,
the server might choose to reject the authentication anytime (e.g. expired
session), in which case the app should present the login screen and ask the user
for their credentials again.

In addition, we will also handle a basic authorization scenario where one of the
protected pages can only be accessed by admin users. On top of all that, we will
be a good citizen on the web and ensure our URLs and browser history works
correctly throughout the app (e.g. the back button, bookmarking, opening links
in new tab, sharing links to specific pages should all work as expected).

Finally, to keep things simple, we will opt for regular transitions instead of
modal dialogs.

The completed app is available on as a [JS bin](http://emberjs.jsbin.com/cisufu),
so go ahead and poke around!

Alternatively, you can also access the code on [Github](https://github.com/BrewhouseTeam/ember-auth-example).
The Github version uses [Ember CLI](https://ember-cli.com) so there are some
minor differences in syntax and code organization. It also comes with a complete
[test suite](https://github.com/BrewhouseTeam/ember-auth-example/tree/master/tests),
so be sure to check that out!

## Step 1: Building the API client

For our app to work, we will need an API that supports the following operations:

* An endpoint to authenticate users by their credentials, in exchange for a
  session token. (e.g. a `POST` request to `/session` with the user's username
  and password.)

* An endpoint to access a public resource. (e.g. a `GET` request to `/public`)

* An endpoint to access a protected resource that is only available when
  authenticated. (e.g. a `GET` request to `/protected` with a valid session
  token)

* An endpoint to access the admin-only resource. (e.g. a `GET` request to
  `/secret` with an appropriate session token)

* An endpoint to explicitly destroy a session (e.g. a `DELETE` request to
  `/session` with a session token)

This should be fairly straight forward to implement with your choice of server-
side technology. For our purpose, we will mock it out with the [Pretender](https://github.com/trek/pretender)
library:

{% highlight js %}
// mock-server.js

var server = new Pretender(function() {

  this.post('/session', function(request) {
    switch(request.requestBody) {
      case 'username=admin&password=secret':
        return [201, {'Content-Type': 'application/json'}, '{"token":"admin","user":{"role":"admin","name":"Administrator"}}'];

      case 'username=user&password=secret':
        return [201, {'Content-Type': 'application/json'}, '{"token":"user","user":{"role":"user","name":"User"}}'];

      default:
        return [401, {}, 'Incorrect username/password'];
    }
  });

  this.delete('/session', function() {
    return [200, {}, 'You are logged out'];
  });

  this.get('/public', function() {
    return [200, {}, 'Lorem ipsum dolor sit amet'];
  });

  this.get('/protected', function(request) {
    switch (request.requestHeaders['Authorization']) {
      case 'Token token=user':
      case 'Token token=admin':
        return [200, {}, 'Since you can see this, you must be logged in!'];

      case 'Token token=expired':
        return [401, {}, 'Your session has expired'];

      default:
        return [401, {}, 'Please login to access this page'];
    }
  });

  this.get('/secret', function(request) {
    switch (request.requestHeaders['Authorization']) {
      case 'Token token=user':
        return [403, {}, 'You are not allowed to access this page'];

      case 'Token token=admin':
        return [200, {}, 'Since you can see this, you must be an admin!'];

      case 'Token token=expired':
        return [401, {}, 'Your session has expired'];

      default:
        return [401, {}, 'Please login to access this page'];
    }
  });

});
{% endhighlight %}

To access this API, we will write a simple API client for it:

{% highlight js %}
// api.js

var API = {

  token: null,

  login: function(username, password) {
    var self = this;

    var payload = {
      username: username,
      password: password
    };

    var deferred = jQuery.post('/session', payload).then(
      function(data) {
        self.token = data.token;
        return data.user;
      },
      function(error) {
        return { status: error.statusText, message: error.responseText };
      }
    );

    return Ember.RSVP.resolve(deferred);
  },

  logout: function() {
    var self = this;

    var settings = { type: 'DELETE', headers: { 'Authorization': 'Token token=' + this.token } };

    var deferred = jQuery.ajax('/session', settings).then(function() {
      self.token = null;
    });

    return Ember.RSVP.resolve(deferred);
  },

  get: function(resource) {
    var url = '/' + resource;

    var settings;

    if (this.token) {
      settings = { headers: { 'Authorization': 'Token token=' + this.token } };
    } else {
      settings = {};
    }

    var deferred = jQuery.ajax(url, settings).then(null, function(error) {
      return { status: error.statusText, message: error.responseText };
    });

    return Ember.RSVP.resolve(deferred);
  }

};
{% endhighlight %}

Nothing too exciting so far (and none of these are specific to Ember.js). The
only thing worth mentioning is that we are turning jQuery's [deferred objects](http://api.jquery.com/category/deferred-object/)
into "real" [Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)
via [RSVP.js](https://github.com/tildeio/rsvp.js/), which happens to be one of
Ember's dependencies.

[Try it out on JS Bin](http://emberjs.jsbin.com/siwawo/edit)

[View the diff on Github](https://github.com/BrewhouseTeam/ember-auth-example/compare/initial...step-1)

## Step 2: Adding the index page

Now that we have the API client figured out, we can move on to setting up our
Ember app and a simple index page. This will be the page that greets our users
when they first visit our app. From here, we will link to the different sections
of our app.

{% highlight js %}
// app.js

App = Ember.Application.create();
{% endhighlight %}

{% highlight html+handlebars %}
{% raw %}
{{!-- templates/appliction.hbs --}}
<h2>Ember.js Authentication Example</h2>

{{outlet}}
{% endraw %}
{% endhighlight %}

{% highlight html+handlebars %}
{% raw %}
{{!-- templates/index.hbs --}}
<p>Public Page</p>
<p>Protected Page</p>
<p>Admin-only Page</p>
{% endraw %}
{% endhighlight %}

Here, we have a bare-bone Ember app setup with a simple app-wide layout (the
template called "application" will be rendered on every page, and the page's
template will be inserted into the `{% raw %}{{outlet}}{% endraw %}`
placeholder). If you are familiar with Rails, you can think of `application.hbs`
as the application's "layout", where `{% raw %}{{outlet}}{% endraw %}` is
analogous to `<%= yield %>`.

[Try it out on JS Bin](http://emberjs.jsbin.com/nehana)

[View the diff on Github](https://github.com/BrewhouseTeam/ember-auth-example/compare/step-1...step-2)

When you launch the app in your browser, you should see the index template being
rendered. Clicking on the links doesn't do anything yet, though, so let's fix
it!

## Step 3: Adding the public page

To render the public page, we want to call `API.get('public');` to fetch the
data we need to populate the page. Because we don't need to authenticate with
the server, this is pretty straight forward:

{% highlight js %}
// router.js

App.Router.map(function() {
  this.route('public');
});
{% endhighlight %}

{% highlight js %}
// routes/public.js

App.PublicRoute = Ember.Route.extend({
  model: function() {
    return API.get('public');
  }
});
{% endhighlight %}

{% highlight html+handlebars %}
{% raw %}
{{!-- templates/index.hbs --}}
<p>{{#link-to "public"}}Public Page{{/link-to}}</p>
<p>Protected Page</p>
<p>Admin-only Page</p>
{% endraw %}
{% endhighlight %}

{% highlight html+handlebars %}
{% raw %}
{{!-- templates/public.hbs --}}
<h4>Public Page</h4>

<div id="content">{{content}}</div>

<p>{{#link-to "index"}}Go back{{/link-to}}</p>
{% endraw %}
{% endhighlight %}

By returning a Promise in our route (which is what `API.get` returns), the Ember
router is smart enough to wait for it to resolve (or reject) before attempting
to render the page. This architecture spares us from having to worry about the
async nature of the data-fetching operations, so we can simply refer to the data
returned by the server in our template.

[Try it out on JS Bin](http://emberjs.jsbin.com/tedufu)

[View the diff on Github](https://github.com/BrewhouseTeam/ember-auth-example/compare/step-2...step-3)

If you refresh the app in the browser, you should now be able to go back and
forth between the index page and the public page (either by clicking the links,
using the back/forward buttons in your browser, or even modifying the URL in the
address bar directly).

## Step 4: Adding the protected page

With the public page fully functioning, we will move on to tackling the
protected page.

{% highlight js %}
// router.js

App.Router.map(function() {
  this.route('public');
  this.route('protected');
});
{% endhighlight %}

{% highlight js %}
// routes/protected.js

App.ProtectedRoute = Ember.Route.extend({
  model: function() {
    return API.get('protected');
  }
});
{% endhighlight %}

{% highlight html+handlebars %}
{% raw %}
{{!-- templates/index.hbs --}}
<p>{{#link-to "public"}}Public Page{{/link-to}}</p>
<p>{{#link-to "protected"}}Protected Page{{/link-to}}</p>
<p>Admin-only Page</p>
{% endraw %}
{% endhighlight %}

{% highlight html+handlebars %}
{% raw %}
{{!-- templates/protected.hbs --}}
<h4>Protected Page</h4>

<div id="content">{{content}}</div>

<p>{{#link-to "index"}}Go back{{/link-to}}</p>
{% endraw %}
{% endhighlight %}

{% highlight html+handlebars %}
{% raw %}
{{!-- templates/error.hbs --}}
<h4>An error has occured!</h4>

{{#if message}}
  <div id="content">{{message}}</div>
{{else}}
  <div id="content">Unknown Error</div>
{{/if}}

<p>{{#link-to "index"}}Go back{{/link-to}}</p>
{% endraw %}
{% endhighlight %}

[Try it out on JS Bin](http://emberjs.jsbin.com/yaluho)

[View the diff on Github](https://github.com/BrewhouseTeam/ember-auth-example/compare/step-3...step-4)

If you tried clicking on the link to the protected page, you will see that
Ember is rendering the `error` template with the error message returned by the
server ("Please login to access this page"). As we haven't authenticate with the
API yet, this is what we would expect. However, how does Ember know to render
the `error` template instead of the `protected` template?

You might have guessed it – Promises! When the server refuses to process our
request, our API client will reject the returned promise. Because Ember's router
is Promise-aware, it will know that a rejected Promise means that something has
gone wrong. When this happens, it will abort the original transition (from the
`index` route into the`protected` route) and transition into the special `error`
route instead.

This in turns causes the `error` template to be rendered with the rejection
reason being the route's model, which is why we have access to the error's
`message` from the template.

## Step 5: Adding a login page

Since we don't have the UI to authenticate with the API yet, we still haven't
seen the fully-functional protected page. Let's add that next!

{% highlight js %}
// router.js

App.Router.map(function() {
  this.route('login');
  this.route('public');
  this.route('protected');
});
{% endhighlight %}

{% highlight js %}
// routes/login.js

App.LoginRoute = Ember.Route.extend({
  actions: {
    submit: function() {
      var route = this, controller = this.get('controller');

      var username = controller.get('username'),
          password = controller.get('password');

      controller.set('message', null);

      API.login(username, password).then(
        function(user) {
          route.transitionTo('index');
        },
        function(error) {
          controller.set('message', error.message);
        }
      );
    },

    cancel: function() {
      this.transitionTo('index');
    }
  },

  resetController: function(controller) {
    controller.setProperties({
      username: null,
      password: null,
      message:  null
    });
  }
});
{% endhighlight %}

{% highlight html+handlebars %}
{% raw %}
{{!-- templates/appliction.hbs --}}
<h2>Ember.js Authentication Example</h2>

{{outlet}}

<p>{{#link-to "login" tagName="button"}}Login{{/link-to}}</p>
{% endraw %}
{% endhighlight %}

{% highlight html+handlebars %}
{% raw %}
{{!-- templates/login.hbs --}}
<h4>Please login</h4>

{{#if message}}
  <div id="content">{{message}}</div>
{{/if}}

<p>
  <small>
    To login as a user, use <code>user</code> / <code>secret</code>;<br>
    to login as an admin, use <code>admin</code> / <code>secret</code>.
  </small>
</p>

<p>Username: {{input name="username" value=username}}</p>
<p>Password: {{input type="password" name="password" value=password}}</p>

<p>
  <button {{action "submit"}}>Submit</button>
  <button {{action "cancel"}}>Cancel</button>
</p>
{% endraw %}
{% endhighlight %}

We did quite a lot here, so let's break it down.

First, we added a `login` route to the router. Just like you would expect,
visiting the `/login` URL would enter this route and render the `login`
template. Nothing new so far.

In the `login` template, we added some markup for a simple form, with input
fields for the username and password. The value for these input fields are bound
to the controller's `username` and `password` properties, which would come in
handy later. (For the purpose of understanding this example, you Angular folks
might find it helpful to think of the controller as the template's `$scope`.)

Below the form, we have two buttons that would trigger the `submit` and `cancel`
actions, respectively, which will be handled in `LoginRoute` and invoke the
appropriately named functions.

For the `submit` action, we simply extract the values for the username and
password from the controller and pass them to `API.login`. If the authentication
is successful (i.e. the Promise resolves), then we would redirect the user back
to the index page; otherwise, we will extract the server's response and display
it in the template.

(If you are curious about the `resetController` hook we implemented, it simply
clears out the values in the login form when transitioning away from the login
page.)

Finally, we added a link to the login page. This time, we added the link to the
`application` template (the "layout"), so it will always visible regardless of
where you are in the app. We also told Ember to render a `<button>` tag instead
of the default `<a>` tag, just so we can differentiate it from the rest of the
links on the page.

[Try it out on JS Bin](http://emberjs.jsbin.com/webaya)

[View the diff on Github](https://github.com/BrewhouseTeam/ember-auth-example/compare/step-4...step-5)

With these changes, you can try logging in using the hard-coded credentials (or
use something else to see the error messages in action). Once you are logged in,
you should be able to view the protected page without problems.

## Step 6: Tracking the current user and adding a logout button

If you have played with the demo from the last step, you might find the user
experience quite confusing – there are no visual indicatiors to tell the user
that the login process was successful. The "Login" button is also always visible
on the bottom of the page, even after logging in, making it impossible for the
user to infer the state of the system. Ideally, we would like to know if the
user is already logged in, and display a "Logout" button instead. We will work
on addressing this next:

{% highlight js %}
// initializers/inject-session.js

// Register an observable "session" object for tracking current user, etc
App.register('service:session', Ember.Object);

// Make the session object available to all routes and controller
App.inject('route', 'session', 'service:session');
App.inject('controller', 'session', 'service:session');
{% endhighlight %}

{% highlight js %}
// routes/application.js

App.ApplicationRoute = Ember.Route.extend({
  actions: {
    logout: function() {
      var route = this;

      API.logout().then(function() {
        route.session.set('user', null);
        route.transitionTo('index');
      });
    }
  }
});
{% endhighlight %}

{% highlight js %}
// routes/login.js

App.LoginRoute = Ember.Route.extend({
  actions: {
    submit: function() {
      var route = this, controller = this.get('controller');

      var username = controller.get('username'),
          password = controller.get('password');

      controller.set('message', null);

      API.login(username, password).then(
        function(user) {
          route.session.set('user', user);
          route.transitionTo('index');
        },
        function(error) {
          controller.set('message', error.message);
        }
      );
    },

    // ...
  },

  // ...
});
{% endhighlight %}

{% highlight html+handlebars %}
{% raw %}
{{!-- templates/appliction.hbs --}}
<h2>Ember.js Authentication Example</h2>

{{outlet}}

{{#if session.user}}
  <p><button {{action "logout"}}>Logout</button></p>
{{else}}
  <p>{{#link-to "login" tagName="button"}}Login{{/link-to}}</p>
{{/if}}
{% endraw %}
{% endhighlight %}

{% highlight html+handlebars %}
{% raw %}
{{!-- templates/index.hbs --}}
{{#if session.user}}
  <h4>You are logged in as {{session.user.name}}</h4>
{{/if}}

<p>{{#link-to "public"}}Public Page{{/link-to}}</p>
<p>{{#link-to "protected"}}Protected Page{{/link-to}}</p>
<p>Admin-only Page</p>
{% endraw %}
{% endhighlight %}

First, we introduced the concept of a shared `session` object and made it
available to all controllers and routes in our app. This is where we will keep
"transient" states of our app. As these things are only kept in memory for as
long as our app is open, this is ideal for tracking the "current user" and
similar states. We made it an `Ember.Object` so that its values can be observed
and bound in templates, but otherwise it behaves just like a "plain-old
JavaScript object" (i.e. `{}`) for our purpose.

We then modified our `submit` action in the `LoginRoute` to store the `user`
object returned by the server in the `session` object upon a successful login.

Because we made the `session` object available to all controllers, we can now
access its content in the templates as well. (For you angular developers,
imagine we have added the `session` object to the root scope.) With that, we
modified the `application` template to conditionally show a "Login" or "Logout"
button depending on whether the user has logged in or not. We also added a
simple greeting in the `index` template to remind our users who (the system
thinks) they are.

Finally, since the "Logout" button can be clicked from anywhere in our app, we
introduced an `ApplicationRoute` to handle the `logout` action. Just like
templates, routes in Ember can be nested. We won't get into the details here,
but in a nut shell, the `ApplicationRoute` is always active (just like how the
`application` template is always rendered), making it the ideal place to handle
global actions like these. The implementation of the action handler itself is
fairly simple – we just call `API.logout`, set `session.user` back to `null`
and then transition back to the "index" page.

[Try it out on JS Bin](http://emberjs.jsbin.com/mayuwa)

[View the diff on Github](https://github.com/BrewhouseTeam/ember-auth-example/compare/step-5...step-6a)

This is one more minor issue – because the "Login" button is rendered in the
`application` template (the "layout"), it will be visible from the login page as
well, which made things quite confusing. Fortunately, this is very easy to fix.
Since we implemented the "Login" button using the `{{link-to}}` helper, Ember
will automatically add an `active` CSS class to the button when the link is
active (i.e. we are already on the page that the link is supposed to bring us
to). This makes it trivial to hide the "Login" button on the login page with
just a few lines of CSS:

{% highlight css %}
/* app.css */

button.active {
  display: none;
}
{% endhighlight %}

[Try it out on JS Bin](http://emberjs.jsbin.com/legiyo)

[View the diff on Github](https://github.com/BrewhouseTeam/ember-auth-example/compare/step-6a...step-6b)

## Step 7: Revisiting the protected page

With our login flow working properly, we can shift our attention back to the
protected page. Remember how when you visited the protected page without being
logged in, it would just show the error page? Since we know what the user need
to do to resolve the problem (by logging in), wouldn't it be great if we just
redirect them straight to the login page? Better yet, it would be fantastic if
we remember where the user came from, so that we can redirect them back to the
same page upon a successful login. Let's get to work!

{% highlight js %}
// routes/application.js

App.ApplicationRoute = Ember.Route.extend({
  actions: {
    logout: function() {
      // ...
    },

    error: function(error, transition) {
      if (error.status === 'Unauthorized') {
        var loginController = this.controllerFor('login');

        loginController.setProperties({
          message: error.message,
          transition: transition
        });

        this.transitionTo('login');
      } else {
        // Allow other error to bubble
        return true;
      }
    }
  }
});
{% endhighlight %}

{% highlight js %}
// routes/login.js

App.LoginRoute = Ember.Route.extend({
  actions: {
    submit: function() {
      var route = this, controller = this.get('controller');

      var username = controller.get('username'),
          password = controller.get('password');

      controller.set('message', null);

      API.login(username, password).then(
        function(user) {
          var transition = controller.get('transition');

          route.session.set('user', user);

          if (transition) {
            transition.retry();
          } else {
            route.transitionTo('index');
          }
        },
        function(error) {
          controller.set('message', error.message);
        }
      );
    },

    // ...
  },

  resetController: function(controller) {
    controller.setProperties({
      username:   null,
      password:   null,
      message:    null,
      transition: null
    });
  }
});
{% endhighlight %}

{% highlight js %}
// controllers/login.js

App.LoginController = Ember.Controller.extend();
{% endhighlight %}

When an error occurs during a route transition (e.g. a Promise was rejected),
the Ember router will first invoke the `error` action handler, offering you a
chance to handle that gracefully before transitioning into the `error` page.

This is exactly what we want to do here. We added a handler for the `error`
action to the top-level `ApplicationRoute`. From within the handler, we look for
a specific type of error (an error with the "Unauthorized" HTTP status returned
by the server). If we found what we are looking for, we capture the error
message and the current transition so that we can retry it later. Otherwise, we
`return true` to let the action continue to bubble up to the default handler,
which would send the user to the error page.

Upon completing a successful login from our `LoginRoute`, we check if we have a
saved transition from earlier (via the `error` handler we just implemented). If
we found one, we will retry the same transition (which should work now that the
user is logged in). Otherwise, we transition to the "index" page like we did
before.

[Try it out on JS Bin](http://emberjs.jsbin.com/recatu)

[View the diff on Github](https://github.com/BrewhouseTeam/ember-auth-example/compare/step-6b...step-7a)

If you are paying close attention, there is a minor hiccup here. So far we
haven't had to define any controllers ourselves. This is because we didn't need
to do much with them, so Ember could just infer what we need and generate them
automatically *when the route is first entered*. However, with our changes to
the `ApplicationRoute`, we would need to access the controller before the
`login` route has been entered.

In this case, Ember won't be able to infer the type of controller we need (there
are different kinds of controllers in Ember), so we will need to explicitly
define it. Since we only need the basic functionality, our `LoginController`
will just extend from the `Ember.Controller` base class.

There is one more improvement we can make to the protected page. Currently, if
the user is not logged in, we will still make an API request to the server, just
to show an error message on the login page. With the session object, we can now
eagerly predict this outcome and avoid that wasteful roundtrip:

{% highlight js %}
// routes/protected.js

App.ProtectedRoute = Ember.Route.extend({
  beforeModel: function() {
    if (!this.session.get('user')) {
      return Ember.RSVP.reject({ status: 'Unauthorized', message: 'Please login to access this page' });
    }
  },

  model: function() {
    return API.get("protected");
  }
});
{% endhighlight %}

All we need to do here is to check if we have a `session.user`. If not, we can
immediately return a rejected Promise just like the `API` would. That way, our
existing `error` handler would Just Work™ without any changes.

[Try it out on JS Bin](http://emberjs.jsbin.com/tiwapa)

[View the diff on Github](https://github.com/BrewhouseTeam/ember-auth-example/compare/step-7a...step-7b)

## Step 8: Adding the admin-only page

Our last task is to add the super-secret, admin-only page.

{% highlight js %}
// router.js

Router.map(function() {
  this.route('login');
  this.route('public');
  this.route('protected');
  this.route('secret');
});
{% endhighlight %}

{% highlight js %}
// routes/secret.js

App.SecretRoute = Ember.Route.extend({
  beforeModel: function() {
    if (!this.session.get('user')) {
      return Ember.RSVP.reject({ status: 'Unauthorized', message: 'Please login to access this page' });
    } else if (this.session.get('user.role') !== 'admin') {
      return Ember.RSVP.reject({ status: 'Forbidden', message: 'You are not allowed to access this page' });
    }
  },

  model: function() {
    return API.get('secret');
  }
});
{% endhighlight %}

{% highlight html+handlebars %}
{% raw %}
{{!-- templates/index.hbs --}}
{{#if session.user}}
  <h4>You are logged in as {{session.user.name}}</h4>
{{/if}}

<p>{{#link-to "public"}}Public Page{{/link-to}}</p>
<p>{{#link-to "protected"}}Protected Page{{/link-to}}</p>
<p>{{#link-to "secret"}}Admin-only Page{{/link-to}}</p>
{% endraw %}
{% endhighlight %}

{% highlight html+handlebars %}
{% raw %}
{{!-- templates/secret.hbs --}}
<h4>Admin-only Page</h4>

<div id="content">{{content}}</div>

<p>{{#link-to "index"}}Go back{{/link-to}}</p>
{% endraw %}
{% endhighlight %}

As you can see, this was quite easy to do; we didn't really introduce any new
concepts here. We defined a route and the corresponding template, then updated
our index to link to it.

Just like the `ProtectedRoute`, we took advantage of our domain knowledge (this
page is only for admin users) and duplicated the access control checks on the
client, which allowed us to quickly respond without involving the server. This
is an entirely an optional optimization of course – everything would still work
the same way if we removed that check, just a little bit slower.

[Try it out on JS Bin](http://emberjs.jsbin.com/nobizu)

[View the diff on Github](https://github.com/BrewhouseTeam/ember-auth-example/compare/step-7b...step-8)

## Step 9: Handling expired sessions

There is one more missing piece before we wrap up – I promised that we will
handled expired sessions, so I guess we still need to implement that. But what
if I tell you we already did? ;)

Upon encountering an expired session token, our well-mannered sever is going to
respond with a "401 Unauthorized" error. This happens to be the same error it
sends when the user didn't login at all (if you think about it, they are really
the same thing as far as the server is concerned). This is great, because our
app already knows how to handle it – by redirecting the user to the login page –
which is also exactly what we want here.

To see it in action, we will add a button to simulate this scenario:

{% highlight js %}
// routes/application.js

App.ApplicationRoute = Ember.Route.extend({
  actions: {
    // ...

    expireSession: function() {
      API.token = 'expired';
    },

    // ...
  },

  // ...
});
{% endhighlight %}

{% highlight html+handlebars %}
{% raw %}
{{!-- templates/application.hbs --}}
<h2>Ember.js Authentication Example</h2>

{{outlet}}

{{#if session.user}}
  <p><button {{action "logout"}}>Logout</button></p>
  <p><button {{action "expireSession"}}>Force session expiration</button></p>
{{else}}
  <p>{{#link-to "login" tagName="button"}}Login{{/link-to}}</p>
{{/if}}
{% endraw %}
{% endhighlight %}

We are simulating the expiration of a session by changing our session token to
`expired`, and our mock server will take care of the rest.

[Try it out on JS Bin](http://emberjs.jsbin.com/zedeju)

[View the diff on Github](https://github.com/BrewhouseTeam/ember-auth-example/compare/step-8...step-9a)

We have now introduced a scenario where a user can end up on the login page even
when `session.user` isn't `null`. If the user clicks "Cancel", they will be
redirected to the index page and the app will still behave as if they are logged
in (showing the "Logout" button, etc). This does not pose any security risk
(because the server will keep refusing to serve any content and the user will
just keep hitting the login page), but it would nevertheless make some pretty
confusing user experience.

To address this, we will make sure we clear the authentication information when
the login route is entered:

{% highlight javascript %}
// routes/login.js

App.LoginRoute = Ember.Route.extend({
  // ...

  beforeModel: function() {
    API.token = null;
    this.session.set('user', null);
  },

  // ...
});
{% endhighlight %}

With that, our job is finally done!

[Try it out on JS Bin](http://emberjs.jsbin.com/cisufu)

[View the diff on Github](https://github.com/BrewhouseTeam/ember-auth-example/compare/step-9a...step-9b)

## Wrapping up

It's time to take a deep breath and relax a little bit. We have come a *long*
way, and you have learned a lot.

It might *seem* like a lot of code, but it was actually less than 100 lines of
JavaScript if we exclude the API and comments. In terms of features though, we
definitely did a lot – we wrote a multi "page" JavaScript app that works with
a remote server, handles authentication/authorization, errors, URLs, browser
history and more. We even redirected to the right page after a successful login!

While most front-end JavaScript frameworks/libraries focuses on a nice API for
individual *widgets* (components) on the page (which is important, and arguably
the most common use case!), Ember really shines when it comes to tying these
small pieces together for building full-fleged *applications* (Ember does
widgets/components too, but that would be another blog post!).

I hope this tutorial gives you a taste of the power of the Promise-based Ember
router and how it helps you to build your applications "flow" with minimal
effort – we are barely scratching the surface here.

Ember.js *Promises* to make writing *ambitious* client-side applications easy.
*Ambitious* is the key here – if you are just looking for a quick widgets
libraries or something to help build a mini app, you might find that there are,
by comparison, more concepts and patterns to learn. But once you get past the
learning... *cliff*, you can be *really* productive in Ember! (Be sure to check
out how [Ember CLI helps you tie these pieces together, too](https://github.com/BrewhouseTeam/ember-auth-example)!)

### Hire Us!

Interested in Ember.js training? Need help building your next *ambitious* web
application? [Get in touch](http://brewhouse.io/#hire-us)!

P.S. If you are in Vancouver, join us at our regular [Ember meetups](http://meetup.com/Vancouver-Ember-js/)!
