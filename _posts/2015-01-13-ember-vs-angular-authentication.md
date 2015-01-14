---
layout:    post
title:     "Ember vs Angular: Authentication Example"
author:    "godfrey"
category:  blog
date:      2015-01-13 8:00
published: false
tags:
- emberjs
- javascript
- integration
- single page application
shared_square_image:
shared_description:
---

Last month, Gabe showed us [an approach to handling user authentications in AngularJS applications][angular].
This is a good opportunity to compare the similarity and differences between
AngularJS and Ember.js applications, so this month we will be looking at how
you could achieve similar things using Ember.js.

It is worth mentioning that there are plenty of [plugins][ember-simple-auth] and
[complete tutorials][embercasts] on the same topic in the Ember world. However,
we will be building the feature from scratch for comparison sake.

<!-- break -->

## The task

Similar to Gabe's example, we will be building a single page application that
serves both public content and protected content, where the latter would cause
the applicatino to present a login screen. Just like the AngularJS counterpart,
we will also handle the case where our server rejects the authentication (e.g.
expired session), in which case the application would present the login screen
again.

In addition, we will also handle a basic authorization scenario where only admin
users are allowed to access the resource. On top of all that, we will be a good
citizen on the web and ensure that URLs and history works correctly (e.g. the
back button, bookmarking, opening in new tab, sharing links to specific pages
should all work as expect).

Finally, to keep things simple, we will opt for regular transitions instead of
modal dialogs.

The completed application is available as a [JS bin](jsbin), so go ahead and
poke around! (Open the link in a new window to see the URL changes.)

## The API

We will assume that our API supports the following operations:

* An endpoint to authenticate users with their credentials in exchange for a
  session token. (e.g. a `POST` request to `/login` with the user's username
  and password.)

* An endpoint to access a public resource. (e.g. a `GET` request to `/public`)

* An endpoint to access a protected resource that is only available when
  authenticated. (e.g. a `GET` request to `/protected` with a valid session
  token)

* An endpoint to access an admin-only resource. (e.g. a `GET` request to
  `/secret` with an appropriate session token)

* An endpoint to explicitly destroy a session (e.g. a `POST` request to
  `/logout` with a session token)

A client to access such an API might look like this:

{% highlight js %}
// api.js

API = {

  token: null,

  login: function(username, password) {
    var self = this;

    var payload = {
      username: username,
      password: password
    };

    return jQuery.post("/login", payload).then(
      function(data) {
        self.token = data.token;
        return data.user;
      },
      function(error) {
        return { status: error.statusText, message: error.responseText };
      }
    );
  },

  logout: function() {
    var self = this;

    var settings = { headers: { "Authorization": "Token token=" + this.token } };

    return jQuery.post("/logout", settings).then(function() {
      self.token = null;
    });
  },

  get: function(resource) {
    var url = "/" + resource;

    var settings;

    if (this.token) {
      settings = { headers: { "Authorization": "Token token=" + this.token } };
    } else {
      settings = {};
    }

    return jQuery.ajax(url, settings).fail(function(error) {
      return { status: error.statusText, message: error.responseText };
    });
  }

};
{% end %}

Implementing the server-side component for is left as an exercise for the
reader. For our purpose, we will just simulate the server-side logical locally:

{% highlight js %}
// api.js

API = {

  token: null,

  login: function(username, password) {
    if (username === "admin" && password === "secret") {
      this.token = "admin";
      return Ember.RSVP.resolve({ role: "admin", name: "Administrator" });
    } else if (username === "user" && password === "secret") {
      this.token = "user";
      return Ember.RSVP.resolve({ role: "user", name: "User" });
    } else {
      return Ember.RSVP.reject({ status: "UNAUTHORIZED", message: "Incorrect username/password" });
    }
  },

  logout: function() {
    this.token = null;
    return Ember.RSVP.resolve("success");
  },

  get: function(resource) {
    switch (resource) {

      case "public":
        return Ember.RSVP.resolve({ data: "Lorem ipsum dolor sit amet" });

      // Protected page
      case "protected":
        if (this.token === "admin" || this.token === "user") {
          return Ember.RSVP.resolve({ data: "Since you can see this, you must be logged in!" });
        } else if (this.token === "expired") {
          return Ember.RSVP.reject({ status: "UNAUTHORIZED", message: "Your session has expired" });
        } else {
          return Ember.RSVP.reject({ status: "UNAUTHORIZED", message: "Please login to access this page" });
        }

      // Admin-only page
      case "secret":
        if (this.token === "admin") {
          return Ember.RSVP.resolve({ data: "Since you can see this, you must be an admin!" });
        } else if (this.token === "user") {
          return Ember.RSVP.reject({ status: "FORBIDDEN", message: "You are not allowed to access this page" });
        } else if (this.token === "expired") {
          return Ember.RSVP.reject({ status: "UNAUTHORIZED", message: "Your session has expired" });
        } else {
          return Ember.RSVP.reject({ status: "UNAUTHORIZED", message: "Please login to access this page" });
        }

      default:
        return Ember.RSVP.reject({ status: "NOT FOUND", message: "The page cannot be found" });
    }
  }

};
{% end %}

As you can see, this simulated API client has the same interface and semantics
as the "real" API client. Instead of making AJAX calls using jQuery, we simply
return the appropriate Promise objects using the [RSVP library](rsvp), which
also preserves the asynchronous nature of the AJAX calls.

## The index page

Now that we have the API client figured out, we can move on to setting up our
Ember app and a simple index page. This will be the page that greets our users
when they first visit our app and where we link to the different sections of our
app.

{% highlight js %}
// application.js

App = Ember.Application.create();
{% end %}

{% highlight html %}
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My App</title>
    <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/normalize/3.0.1/normalize.css">
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="http://builds.handlebarsjs.com.s3.amazonaws.com/handlebars-v2.0.0.js"></script>
    <script src="http://builds.emberjs.com/tags/v1.9.1/ember.js"></script>
    <script src="api.js"></script>
    <script src="application.js"></script>
  </head>
  <body>
    <script type="text/x-handlebars" data-template-name="application">
      <h2>My App</h2>
      {{outlet}}
    </script>

    <script type="text/x-handlebars" data-template-name="index">
      <p>Public Page</p>
      <p>Protected Page</p>
      <p>Admin-only Page</p>
    </script>
  </body>
</html>
{% end %}

Here, we have a bare-bone Ember app setup with a simple app-wide layout (the
template called "application" will be rendered for every page, and the page's
template will be inserted into the `{{outlet}}` placeholder). (If you are
familiar with Rails, you can think of it as the application's "layout", where
the `{{outlet}}` is analogous the `<%= yield %>`.)

<a class="jsbin-embed" href="http://emberjs.jsbin.com/cecuvu/1/embed?html,js,output&width=960px">See the result</a><script src="http://static.jsbin.com/js/embed.js"></script>

When you launch the app in your browser, you should see the index template being
rendered. Clicking on the links doesn't do anything yet, though, so let's fix
it!

## Adding the public page

To render the public page, we want to call `API.get("public");` to fetch the
data we need to populate the page. Because we don't need to authenticate with
the server, this is pretty straight forward:

{% highlight js %}
// application.js

App = Ember.Application.create();

App.Router.map(function() {
  this.route("public");
});

App.PublicRoute = Ember.Route.extend({
  model: function() {
    return API.get("public");
  }
});
{% end %}

{% highlight html %}
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <!-- ... -->
  </head>
  <body>
    <!-- ... -->

    <script type="text/x-handlebars" data-template-name="index">
      <p>{{#link-to "public"}}Public Page{{/link-to}}</p>
      <p>Protected Page</p>
      <p>Admin-only Page</p>
    </script>

    <script type="text/x-handlebars" data-template-name="public">
      <h4>Public Page</h4>
      <p>{{data}}</p>
      <p>{{#link-to "index"}}Go back{{/link-to}}</p>
    </script>
  </body>
</html>
{% end %}

By returning a Promise in our route (which is what our `API.get` returns), the
Ember router is smart enough to wait for it to resolve (or reject) before
rendering the page. This architecture spares us from worrying about the async
nature of the data-fetching operations, so we can simply refer to the data
returned by the server in our template.

<a class="jsbin-embed" href="http://emberjs.jsbin.com/cecuvu/2/embed?html,js,output&width=960px">See the result</a><script src="http://static.jsbin.com/js/embed.js"></script>

If you refresh the app in the browser, you should now be able to go back and
forth between the index page and the public page (by clicking the links, the
back/forward buttons in your browser, or even messing with the URL in the
address bar directly).  

## Adding the protected page

With the public page fully functioning, we will move on to tackling the
protected page.

{% highlight js %}
// application.js

App = Ember.Application.create();

App.Router.map(function() {
  this.route("public");
  this.route("protected");
});

App.PublicRoute = Ember.Route.extend({
  model: function() {
    return API.get("public");
  }
});

App.ProtectedRoute = Ember.Route.extend({
  model: function() {
    return API.get("protected");
  }
});  
{% end %}

{% highlight html %}
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <!-- ... -->
  </head>
  <body>
    <!-- ... -->

    <script type="text/x-handlebars" data-template-name="index">
      <p>{{#link-to "public"}}Public Page{{/link-to}}</p>
      <p>{{#link-to "protected"}}Protected Page{{/link-to}}</p>
      <p>Admin-only Page</p>
    </script>

    <!-- ... -->

    <script type="text/x-handlebars" data-template-name="protected">
      <h4>Protected Page</h4>
      <p>{{data}}</p>
      <p>{{#link-to "index"}}Go back{{/link-to}}</p>
    </script>

    <script type="text/x-handlebars" data-template-name="error">
      <h4>An error has occured!</h4>
      <p>
        {{#if message}}
          {{message}}
        {{else}}
          Unknown Error
        {{/if}}
      </p>
      <p>{{#link-to "index"}}Go back{{/link-to}}</p>
    </script>
  </body>
</html>
{% end %}

<a class="jsbin-embed" href="http://emberjs.jsbin.com/cecuvu/3/embed?html,js,output&width=960px">See the result</a><script src="http://static.jsbin.com/js/embed.js"></script>

If you tried clicking on the link to the protected page, you will see that
Ember is rendering the `error` template with the error message returned by the
server ("Please login to access this page"). As we haven't authenticate with the
API yet, this is what we would expect. However, how does Ember know to render
the `error` template instead of the `protected` template?

You might have guessed it – Promises! When the server refuses to process our
request due to unfulfilled authentication requirements, our API client will
reject the promise it returned (this is true for both the jQuery version and the
stubbed version).

Because Ember's router is Promise-aware, it will know that a rejected Promise
means that something has gone wrong. When this happens, it will abort the
original transition (into the `protected` route) and transition into a special
`error` route instead. This in turns causes the `error` template to be rendered
with the rejection reason being the route's model, which is why we have access
to the error's `message` in the template.

## Adding a login page

We still haven't seen the fully-functional protected page yet as we don't have
a way to authenticate with the API via the UI, so let's add that next!

{% highlight js %}
// application.js

App = Ember.Application.create();

App.Router.map(function() {
  this.route("login");
  this.route("public");
  this.route("protected");
});

App.LoginRoute = Ember.Route.extend({
  actions: {
    submit: function() {
      var route = this, controller = this.get("controller");

      var username = controller.get("username"),
          password = controller.get("password");

      controller.set("message", null);

      API.login(username, password).then(
        function(user) {
          route.transitionTo("index");
        },
        function(error) {
          controller.set("message", error.message);
        }
      );
    },

    cancel: function() {
      this.transitionTo("index");
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

// ...
{% end %}

{% highlight html %}
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <!-- ... -->
  </head>
  <body>
    <!-- ... -->

    <script type="text/x-handlebars" data-template-name="application">
      <h2>My App</h2>
      {{outlet}}
      <p>{{#link-to "login" tagName="button"}}Login{{/link-to}}</p>
    </script>

    <script type="text/x-handlebars" data-template-name="login">
      <h4>Please login</h4>

      {{#if message}}
        <p>{{message}}</p>
      {{/if}}

      <p>
        <small>
          To login as a user, use <code>user</code> / <code>secret</code>;<br>
          to login as an admin, use <code>admin</code> / <code>secret</code>.
        </small>
      </p>

      <p>Username: {{input value=username}}</p>
      <p>Password: {{input type="password" value=password}}</p>

      <p>
        <button {{action "submit"}}>Submit</button>
        <button {{action "cancel"}}>Cancel</button>
      </p>
    </script>

    <!-- ... -->
  </body>
</html>
{% end %}

We did quite a lot here, so let's break it down a little.

First, we added a `login` route in the router. Just like you would expect,
visiting the `/login` URL would enter this route and render the `login`
template. Nothing new so far.

In the `login` template, we added some markup for a simple form, with input
fields for the username and password. The value for these input fields are bound
to the controller's `username` and `password` properties, which would come in
handy later. (For the purpose of understanding this example, you Angular folks
might find it helpful to think of the controller as the template's `$scope`.)

Below the form, we have two buttons that would trigger the `submit` and `cancel`
actions respectively, which will be bubbled up to the route and invoke the
appropriately named functions defined inside `LoginRoute`.

For the `submit` action, we simply extract the values for the username and
password from the controller (which is bound to the values of the input fields)
and pass them to `API.login`. If the authentication is successful (i.e. the
Promise resolves), then we would redirect the user back to the index page;
otherwise, we will extract the server's response and display it in the template.

(If you are curious about the `resetController` hook we implemented, it simply
clears out the values in the login form when transitioning away from the login
page.)

Finally, we added a link to the login page. This time, we added the link to the
`application` template, so it will always be visible across all the pages in our
app. Instead of rendering it like a normal like (an `a` tag), we told Ember to
render it as a `button` tag instead, just so it will look a little different
from the rest of the links.

<a class="jsbin-embed" href="http://emberjs.jsbin.com/cecuvu/4/embed?html,js,output&width=960px">See the result</a><script src="http://static.jsbin.com/js/embed.js"></script>

With these changes, you can try logging in using the hard-coded credentials (or
use something else to see the error messages in action). Once you are logged in,
you should be able to view the protected page without problems.

## Tracking the current user and adding a logout link

If you have played with the result from the last step, you might find the user
experience of the login page quite confusing – upon completing logging in, there
are no visual indication to the user that they have successfully completed the
login procedure. The "Login" button is also always visible on the bottom of the
page, making it difficult to infer the state of the system. Ideally, we would
like to know if the user is already logged in, and display a "Logout" button
there instead. We will work on addressing this next:

{% javascript %}
// application.js

App = Ember.Application.create();

App.Router.map(function() {
  this.route("login");
  this.route("public");
  this.route("protected");
});

App.register("session:main", Ember.Object);
App.inject("route", "session", "session:main");
App.inject("controller", "session", "session:main");

App.ApplicationRoute = Ember.Route.extend({
  actions: {
    logout: function() {
      var route = this;

      API.logout().then(function() {
        route.session.set("user", null);
        route.transitionTo("index");
      });
    }
  }
});

App.LoginRoute = Ember.Route.extend({
  actions: {
    submit: function() {
      var route = this, controller = this.get("controller");

      var username = controller.get("username"),
          password = controller.get("password");

      controller.set("message", null);

      API.login(username, password).then(
        function(user) {
          route.session.set("user", user);
          route.transitionTo("index");
        },
        function(error) {
          controller.set("message", error.message);
        }
      );
    },

    // ...
});

// ...
{% end %}

{% highlight html %}
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <!-- ... -->
  </head>
  <body>
    <!-- ... -->

    <script type="text/x-handlebars" data-template-name="application">
      <h2>My App</h2>
      {{outlet}}
      {{#if session.user}}
        <p><button {{action "logout"}}>Logout</button></p>
      {{else}}
        <p>{{#link-to "login" tagName="button"}}Login{{/link-to}}</p>
      {{/if}}
    </script>

    <!-- ... -->

    <script type="text/x-handlebars" data-template-name="index">
      {{#if session.user}}
        <h4>You are logged in as {{session.user.name}}</h4>
      {{/if}}
      <p>{{#link-to "public"}}Public Page{{/link-to}}</p>
      <p>{{#link-to "protected"}}Protected Page{{/link-to}}</p>
      <p>Admin-only Page</p>
    </script>

    <!-- ... -->
  </body>
</html>
{% end %}

First, we introduced the concept of a shared `session` object and made it
available to all controllers and routes in our app. This is where we will keep
transient session states of our app that only last as long as the browser tab
is open, ideal for tracking the "current user" and similar things. We made it
an `Ember.Object` so that can be bound in templates, but otherwise it behaves
just like a "plain-old JavaScript object" (`{}`) for our purpose.

We then modified our `submit` action in the `LoginRoute` to store the `user`
object returned by the server in the `session` object upon a successful login.

Because we made the `session` object available to all controllers, we can now
access its content in the templates as well. (For you angular developers,
imagine we have added the `session` object to the root scope.) With that, we
modified the `application` template to conditionally show a "Login" or "Logout"
button depends on whether the user has logged in or not. We have also added a
simple greeting in the `index` template to remind our users who (the system
thinks) they are.

Finally, since the "Logout" button can be clicked from anywhere in our app, we
introduced an `ApplicationRoute` to handle the `logout` action. Just like
templates, routes in Ember is arranged in a nested hierarchy. We won't get into
the details here, but in a nut shell, the `ApplicationRoute` is always active
(just like the `application` template is always rendered), making it the ideal
place to handle global actions like these. The implementation of the action
handler itself is fairly simple – we just call `API.logout`, set `session.user`
back to `null` and then transition back to the "index" page.

<a class="jsbin-embed" href="http://emberjs.jsbin.com/cecuvu/5/embed?html,js,output&width=960px">See the result</a><script src="http://static.jsbin.com/js/embed.js"></script>

This is one more minor issue – because the "Login" button is rendered in the
`application` template (the app's "layout"), it will be visible in the login
page as well, which make things quite confusing. Fortunately, this is very easy
to fix. Since we implemented the "Login" button using the `{{link-to}}` helper,
Ember will automatically add an `active` CSS class to the button when the link
is active (i.e. we are already on the page that the link is pointed to). This
makes it trivial to hide the "Login" button on the login page with just a few
lines of CSS:

{% highlight css %}
/* application.css */

button.active {
  display: none;
}
{% end %}

<a class="jsbin-embed" href="http://emberjs.jsbin.com/cecuvu/6/embed?css,output&width=960px">See the result</a><script src="http://static.jsbin.com/js/embed.js"></script>

## Revisiting the protected page

With our login flow working properly, we can shift our attention back to the
protected page. Remember how when you visited the protected page without being
logged in, it would just show the error page? Since we know how to the user can
solve that problem (by logging in), wouldn't it be great if we just redirect
them straight to the login page? Better yet, it would be fantastic if we can
also remember where the user came from, and redirect them back to the same page
upon a successful login. Let's get to work!

{% javascript %}
// application.js

// ...

App.ApplicationRoute = Ember.Route.extend({
  actions: {
    logout: function() {
      var route = this;

      API.logout().then(function() {
        route.session.set("user", null);
        route.transitionTo("index");
        });
    },

    error: function(error, transition) {
      if (error.status === "UNAUTHORIZED") {
        var loginController = this.controllerFor("login");

        loginController.setProperties({
          message: error.message,
          transition: transition
        });

        this.transitionTo("login");
      } else {
        return true;
      }
    }
  }
});

App.LoginRoute = Ember.Route.extend({
  actions: {
    submit: function() {
      var route = this, controller = this.get("controller");

      var username = controller.get("username"),
          password = controller.get("password");

      controller.set("message", null);

      API.login(username, password).then(
        function(user) {
          var transition = controller.get("transition");

          route.session.set("user", user);

          if (transition) {
            transition.retry();
          } else {
            route.transitionTo("index");
          }
        },
        function(error) {
          controller.set("message", error.message);
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

App.LoginController = Ember.Controller.extend();

// ...
{% end %}

When an error occurs during a route transition (e.g. a Promise was rejected),
the Ember router will first bubble an `error` action, offering you a chance to
handle that gracefully before transitioning into the `error` page.

This is exactly what we want to do here. We added a handler for the `error`
action to the top-level `ApplicationRoute`. From within the handler, we look for
a specific type of error (an error with the "UNAUTHORIZED" HTTP status returned
by the server/`API`). If that is indeed what's happening, we capture the error
message and the current transition so that we can retry it later when the user
has completed the authentication process. Otherwise, we `return true` to let
the action continue to bubble (which sends the user to the error page).

In our `LoginRoute`, upon a successful login, we check if we have saved any
transition from earlier (via the `error` handler we just implemented). If we
found one, we will retry the same transition (which should work now that the
user is logged in). Otherwise, we just transition to the "index" page like we
did before.

<a class="jsbin-embed" href="http://emberjs.jsbin.com/cecuvu/7/embed?html,js,output&width=960px">See the result</a><script src="http://static.jsbin.com/js/embed.js"></script>

If you are paying close attention, there is a minor hiccup here. So far we
haven't had to explicitly define any controllers ourselves. This is because we
didn't need to do much with them, so Ember could just infer what we need and
generate them automatically on demand when the route is entered. However, with
our changes to the `ApplicationRoute`, we would need to access the controller
before the `login` route is entered.

In this case, Ember won't be able to infer the type of controller we need (there
are different kinds of controllers in Ember), so we will need to explicitly
define it. Since we only need the basic functionality, our `LoginController`
will just extend from the base `Ember.Controller` class.

There is one more improvement we can make to the protected page. Currently, if
the user is not logged in, we will still make an API request to the server and
wait for the error response before redirecting the user to our login page. With
the session object, we can now reliably predict this outcome and avoid that
wasteful roundtrip:

{% javascript %}
// application.js

// ...

App.ProtectedRoute = Ember.Route.extend({
  beforeModel: function() {
    if (!this.session.get("user")) {
      return Ember.RSVP.reject({ status: "UNAUTHORIZED", message: "Please login to access this page" });
    }
  },

  model: function() {
    return API.get("protected");
  }
});  
{% end %}

All we need to do here is check if we have a `session.user` is present. If not,
we will immediately return a rejected Promise just like the `API` would. That
way, our existing `error` handler should Just Work™ without any changes.

<a class="jsbin-embed" href="http://emberjs.jsbin.com/cecuvu/8/embed?html,js,output&width=960px">See the result</a><script src="http://static.jsbin.com/js/embed.js"></script>

## Adding the admin-only page

Our last task is to add the super-secret admin-only page.

{% javascript %}
// application.js

App = Ember.Application.create();

App.Router.map(function() {
  this.route("login");
  this.route("public");
  this.route("protected");
  this.route("secret");
});

// ...

App.SecretRoute = Ember.Route.extend({
  beforeModel: function() {
    if (!this.session.get("user")) {
      return Ember.RSVP.reject({ status: "UNAUTHORIZED", message: "Please login to access this page" });
    } else if (this.session.get("user.type") !== "admin") {
      return Ember.RSVP.reject({ status: "FORBIDDEN", message: "You are not allowed to access this page" });
    }
  },

  model: function() {
    return API.get("secret");
  }
});  
{% end %}

{% highlight html %}
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <!-- ... -->
  </head>
  <body>
    <!-- ... -->

    <script type="text/x-handlebars" data-template-name="index">
      {{#if session.user}}
        <h4>You are logged in as {{session.user.name}}</h4>
      {{/if}}
      <p>{{#link-to "public"}}Public Page{{/link-to}}</p>
      <p>{{#link-to "protected"}}Protected Page{{/link-to}}</p>
      <p>{{#link-to "secret"}}Admin-only Page{{/link-to}}</p>
    </script>

    <!-- ... -->

    <script type="text/x-handlebars" data-template-name="secret">
      <h4>Admin-only Page</h4>
      <p>{{data}}</p>
      <p>{{#link-to "index"}}Go back{{/link-to}}</p>
    </script>

    <!-- ... -->
  </body>
</html>
{% end %}

As you can see, this was quite easy to do and we didn't really introduce
anything new here. We defined a route and a corresponding template, and updated
our index to link to it.

Just like the `ProtectedRoute`, we took advantage of our domain knowledge (this
page is only for admin users) and duplicated the access control checks on the
client, which allowed us to quickly respond to the user without involving the
server. This is entirely an optional optimization of course – we could have
removed that check and everything would still functional correctly.

## Handling expired sessions

Before we wrap up, I guess we would still need to handle the case where our
session (token) has expired. But what if I tell you we already did that? :)

Upon encountering an expired session token, our well-mannered sever is going to
respond with a "401 UNAUTHORIZED" error – which happens to be the same error
the server sends when the user didn't login at all (semantically, they are
really the same thing). This is great, because our app already knows that it
should redirect the user to the login page, which is also exactly what we would
want here.

To see it in action, we will add a button to simulate this situation:

{% javascript %}
// application.js

App = Ember.Application.create();

// ...

App.ApplicationRoute = Ember.Route.extend({
  actions: {
    // ...

    expireSession: function() {
      API.token = "expired";
    },

    // ...
  },

  // ...
});

// ...
{% end %}

{% highlight html %}
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <!-- ... -->
  </head>
  <body>
    <!-- ... -->

    <script type="text/x-handlebars" data-template-name="application">
      <h2>My App</h2>
      {{outlet}}
      {{#if session.user}}
        <p><button {{action "logout"}}>Logout</button></p>
        <p><button {{action "expireSession"}}>Simulate Expired Session</button></p>
      {{else}}
        <p>{{#link-to "login" tagName="button"}}Login{{/link-to}}</p>
      {{/if}}
    </script>

    <!-- ... -->
  </body>
</html>
{% end %}

We are simulating the expiration of a session by changing our session token to
"expired", and our `API` wrapper will take care of the rest.

We have now introduced a scenario where a user might end up on the login page
even when `session.user` isn't `null`. If the user chose to click "Cancel" on
the login form, they will be redirected to the index page and the app will still
behave as if they are logged in. This does not pose any security risk (because
the server will just refuse to serve any content and the user will just keep
hitting the login page), but it would make a pretty confusing experience.

To address this, we will make sure we clear the authentication information when
the login route is entered:

{% highlight javascript %}
// application.js

// ...

App.LoginRoute = Ember.Route.extend({
  // ...

  beforeModel: function() {
    API.token = null;
    this.session.set("user", null);
  },

  // ...
});

// ...
{% end %}

## Wrapping up


