---
layout:    post
title:     "Ember.js: An Antidote To Your Hype Fatigue"
author:    "godfrey"
category:  blog
date:      2015-05-13 09:00
published: true
tags:
- talks
- emberjs
- javascript
- single page application
shared_square_image: http://brewhouse.io/images/posts/2015/05/hype-fatigue-social.jpg
shared_description: "Ember.js: An Antidote To Your Hype Fatigue"
---

This is a write-up of the talk I gave at [VanJS](http://www.meetup.com/vancouver-javascript-developers/)
this month. You can find the slides [here](https://speakerdeck.com/chancancode/ember-dot-js-an-antidote-to-your-hype-fatigue).

If you happen to be in Seattle, I'll be giving a version of this talk on
Thursday May 28th at the [Ember.JS Seattle](http://www.meetup.com/Ember-js-Seattle-Meetup/events/222195632/)
meetup.

<iframe width="560" height="315" src="https://www.youtube.com/embed/ASxwoyg40L4" frameborder="0" allowfullscreen></iframe>

<!-- break -->

* * *

A while back, [Allen Pike](https://twitter.com/apike) coined the term
*JavaScript Framework Fatigue* in [his essay](http://www.allenpike.com/2015/javascript-framework-fatigue/)
about the churns in the front-end JavaScript landscape. You really should read
it yourself, but I'll summarize it for you here:

<p>
  <a href="/images/posts/2015/05/pop-quiz.png">
    <img class="img-responsive" alt="Pop quiz!" src="/images/posts/2015/05/pop-quiz.png">
  </a>
</p>

If you are a web developer, and you don’t know the answer to this, or if you
don’t recognize half of the things on this slide, congratulations, you have
probably just experienced *JavaScript Framework Fatigue*. On the other hand, if
you immediately know the answer to this and you can name all the things on this
here, then you are probably experiencing *JavaScript Framework Fatigue* daily,
and I genuinely feel sorry for you.

Unfortunately, that used to be me. I worked for a company that offered [application
monitoring service](http://caliper.io/) for front-end JavaScript applications.
As you can imagine, having to add support for a new framework every sixteen
minutes does not make a very scalable business.

<p>
  <a href="/images/posts/2015/05/frameworks-1-0.png">
    <img class="img-responsive" alt="JavaScript frameworks: 1.0 release dates" src="/images/posts/2015/05/frameworks-1-0.png">
  </a>
</p>

To give you some perspective, this is some of the frameworks that reached "1.0"
during the last few years. I included a few pre-1.0 frameworks on the far right.
As you can see, one of them [didn't even make it to 1.0](https://github.com/batmanjs/batman/commit/87dd413e0c975e11e41c42a18ff0435e34869a32).
It also turns out these project all have pretty different views on what "1.0"
means, so this visualization didn't quite match my mental timeline.

So I tried something else.

<p>
  <a href="/images/posts/2015/05/frameworks-critical-mass.png">
    <img class="img-responsive" alt="JavaScript frameworks: reaching critical mass" src="/images/posts/2015/05/frameworks-critical-mass.png">
  </a>
</p>

Here, I consulted [Google Trends](https://www.google.com/trends/) and plotted
the month that each framework first reached a arbitrary threshold of "interest"
based on Google search queries. This turned out to be a pretty good
approximation of "when did I first hear about X?", and it is pretty close to the
mental timeline I have in mind.

As you can see, these frameworks didn't just get popular for no reason – each of
them genuinely brings some valuable new ideas to the table. For example,
Backbone popularized the idea having a small library that gets out of your way,
Knockout introduced two-way bindings to the world, Meteor promises to let you
write the same code for both your server and on the client, Angular encourages
you to write highly reusable and composable directives, and React challenged
everyone with a more functional approach to view rendering.

If you are a person with a lot of free time and curiosity, this is an excellent
time to be a front-end developer. If you are running a consulting agency, this
might even be good for business. Unfortunately, if you have a real job and a
product to maintain, then these new developments doesn't really benefit you that
much unless you rewrite your project using the latest framework every three
months. Worse, even if you managed to resist the temptation to do that, you will
keep hearing people around you raving about their shiny new toys, making you
feel inferior about the way you approach your project.

That, my friend, is what hype does to you.

## Hype Fatigue

<p>
  <a href="/images/posts/2015/05/hype-cycle.png">
    <img class="img-responsive" alt="The Hype Cycle by Brandon Hays" src="/images/posts/2015/05/hype-cycle.png">
  </a>
</p>

[Brandon Hays](https://twitter.com/tehviking) summarized this in a chart pretty
eloquently at [Fluent Conf](http://fluentconf.com/javascript-html-2015/public/schedule/speaker/192560).

When a new framework comes around, it probably solves an existing problem in a
new and interesting way, enabling you to take on some old challenges much more
easily, or even enables you to solve some new problems that you didn't think you
could solve before. From there, you begin to extrapolate your experience. Wow,
if that problem that took me forever to solve before only takes a weekend now,
imagine what I can do in three months!

Six months later, you begin to realize that you are running into other problems.
Perhaps you are spending a lot of time reinventing the tools you had from your
previous life in the other framework. Or perhaps, sometimes hard problems are
just hard regardless of your tools of choice. Whatever the reasons, this new
tool did not magically transform your into a 10X engineer you hoped to become.

No worries though. During the time you focused on rewriting your app, a dozen
new frameworks have appeared, so you could just pick up another one of them and
start all over again.

With that, you have completed the circuit that hype fatigue runs on.

## An Antidote To Your Hype Fatigue

I'd like to introduce you to [an antidote to your hype fatigue](https://twitter.com/tomdale/status/573326510670495744).
It's called [Ember.js](http://emberjs.com/).

<p>
  <a href="/images/posts/2015/05/ember-hype.png">
    <img class="img-responsive" alt="The Ember hype chart" src="/images/posts/2015/05/ember-hype.png">
  </a>
</p>

You have probably seen charts like this, where Ember consistently dominate the
bottom-end of the hype contest regardless of the metric you choose. To a casual
observer, it's actually pretty natural to arrive at the following conclusion:

<p style="text-align: center; font-size: 24px"><em>Isn’t Ember dead?</em></p>

I'll let you ponder on that for a moment; we'll come back to this later. For
now, let's focus on what makes Ember different.

Ember made some pretty bold bets during its early days:

1. Focus on ambitious web applications
2. Future web standards foresight
3. Stability without stagnation

These big bets have influenced a lot of the decision in the framework, and
consequently, its adoption pattern. So let's take a closer look on each of them.

## Big Bet: Focus on Ambitious Web Applications

A lot of frameworks set out to solve the *widget* problem (e.g. a date-picker).
In other words, they start out by [providing a solution to the *V* in the MVC](http://facebook.github.io/react/),
and from there you can extrapolate the same patterns to build out a full
application.

This is great, because every web developer needs to solve the widget problem.
This allows you to quickly sprinkle the new framework into your existing apps
and immediately benefit from it.

By contrast, Ember sets out to provide a wholesale solution to the client-side
application problem. This came at a high cost. For one thing, it is a lot more
work. It also means a much steeper learning curve, and severely restricts pool
of potential users.

<p>
  <a href="/images/posts/2015/05/companies.png">
    <img class="img-responsive" alt="Some serious Ember users" src="/images/posts/2015/05/companies.png">
  </a>
</p>

On the other hand, focusing on the bigger problem wins you some very serious
users. Obviously this is only a very [small](http://emberjs.com/ember-users)
[subset](http://builtwithember.io) of them, but it should give you a good idea
on the scale that Ember operates on.

### Solving The Hard Problems™

Solving "the application problem" is easier said than done, though. Focusing on
the big picture forces you to take on a lot of extra responsibilities and edge
cases that you could otherwise delegate to the endusers. In the end, that forces
you to solve a lot of Hard Problems™ in a generic fashion.

For example, let’s say you decided you that you would provide a solution to the
entire MVC cross-section. But you will quickly realize that "MVC" is just a
component architecture. For an application, you would have many of these MVC
things working together on the same page, and you need something to orchestrate
them.

So you add a router. But wait, in order for the components to seamlessly work
alongside each other, you need to have a "single source of truth". So you throw
a data store into the mix.

Great. Now that you have a serious application, you probably need a way to test
it as well.

Hm, but there's more! You need to set up a build pipeline for all of these
things: managing assets, modules, loaders, development server, different build
environments, configurations and all that jazz.

Then of course, your application wouldn't be of any use if you can't ship it to
your users, so you also need to figure out the deployment strategies.

And oh wait. Obviously, your team of 5 developers is not going to write all the
code you are going to use, so you need a sane way to share code between the
wider community as well.

Of course, these problems are probably Not That Hard™. After all, anyone who
builds JavaScript applications using smaller libraries would have to solve these
problems themselves, so we know that could be done. So perhaps, we should just
say, focusing on applications forces you to solve a lot of <del>Hard</del> Real
World Problems™.

But as you can see, these Real World Problems™ are very boring, so they get a
lot less spotlight attention than, say, new programming paradigms. After all,
none of these are exactly uncharted territories.

In a lot of ways, the "Ember is dead" sentiment feels a lot like "Apple has
stopped innovating". At the end of the day, it's still the same *LCD* display,
*just more pixels*, right? I don't even know what it is, but it certainly sounds
a lot less innovative than an OLED display. Sure, the camera takes pretty good
pictures, but it’s only 8 mega pixels... why would anyone want that? A laptop
with all-day battery life? Who cares? Where are their augmented-reality glasses?

This is pretty interesting. Because a lot of times (as geeks) we tend to be
carried away by the flashy new things rather than the boring stuff that actually
makes or breaks our day-to-day experience.

### The Boring Non-Innovations

Let's take a look at some of the boring non-innovations in Ember that makes your
development experience a lot nicer.

#### Ember Inspector

<p style="position: relative; overflow: hidden">
  <a href="/images/posts/2015/05/ember-inspector-1.png" style="float: left; width: 25%">
    <img class="img-responsive" alt="The Ember Inspector" src="/images/posts/2015/05/ember-inspector-1.png">
  </a>

  <a href="/images/posts/2015/05/ember-inspector-2.png" style="float: left; width: 25%">
    <img class="img-responsive" alt="The Ember Inspector" src="/images/posts/2015/05/ember-inspector-2.png">
  </a>

  <a href="/images/posts/2015/05/ember-inspector-3.png" style="float: left; width: 25%">
    <img class="img-responsive" alt="The Ember Inspector" src="/images/posts/2015/05/ember-inspector-3.png">
  </a>

  <a href="/images/posts/2015/05/ember-inspector-4.png" style="float: left; width: 25%">
    <img class="img-responsive" alt="The Ember Inspector" src="/images/posts/2015/05/ember-inspector-4.png">
  </a>
</p>

The [Ember inspector](https://github.com/emberjs/ember-inspector/) is a browser
extension for debugging Ember apps. Similar to [React](https://github.com/facebook/react-devtools)
and [Angular’s](https://github.com/angular/angularjs-batarang) inspectors, you
get a tree view of all your views, their rendering performance, and so on.

Similar to the browsers' native developer tools, you can also click on any
element on the screen and it would bring you to the corresponding view in the
tree.

You can fiddle with its internal states directly from the inspector, or you can
interact with the view object from the JavaScript console.

But because Ember is an application framework, you get to see a lot more from
the inspector. For example, you can look at your routes table, interact with the
route objects and look into the router's current state.

You  can also look at the data store and see all the models you have loaded,
follow their relationship and so on.

#### Ember Data

That brings us to [Ember Data](https://github.com/emberjs/data), the "official"
persistance/model layer for Ember.

{% highlight js %}
// app/models/post.js

export default DS.Model.extend({

  title: DS.attr("string"),
  body: DS.attr("string"),
  published: DS.attr("date"),

  author: DS.belongsTo("user"),
  comments: DS.hasMany("comment")

});
{% endhighlight %}

This is how you would define your model objects in Ember Data. Just like you
would expect, a model can have attributes and relationships. For example, a blog
post would probably have a title, body, published at timestamp, an author and
many comments.

{% highlight js %}
store.find("post");

store.find("post", {q: "Rails"});

store.find("post", 1);

store.filter("post", function(post) { ... });

store.createRecord("post", {
  title: "Rails is Omakase",
  body: "..."
});
{% endhighlight %}

Ember Data also manages your models while they are kept in-memory. It would make
sure that there is only one conical copy of each model instance in the store,
and keep them in-sync with the server whenever data comes in over the wire.

{% highlight js %}
// app/adapters/application.js

export default DS.RestAdapter.extend({
  host: "https://..."
});

// app/adapters/user.js

export default FirebaseAdapter.extend({
  firebase: "https://..."
});
{% endhighlight %}

Of course, you can specify where your data comes from and how you communicate
with those data sources. [JSON API](http://jsonapi.org/) will soon become the
default interchange format between Ember Data and your server, but you can just
as easily define your own as well. For example, you can have most of your data
coming from your RESTful API, but store your user data on Firebase.

(In fact, your data sources [doesn't even have to be an API](/blog/2015/03/06/adapter-patterns-in-ember-js.html).)

#### Ember CLI

Next, let's talk about [Ember CLI](http://www.ember-cli.com/). Ember CLI is a
set of command line tools for generating and developing your Ember apps, but
it also refers to the conventional setup generated by Ember CLI, the tooling
and ecosystem around it.

{% highlight text %}
% ember new test-app
version: 0.2.3
installing
  create .bowerrc
  create .editorconfig
  create .ember-cli
  create .jshintrc
  create .travis.yml
  create Brocfile.js
  create README.md
  create app/app.js
  create app/components/.gitkeep
  create app/controllers/.gitkeep
  create app/helpers/.gitkeep
  create app/index.html
  create app/models/.gitkeep
  create app/router.js
  create app/routes/.gitkeep
  create app/styles/app.css
  create app/templates/application.hbs
  create app/templates/components/.gitkeep
  create app/views/.gitkeep
  create bower.json
  create config/environment.js
  create .gitignore
  create package.json
  create public/crossdomain.xml
  create public/robots.txt
  create testem.json
  create tests/.jshintrc
  create tests/helpers/resolver.js
  create tests/helpers/start-app.js
  create tests/index.html
  create tests/test-helper.js
  create tests/unit/.gitkeep
  create vendor/.gitkeep
Installed packages for tooling via npm.
Installed browser packages via Bower.
Successfully initialized git.
{% endhighlight %}

For example, running `ember new APP_NAME` generates a new Ember app with the
default stack – which includes the conventional file/folder structure for your
app, Git, ES6 modules transpiler, a module loader, a development server, an
asset pipeline, test harness, module loader, package management, JSHint, Babel,
etc.

{% highlight text %}
% ember serve
version: 0.2.3
Livereload server on port 35729
Serving on http://localhost:4200/

Build successful - 3774ms.

Slowest Trees                                 | Total
----------------------------------------------+---------------------
Concat: Vendor                                | 3005ms

Slowest Trees (cumulative)                    | Total (avg)
----------------------------------------------+---------------------
Concat: Vendor (1)                            | 3005ms
Babel (2)                                     | 231ms (115 ms)

file changed templates/application.hbs

Build successful - 330ms.

Slowest Trees                                 | Total
----------------------------------------------+---------------------
Concat: Vendor                                | 103ms

Slowest Trees (cumulative)                    | Total (avg)
----------------------------------------------+---------------------
Concat: Vendor (1)                            | 103ms
Funnel (32)                                   | 37ms (1 ms)
SourcemapConcat (3)                           | 22ms (7 ms)
TreeMerger (67)                               | 17ms (0 ms)
{% endhighlight %}

The development server probably deserves a special call out. Under the hood,
Ember CLI uses [Broccoli](https://github.com/broccolijs/broccoli) for the build
pipeline. Whenever you change a file, it'll automatically rebuild that part of
your app bundle incrementally. When that's done, Ember automatically reloads
your app in any open browser tabs – all out of the box with zero configuration.

#### Testing

You could design your architecture in a way that makes your components very
unit-testable in theory, but that's usually not where the difficulty lies – the
most difficult part about testing is getting into the habit of writing them,
100% of the time.

How many of you write tests for your front-end JavaScript projects? Do you write
unit tests? Do you write end-to-end acceptance tests? What about testing them in
multiple browsers? Continuously running them during development? Do you do all
of those things for your side projects too?

Personally, I probably won't do any of that because it feels like a lot of work
to set it up in the first place.

Fortunately, you don't have to. Out of the box, Ember CLI sets up the test
harness for your app. When you use the generator, it always generates the
corresponding test files for you:

{% highlight text %}
% ember generate resource post
version: 0.2.3
installing
  create app/models/post.js
installing
  create tests/unit/models/post-test.js
installing
  create app/routes/post.js
  create app/templates/post.hbs
installing
  create tests/unit/routes/post-test.js
{% endhighlight %}

This is what your unit test might look like for a model:

{% highlight js %}
moduleForModel('post');

test('slug', function(assert) {
  var post = this.subject({ title: 'Rails is omakase' });
  assert.equal(post.get('slug'), 'rails-is-omakase');
});
{% endhighlight %}

For a component:

{% highlight js %}
moduleForComponent('delete-button');

test('delete confirmation', function(assert) {

  var component = this.subject({
    text: 'Delete post'
  });

  component.$().click();

  assert.equal(component.$().text(), 'Are you sure?');
});
{% endhighlight %}

End-to-end integration tests:

{% highlight js %}
module('Acceptance: check out', { ... });

test('Express checkout', function(assert) {
  visit('/products/agile-web-development-with-rails');

  click('#express-checkout');

  fillIn('#login .username', 'godfrey');
  fillIn('#login .secret', 'secret');

  click('#login .submit');

  andThen(function() {
    var confirmation = find('#notice h3').text();

    assert.equal(confirmation, 'Thank you for your order');
  });
});
{% endhighlight %}

You can run them from the command-line using a headless browser:

{% highlight text %}
% ember test
version: 0.2.3
Built project successfully.
ok 1 PhantomJS 1.9 - JSHint - .: app.js should pass jshint
ok 2 PhantomJS 1.9 - JSHint - helpers: helpers/resolver.js should pass jshint
...
ok 11 PhantomJS 1.9 - route:post: it exists

1..11
# tests 11
# pass  11
# fail  0

# ok
{% endhighlight %}

As you can see, JSHint is also integrated into the testing pipeline. By default,
a failing JSHint rule would result in a failing test.

Or you can run a test server, which automatically reruns your tests in multiple
browsers whenever you make changes to your files:

{% highlight text %}
% ember test --server

TEST'EM 'SCRIPTS!
Open the URL below in a browser to connect.
http://localhost:7357/
━━━━━━━━━━━━━━┓
 PhantomJS 1.9┃  Chrome 43.0
    5/5 ✔     ┃    5/5 ✔
              ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━








✔ 5 tests complete.
[Press ENTER to run tests; q to quit; p to pause]
{% endhighlight %}

#### Ember Addons

While generators and all the goodies that EmberCLI gives you in the standard
stack are pretty cool, the real breakthrough here is that we finally agreed on a
*conical*/*conventional* set up for Ember applications. This enables the
community to augment the framework and extend its functionality through Ember
Addons.

For example, if you prefer writing CoffeeScript, all you have to do is to run
`ember install ember-cli-coffeescript` (which installs the package from NPM
under-the-hood), and everything Just Works™ with zero configuration – generators
now spit out CoffeeScript files (even the test files are in CoffeeScript), the
module loader and source maps continues to work as expected, it even sets up
[CoffeeLint](http://www.coffeelint.org/) to replace the default JSHint setup.

Want to use Sass for your CSS? `ember install ember-cli-sass`. Prefer Mocha
over of QUnit? `ember install ember-cli-mocha`. Curious about your code coverage
stats? `ember install ember-cli-blanket`. Need to test your app against multiple
browsers on Sauce Labs? `ember install ember-cli-sauce`. Need a realtime
backend? `ember install emberfire`. What about authentication? `ember install
ember-cli-simple-auth`. Animated transitions? `ember install liquid-fire`.
Wondering about deployment? `ember install ember-cli-deploy`.

In my opinion, this is probably the most important benefit unlocked by EmberCLI.
In less than a year's time, the community has already published [close to 1000 addons](http://www.emberaddons.com/),
with new ones being added daily.

## Big Bet: Future Standards Foresight

<p>
  <a href="/images/posts/2015/05/wycats.png">
    <img class="img-responsive" alt="Yehuda Katz, a JavaScript thought leader" src="/images/posts/2015/05/wycats.png">
  </a>
</p>

It helps to have some JavaScript Thought Leaders™ on your framework's core team.
For example, [Yehuda Katz](https://twitter.com/wycats) happens to be a member on
TC39, which is the committee that is responsible for future versions of the
<del>JavaScript</del>ECMAScript language. He was also on the W3C Technical
Architecture Group, which focus on the larger web platform.

So naturally, you would expect that the core team would make decisions with the
web platform's future roadmap in mind. And they do.

### Promises

One example of this is [Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise).
It almost feels funny to describe Promises as a future technology today, but it
was some pretty cutting edge stuff when they decided to go all-in with promises
across the Ember stack over two years ago.

Let's see some examples.

You probably heard of the Ember Router. This is one of the best things in the
Ember stack. In fact, [the new Angular router](https://github.com/angular/router)
is backed by [the same routing library](https://github.com/tildeio/route-recognizer)
extracted from Ember, and react-router is also [heavily inspired](https://github.com/rackt/react-router#thanks-ember)
by the Ember router.

{% highlight javascript %}
// app/routes/post.js

export default Ember.Route.extend({

  model: function(params) {
    return $.ajax("/posts/" + params.post_id);
  }

});
{% endhighlight %}

This is how you define a route in Ember. You can implement the `model` hook,
which receives the parameters extracted from the URL. If you return a Promise
from this hook, Ember is smart enough to transition the app into a loading
state. When the promise resolves, it will continue loading the route and
rendering its templates; if it rejects, it will transition the app into an error
state.

{% highlight javascript %}
store.find("post", 1).then(function(post) {
  ...
});
{% endhighlight %}

Similarly, Ember Data uses Promises everywhere too. When you try to fetch a
model from your server, it will return a promise as it waits for the response.

By embracing Promises across the stack, Ember can achieve ultimate Synergy™.
Since the Ember Data store returns a Promise and the router expects you to
return one from the `model` hook, the common async operations are very
economical:

{% highlight javascript %}
// app/routes/post.js

export default Ember.Route.extend({

  model: function(params) {
    return this.store.find("post", params.post_id);
  }

});
{% endhighlight %}

In fact, since Ember knows that you are inside the `PostRoute`, and you have a
`Post` model, and you have a `post_id` in your URL param, Ember can basically
figure out what you want to do anyway, so you could have skipped the model hook
altogether if you want:

{% highlight javascript %}
// app/routes/post.js

export default Ember.Route.extend({

});
{% endhighlight %}

Likewise, Ember uses Promises in acceptance tests, since all user interactions
are async in the browser:

{% highlight javascript %}
module('Acceptance: check out', { ... });

test('Express checkout', function(assert) {
  visit('/products/agile-web-development-with-rails')
    .then(function() {
      click('#express-checkout');
    })
    .then(function() {
      fillIn('#login .username', 'godfrey');
      fillIn('#login .secret', 'secret');
    })
    .then(function() {
      click('#login .submit');
    })
    .then(function() {
      var confirmation = find('#notice h3').text();
      assert.equal(confirmation, 'Thank you for your order');
    });
});
{% endhighlight %}

But since Ember has knowledge about the whole stack, it can spare you for those
noisy syntax and just queue them up automatically:

{% highlight javascript %}
module('Acceptance: check out', { ... });

test('Express checkout', function(assert) {
  visit('/products/agile-web-development-with-rails');

  click('#express-checkout');

  fillIn('#login .username', 'godfrey');
  fillIn('#login .secret', 'secret');

  click('#login .submit');

  andThen(function() {
    var confirmation = find('#notice h3').text();

    assert.equal(confirmation, 'Thank you for your order');
  });
});
{% endhighlight %}

Oh. And of course there will be a helpful view in the Ember inspector to help
you track down and debug these promises:

<p>
  <a href="/images/posts/2015/05/ember-inspector-promise.png">
    <img class="img-responsive" alt="Promises in the Ember Inspector" src="/images/posts/2015/05/ember-inspector-promise.png">
  </a>
</p>

### Web Components

If you are not familiar with them, [web components](http://webcomponents.org/)
is basically a set of future APIs to extend the browser's capability by defining
custom elements.

Just like Promises, [web components](http://webcomponents.org/) probably lost
all of its new car smell by now. But just remember, at the time they were
introduced in Ember, this is how you would explain them to your Angular friends:

> *A directive that is restricted to element names with an isolated scope that uses transclusion.*

Because not a lot of browsers actually have support for web components natively,
Ember component is the stand-in for them in the current stack. They are designed
in a way that is conceptually and functionally pretty close to what web
components would look like in the future, so that the Ember version can
[eventually be dropped](https://gist.github.com/wycats/9144666b0c606d1838be)
(warning: 2-year-old link, so the specific details might be inaccurate).

### ES6 (and Beyond)

Ember also bets pretty heavily on the future version of JavaScript. It is
sometimes referred to as ES6 or ES2015.

In fact, Ember CLI apps has been using ES6 modules syntax since day one:

{% highlight javascript %}
// app/models/post.js

import DS from “ember-data”;

export default DS.Model.extend({

  title: DS.attr(“string”),
  body: DS.attr(“string”),
  published: DS.attr(“date”),

});



// test/unit/models/post-test.js

import Post from 'test-app/models/post';

// ...
{% endhighlight %}

Out of the box, Ember CLI also sets up the [Babel ES6 transpiler](http://babeljs.io/),
so most of the Ember community has already been writing the next version of
JavaScript for over half a year.

ES6 also provides (finally) a class system for JavaScript. Historically, Ember
(and almost every other framework) has shipped with its own class system. You
cannot use ES6 classes for Ember objects today, but no worries, it's already [in
the works](https://github.com/emberjs/ember.js/issues/10341). Presumably, the
Ember class system will eventually be retired as the standards add support for
some of the missing features. Conveniently, there is a TC39 member on the Ember
core team, so that makes [things](https://github.com/wycats/javascript-decorators)
a bit easier ;)

But if you are impatient, you don’t even have to wait that long. Since Yehuda's
proposal for JavaScript decorators have already been implemented on Babel, we
can begin experimenting with that today:

{% highlight text %}
> ember install ember-cli-computed-decorators
{% endhighlight %}

That's all you need to do to experiment with the proposed syntax today. It looks
like this:

{% highlight javascript %}
// app/models/user.js

import DS from 'ember-data';
import computed from 'ember-computed-decorators';

export default DS.Model.extend({

  firstName: DS.attr("string"),
  lastName: DS.attr("string"),

  @computed("firstName", "lastName")
  fullName(firstName, lastName) {
    return `${ firstName } ${ lastName }`;
  }

});
{% endhighlight %}

In particular, that line beginning with the @ symbol is the proposed decorators
feature that would allow Ember to eventually use native ES6 classes.

Needless to say, being able to experiment with things like these in real apps
today is tremendously helpful to both the developers and the standards writers
as it allows a much tighter feedback loop to (in)validate ideas and fix any
quirks that could otherwise be hidden until shipped. Synergy™.

## Big Bet: Stability Without Stagnation

<p>
  <a href="/images/posts/2015/05/companies.png">
    <img class="img-responsive" alt="Some serious Ember users" src="/images/posts/2015/05/companies.png">
  </a>
</p>

As we have seen earlier, Ember has a lot of very serious apps running in
production. As you might imagine, these users value stability very highly. At
the same time, you don't want to scarify new features for stability and ended
up falling behind either.

### Release Channels

<p>
  <a href="/images/posts/2015/05/release-channels.png">
    <img class="img-responsive" alt="Ember Release Channels" src="/images/posts/2015/05/release-channels.png">
  </a>
</p>

To solve this problem, the Ember team has modeled their releases after the
Chrome browser. In Ember, there are three release channels that you can
"subscribe" to – the Canary channel, which are nightly builds containing the
latest features; the Beta channel, which are dropped every week or two that are
considered candidates for the next stable release; finally there is the release
channel, this is where you would find the stable releases that comes out every
six weeks or so which are Ready For Production™.

<p>
  <a href="/images/posts/2015/05/release-waterfall.png">
    <img class="img-responsive" alt="Release Waterfall" src="/images/posts/2015/05/release-waterfall.png">
  </a>
</p>

Throughout the year, new features will land on the master branch, which serves
as a basis for the nightly canary builds. All for these new features are added
behind a "feature flag", which allows the new functionality to be toggled
individually at either runtime or build time.

At the beginning of each beta cycle, the core team will review all the new
features that were added behind a flag. Those that are deemed stable enough will
be enabled on the beta build by default. If major regessions are discovered
during the beta cycle, they will be switched off and deferred for future
releases. By the end of the beta cycle, whatever remains on the last beta build
will get released into the stable channel.

Let's look at an example:

1. Handlebars 2.0 and HTMLBars both landed on master recently.

2. After testing them with real apps on the canary channel, the core team give
   these features a "Go" for 1.9 beta.

3. Unfortunately, after a few rounds of beta testing, they discovered the
   HTMLBars feature needs more work to address some edge cases, so they have to
  remove it from 1.9 Beta 4.

4. By the end of the six week cycle, Handlebars 2.0 survived all the beta
   testing and was released with the final 1.9 build (without HTMLBars).

5. At that time, the issues with HTMLBars have been fixed, so the core team
   decided to enable that again for the 1.10 beta series.

6. Fortunately, no major issues are discovered this time, so HTMLBars get
   released as part of Ember 1.10.

Having a rolling release cycle like this (as opposed to pilling a bunch of new
stuff for the major release announced at an annual developer conference) turned
out to be great for everyone: the core team gets a chance to rigorously test new
features, and the users get to benefit from the latest features as soon as they
are ready.

### Semantic Versioning

You might be thinking, "Wow, having to upgrade your app once every six weeks
sucks!". Fortunately for the Ember community, the Ember core team takes Semantic
Versioning very seriously. All the changes made in the 1.x releases are supposed
to be backwards compatible, so in theory, you can upgrade from 1.3 all the way
up to 1.11 with relatively few issues.

The way they do this is to incrementally deprecate things in the framework that
they plan to remove, but they will keep the features (and tests) around for the
entire 1.x series or otherwise shim them with compatibility layers. So while you
are encouraged to resolve these deprecations as soon as possible, you are given
a very long timeframe to do so.

Of course, for Synergy™ points, there is a helpful tab in the inspector to help
you find and fix these deprecation warnings in your app.

<p>
  <a href="/images/posts/2015/05/ember-inspector-deprecations.png">
    <img class="img-responsive" alt="Deprecations in the Ember Inspector" src="/images/posts/2015/05/ember-inspector-deprecations.png">
  </a>
</p>

### RFCs

Another way the Ember team achieve stability without stagnation is to involve
the community throughout the design process with the [Request For Comment](https://github.com/emberjs/rfcs)
process. All major changes to the framework are encouraged to go through this
process. As part of the proposal, the author would have to identify any
backwards-compatibility issues and propose plans to mitigate them. This also
gives the community a chance to raise any concerns with the plans.

The [recent RFC for dropping IE8/9 support](https://github.com/emberjs/rfcs/pull/45)
was a good example. The Ember team proposed to drop support for IE 8/9 in the
next version of Ember, and the community provided feedback on the real-world
useage patterns, which ultimately led to the core team's decision to continue
supporting IE9.

### Does it really work?

All of these might sound too good to be true for a software project as complex
as Ember. So does it really work? I'll let the evidence speak for itself.

First, here are [some happy users](https://twitter.com/search?q=%20upgraded%20ember%20app&src=sprv)
that bragged about their upgrade experience on Twitter. A pretty rare sight on
the Internet.

Then here is a selection of major features that the Ember team has shipped
during the 1.x cycle:

* **Ember 1.2:** Router loading/error substates
* **Ember 1.3:** Router auto location
* **Ember 1.6:** ES6-ify Ember internals
* **Ember 1.7:** Query params, nestable routes
* **Ember 1.8:** Remove metamorph `<script>` tags
* **Ember 1.9:** Handlebars 2.0, Streams
* **Ember 1.10:** HTMLBars, `{% raw %}{{else if}}{% endraw %}`, block params
* **Ember 1.11:** Bound attributes

If you are not already using Ember, the magnitude of these changes might not be
very obvious, so let's see some examples.

#### HTMLBars

In Ember 1.10, the Ember team landed [HTMLBars](https://github.com/tildeio/htmlbars),
which is an entirely new templating engine that replaces Handlebars for Ember
apps.

This is what templates look like in Ember Handlebars:

{% highlight html+handlebars %}
{% raw %}
// app/templates/post.hbs

<h1>{{ post.title }}</h1>

<div {{bind-attr class=":post post.isFeatured:featured"}}>

  {{markdownToHTML post.body}}

</div>
{% endraw %}
{% endhighlight %}

And this is what templates look like in HTMLBars:

{% highlight html+handlebars %}
{% raw %}
// app/templates/post.hbs

<h1>{{ post.title }}</h1>

<div {{bind-attr class=":post post.isFeatured:featured"}}>

  {{markdownToHTML post.body}}

</div>
{% endraw %}
{% endhighlight %}

You probably don't see any differences, because there are none. They literally
completely swapped out the string-based Handlebars engine, with a DOM-based
HTMLBars engine in a minor release, and everything more or less Just Worked™
for everyone.

Most apps ran faster and used less memory, but for the most part, you don't
really care. As a user, you keep doing things the way you are used to, and
things get better under the hood without much involvment from your part.

#### Bound Attributes

Following up with that, in the 1.11 release the Ember team added a new feature
enabled by HTMLBars called bound attributes.

This is what your templates might look like in 1.10:

{% highlight html+handlebars %}
{% raw %}
// app/templates/post.hbs

<h1>{{ post.title }}</h1>

<div {{bind-attr class=":post post.isFeatured:featured"}}>

  {{markdownToHTML post.body}}

</div>
{% endraw %}
{% endhighlight %}

And this is what it would look like in 1.11:

{% highlight html+handlebars %}
{% raw %}
// app/templates/post.hbs

<h1>{{ post.title }}</h1>

<div {{bind-attr class=":post post.isFeatured:featured"}}>

  {{markdownToHTML post.body}}

</div>
{% endraw %}
{% endhighlight %}

Once again, you probably didn't notice any differences, because there are none.
Your existing template just kept working as you would expect. The difference is
that when you run your app in development mode, you'll get a deprecation warning
informing you about a better way to do things.

Historically, Ember requried you to use the `bind-attr` helper to set any
dynamic values on your HTML tags (as seen in the example above). This is due to
the limitations in the string-based Handlebars engine.

With the new HTMLBars engine, Ember have a much easier time doing that for you:

{% highlight html+handlebars %}
{% raw %}
// app/templates/post.hbs

<h1>{{ post.title }}</h1>

<div class="post {{if post.isFeatured 'featured'}}">

  {{markdownToHTML post.body}}

</div>
{% endraw %}
{% endhighlight %}

Much nicer. But remember – you can take your time to do the refactor. The old
`bind-attr` helper will continue to work in the rest of the 1.x releases.

## The Future™

Now that we have a good idea on the state of the union, let's take a quick peek
into the future.

Once again, the JavaScript Thought Leader™ has [something to say](https://twitter.com/trek/status/525374448833413120)
about this:

<p style="text-align: center; font-size: 24px"><em>Eventually all the good ideas will end up in Ember</em></p>

You don't have to look very far for evidence. If you scroll up a little bit, you
will see that one of the features shipped in Ember 1.9 is called "Streams".

If you have heard about that "Reactive Programming" stuff that all the cool kids
are raving about, this is basically that. It turns out that pattern was pretty
useful for implementing template bindings, so the Ember team borrowed that idea
from them and refactored a lot of low-level stuff with it.

You can expect a lot more changes of this nature landing in Ember in the near
future. Here are a few:

### Glimmer

[React](http://facebook.github.io/react/) brought many smart ideas to the table.
The "just rerender it" model and seperation between internal and outside states
turned out to map quite nicely with our mental model and indeed made things a
lot easier to reason about. This is of course enabled by some very smart
technologies under-the-hood, such as Virtual DOM diffing.

In fact, these ideas are so smart that the Ember team seriously considered [just
using React under-the-hood](https://speakerdeck.com/wycats/dont-settle) (slide
35). What came out of that execrise was something even better, dubbed the
[Glimmer](https://github.com/emberjs/ember.js/pull/10501) rendering engine.

I'll leave it to you to read about all its details, the important thing here is
that the team took a lot of time to carefully [study](https://github.com/emberjs/ember.js/pull/10501#issuecomment-75408630)
React and distilled (stole) the best parts from it.

I should also mention that Glimmer has [recently landed on master](http://emberjs.com/blog/2015/05/05/glimmer-merging.html)
and is on track for landing in the next Beta series.

### Fast Boot™, One-way Bindings, Routable Components, etc

During the last two years, the front-end JavaScript community (especially from
the React community) has came up with many other innovative ideas. A lot of
these ideas intersect perfectly with problems that the Ember community was
solving, and they will eventually make their way to Ember similar to the Glimmer
story.

For example, React had a pretty good solution to SEO that is often a problem
for front-end JavaScript apps. Because React uses a Virtual DOM, they have a
relatively easy time running and rendering the initial HTML page on the server.

The Glimmer rendering engine moves Ember to a pretty comparable position,
enabling the [Fast Boot™](http://emberjs.com/blog/2014/12/22/inside-fastboot-the-road-to-server-side-rendering.html)
feature which solves the SEO problem for Ember apps (and then some).

Likewise, one-way bindings (readonly attributes for components by default),
routable components (use components everywhere to replace controllers/views) and
many other similar improvements are coming to Ember in the near future. These
advancements are a result of distilling the collective app-writing experience
from both inside of the Ember community as well as from the wider front-end
JavaScript community, and I think it's safe to say that you should expect a lot
more to come.

### Ember 2.0

You might have heard about this upcoming Ember 2.0 release. That sounds pretty
exciting! What is that about?

Well, let's start by looking at the major features planned for this release:

* <small>*This list is intentionally left blank.*</small>

Huh? No new features?

That's right! The plan is to actually release all the major features in the 1.13
releases, and simply remove all the deprecated features and compatibility layers
in the 2.0 release. Combined with Ember's semantic versioning guarentee, this
means any Ember app that runs fine on the latest 1.13 release (without
deprecations) will be able to upgrade to smoothly upgrade to Ember 2.x.

You can read more about the plans for Ember 2.0 in the [RFC](https://github.com/emberjs/rfcs/pull/15)
and this [blog post](http://emberjs.com/blog/2015/05/10/run-up-to-two-oh.html).

## Conclusions

So, that's Ember.js, *the antidote to your hype fatigue*. It is actually quite
nice to have a very smart and thoughtful team to act as your "hype filter",
knowing that the community will eventually distill these ideas and bring them
into the framework. Personally, this is probably the biggest reason for me to
stick around.

Finally...

<p style="text-align: center; font-size: 24px"><em>Isn’t Ember dead?</em></p>

You be the judge ;)
