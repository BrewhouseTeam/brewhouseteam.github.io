---
layout:    post
title:     "Writing Rails-flavored AngularJS"
author:    gabe
category:  blog
date:      2014-09-23 11:00
published: true
tags:
  - ruby
  - rails
  - angularjs
---

When I think about Ruby on Rails and AngularJS in the same codebase, I kind of cringe. After
spending more than a year trying to reconcile how Rails plays with Angular, not only
have I been unsuccessful, but I have not been satisfied with any of the suggested
solutions. There is a ton of material on the numerous Rails hacks you should employ
so that Rails and AngularJS feel compatible; however, I'm beginning to
wonder whether this problem is being approached from the wrong direction.
Instead, how can we hack AngularJS so that it plays nice with Rails?

As a Ruby on Rails developer, I want to feel that I'm writing a Rails
application. I'm OK with a page refresh when I'm browsing between features. I don't
want to feel like I have to submit to the 'Single Page Application' paradigm.
I want my JavaScript to be sprinkled on the page to augment my application. I
don't want my JavaScript to consume the entire thing. AngularJS has a tendency
to pull you out of developing Rails in the Rails way.

Rails comes bundled with vanilla jQuery, which is very easy to get started with,
but it is difficult to maintain. I love how Angular encapsulates, localizes and contains
JavaScript functionality. It's maintainable, modular, and easier to understand
than a sputtering of jQuery files. It would be nice if I could focus on writing
JavaScript for components and leave the application bit to my Rails server.

My solution to solve this problem is appropriately called
[Angular Sprinkles](https://github.com/BrewhouseTeam/angular_sprinkles).
This gem hides all of the usual setup required for a tranditional AngularJS
application while dynamically generating one at run time. Developers use Rails
helper methods to enable two-way binding, render directives, and call evented
functions. It's a cleaner approach to JavaScript in your Rails application.
Let's take a look.

## Binding attributes

Two-way binding works right out of the box with Sprinkles. Wrapping objects
with the `bindable` controller helper gives them the `bind` method.

{% highlight ruby %}
# app/controllers/user_controller.rb

class UserController < ApplicationController
  def show
    @user = bindable(User.find(params[:id]))
  end
end
{% endhighlight %}

And then in the view, you can either bind to the entire JSONified object with `@user.bind`,
or just a single attribute with an argument.

{% highlight erb %}
{% raw %}
<!-- app/views/users/show.html.erb -->

<p>My name is: {{ <%= @user.bind(:name) %> }}</p>
<input type="text" ng-model="<%= @user.bind(:name) %>" />
{% endraw %}
{% endhighlight %}

## Inlined directives

We'll take this a step further by creating a directive to make our name blink very rapidly (obviously).
Let's first write the directive.

{% highlight js %}
{% raw %}
// app/assets/javascripts/directives/blink.js

sprinkles.directive('blink', function ($timeout) {
  return {
    restrict: 'A',
    transclude: true,
    scope: {
      period: '='
    },
    link: function (scope, element) {
      var opacity = 1;

      function blink () {
        $timeout(function () {
          opacity = -(opacity - 1);
          element.css({opacity: opacity});
          blink();
        }, scope.period);
      }

      blink();
    }
  };
});
{% endraw %}
{% endhighlight %}

And now we can include the directive in our view with the `directive` helper.

{% highlight erb %}
{% raw %}
<!-- app/views/users/show.html.erb -->

<%= directive(:blink, period: 250) do %>
  <p>My name is: {{ <%= @user.bind(:name) %> }}</p>
<% end %>
<input type="text" ng-model="<%= @user.bind(:name) %>" />
{% endraw %}
{% endhighlight %}

BOOM! Annoying blinking tag!

## Evented JavaScript functions

Finally, it's very important to be able to still use Angular's built-in event
bindings. For example, clicking a button and showing an alert box. Sprinkles
solves this by allowing developers to inline Angular services with the `service`
helper method.

{% highlight js %}
{% raw %}
// app/assets/javascripts/services/alert_me.js

sprinkles.service('alertMe', function () {
  return function (input) {
    alert('My name is: ' + input);
  };
});
{% endraw %}
{% endhighlight %}

And then in the view,

{% highlight erb %}
{% raw %}
<!-- app/views/users/show.html.erb -->

<button ng-click="<%= service(:alert_me, @user.bind(:name)) %>">CLICK ME!</button>
<input type="text" ng-model="<%= @user.bind(:name) %>" />
{% endraw %}
{% endhighlight %}

In all of these examples there was no additional setup involved. An Angular application
is generated behind the scenes, allowing the developer to keep focused on smaller
JavaScript components. Focused on the... sprinkles.

## Let us know what you think

Angular Sprinkles is a new approach to Angular-Rails development. It's for those of us
that love both of these great technologies and want to see them work together pleasantly.
Please [have a look at the gem](https://github.com/BrewhouseTeam/angular_sprinkles)
for more information on setup and leave some feedback. We would love to know what you think.
