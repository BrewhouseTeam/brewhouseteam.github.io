---
layout:    post
title:     "Adapter Patterns in Ember.js"
author:    "godfrey"
category:  blog
date:      2015-03-06 16:00
published: true
tags:
- emberjs
- emberconf
- javascript
- single page application
---

<del>If you couldn't wait for the video to be uploaded,</del> here is a write-up of the
talk I gave at [EmberConf 2015](http://emberconf.com/) earlier this week, sans
the jokes. You can find the slides [here](https://speakerdeck.com/chancancode/hijacking-hacker-news-with-ember-dot-js).
For those at the conference, [the last section](#the-possibilities) has a little
bit of new content that I couldn't fit into original presentation.

<del>This post will be updated with a link to the video when it is available.</del>

Video is live!

<iframe width="560" height="315" src="https://www.youtube.com/embed/PXB93Z8azZE?list=PLE7tQUdRKcyacwiUPs0CjPYt6tJub4xXU" frameborder="0" allowfullscreen></iframe>

* * *

## Real-world Adapters

Suppose you just bought a new vacuum cleaner. As with most modern appliances,
the vacuum cleaner comes with one of those grounded/three-pinned plugs.
Unfortunately, the wiring in your home is a bit dated, and all of the power
outlets are two-pinned. What do you do?

Obviously, you can shell out the money to re-wire your entire house and upgrade
the outlets. While that's probably something you should eventually do, it seemed
like a disproportionate amount of effort just to be able to use a new vacuum
cleaner.

Of course, there is a simpler way – you can just use an adapter. The adapter
would expose a two-pinned plug on one side and a three-pinned socket on the
other, seamlessly bridging the incompatible *interfaces* and allow you to use
the new vacuum cleaner anywhere in your house.

In this case, the adapter is trivial – you could in-theory just tape two cooper
wires to the plug, insert that into the outlet and it would probably still work.

This is not always the case though, sometimes your adapter has to do more work
than that. When Apple rolled out the lightning port on their iDevices, plenty of
their customers have invested in stereo systems that comes with the old 30-pin
dock connector, so they made an adapter for that.

This adapter is more complicated, though. The two ports have vastly different
*specifications* – they speak completely different protocols, and one of them is
even reversible – so a simple re-mapping of the pins just won't cut it. However,
despite those differences, they are *functionally equivilant* for the task at
hand – they are both fully capable of streaming audio from your iDevices to the
stereo systems.

So, what Apple did was that they basically put a mini-computer *inside* the plug
and have it decode protocol messages and dynamically translate them for the
other side. It is an elaborate hack, but it works.

## The Adapter Pattern

The adapter pattern is the software version of these real world adapters.

Suppose your have acquired a sensor that allows you to measure the current
temperature. Unfortunately, the driver is hardcoded to report temperatures in
Celsius codebase you are working with expects Fahrenheit everywhere. What do you
do?

{% highlight js %}
var CelsiusSensor = {
  getTemperature: function() {
    // Measures temperature in °C
  }
};

function FahrenheitMonitor(sensor) {
  setInterval(function() {
    // Expects °F
    if (sensor.readTemperature() > 100) {
      ...
    }
  }, 1000);
};
{% endhighlight %}

Now, you can go ahead and rewrite all those parts of your codebase. Whether that
is a feasible or not depends on the complexity of your existing code, but it is
probably the digital-equivilant of rewiring your house to use a vacuum cleaner.

Alternatively, you can just write an adapter! Just like the real-world adapters,
your adapter code would expose an interface that the consuming end expects, and
internally use another object to fulfill these requests:

{% highlight js %}
function CelsiusSensorAdapter(sensor) {
  this.sensor = sensor;
};

CelsiusSensorAdapter.prototype = {
  readTemperature: function() {
    return this.sensor.getTemperature() * 1.8 + 32;
  }
};

// Use it!
new FahrenheitMonitor( new CelsiusSensorAdapter(CelsiusSensor) );
{% endhighlight %}

## Real-world Adapter Patterns

To show you how this pattern could be applied in the real-world – Ember apps in
particular – I made a Hacker News extension for Chrome. It is [available from the chrome web store](https://chrome.google.com/webstore/detail/hn-reader/emgghjnnkkopedbjfajejpkidaiedhlf),
or you can just [try it online here](http://chancancode.github.io/hn-reader).
You can also [find the source code on GitHub](https://github.com/chancancode/hn-reader).

Once you have it installed, every time you visit [Hacker News](https://news.ycombinator.com/)
from Chrome, the extension will take over and present you with a better reading
interface built with Ember.js.

### Getting The Data

The first challenge for building a HN reader like this is that you would have to
get the data from somewhere. Normally, you would just make calls to an API that
returns the data in JSON format – and this is what Ember Data expects too.

But there are a few problems.

First of all, at the time I started the project, Hacker News does not have an
official API, so I have no server to talk to. (They latter added a Firebase-powered
API, but at the time of writing, it still doesn't offer all the features you
would find on the website, so I wouldn't be able to do everything I wanted to
do with the extension.)

I could use one of the unofficial APIs that others have created. There are a lot
of those, actually, but it is very hard to tell which ones are still maintained
or how reliable they are. They also don't offer all the features you will find
on the web interface, either.

Of course, I can also write my own API, but I am way too lazy for that. All I
want is to have some fun writing the front-end app, and I don't want to have to
write and maintain a server side component.

But there is another way – if you look at the Hacker News website, all the data
I want is already on the page. So, if you can fetch the HTML pages from the
Hacker News server, I can just parse out the data and use them however I want.

In fact, this is just how all the unofficial APIs work. They just have the
server scrape the HTML page, parse out the data on the server-side and send them
back in JSON format.

Since my extension runs in the Hacker News domain, I don’t really need to go
through a server for that – I can just make regular AJAX calls to fetch the HTML
pages, then parse them directly from within the browser.

(You don't actually have to be on the same domain to do this – you can just go
through a [CORS proxy](http://cors-anywhere.herokuapp.com). However, it won't
send along the cookies, so you won't be able to do anything that requires the
user to be authenticated.)

That’s exactly what I did.

{% highlight js %}
$.get("/news").then( function(html) {
 
  var stories = [];
 
  $(html).find("tr .title a").each( function (_, $link) {
 
    stories.push({
      title: $link.text(),
      url:   $link.attr('href')
    });

  });
 
  ...

  return stories;
 
});
{% endhighlight %}

As you can see, I first make an AJAX request to retrieve the HTML page, then run
it through an HTML parser and extract the elements I need to build the JSON
representation of the data I am interested in.

(I should warn you that this is pseudo/simplified code. The code snippets in the
slides and this blog post are meant to show you the key ideas, but they are not
complete and/or safe, so you should always refer to the [actual code on GitHub](https://github.com/chancancode/hn-reader)
if you are interested in implementing them.)

Now that we have the JSON data, it would be nice if there is a good way to store
them locally and use them in the app.

Of course, in the Ember world, the answer for that is to use Ember Data. But
since Ember Data is meant for fetching JSON data from APIs, it can’t possibly
work with crazy hacks like this, right?

Well, that might have been true a year or two ago. Today’s Ember data is very
much just a local object store for your model data, and it makes very few
assumption about where your data are coming from and how you are fetching them.

Out of the box, it does expect your data source to be a JSON API that behave
according to some specification. If your API happens to tick all the boxes, you
can just plug it in and everything would Just Work™.

However, if your API doesn’t work exactly like Ember Data expect, or in my case,
if your data source isn’t even an API at all, it doesn’t mean you are out of
luck.

From Ember Data’s perspective, all it needs is a data source – something that
can provide it with the right data at the right time. All you have to do is to
drop an adapter between them to help them talk to each other. This in such a
common pattern that Ember data already has built-in support for it via the
`DS.Adapter` and `DS.Serializer` classes:

{% highlight js %}
App.StoryAdapter = DS.Adapter.extend({
 
  findAll(store, type, id) {
    return $.get("/news");
  }
 
});

 
App.StorySerializer = DS.Serializer.extend({
 
  extractArray(store, type, payload) {
    var stories = [];

    $(payload).find("tr .title a").each( ... );

    return stories;
  }
 
});
{% endhighlight %}

Without getting into too much details, the adapter is responsible for fetching
the data from the server, and the serializer is responsible for interpreting the
data and massage them into the right shape for Ember data.

([Igor Terzic](https://twitter.com/terzicigor) did a workshop on Ember Data
adapters at Ember Conf, so if you are interested in learning more, you might
want to reach out to see if he has plans to do that again sometime.)


### Fixing the URLs

If you are familiar with Ember, you probably know that it has strong opinions
and conventions around how you should structure your URLs.

For a page like [this](http://chancancode.github.io/hn-reader/item?id=9158222),
you would probably have a URL structure that resembles this:

{% highlight text %}
/                                      |  The application route (the "gutter" on the left)
                                       |
/stories                               |  The sidebar that shows the list of stories
                                       |
/stories/:story_id                     |  The header on the main content panel on the right
                                       |
/stories/:story_id/{article,comments}  |  The content of the article/comments tab
{% endhighlight %}

The router API does offer you some flexibility to control how you want to name
each of these segments, but in general, you need to have one segment per nested
outlet, and you can’t deviate too far from that before you feel that you are
just managing everything yourself and fighting the framework a lot.

This is a perfectly reasonable design, and it works great for 99% of the things
you would want to build. However, in this case, my extension needs to maintain
100% compatibility with Hacker News’ existing URL structure, or else it would
break when my users try to visit a Hacker News link from elsewhere, or when they
try to share a link with other people.

To give you an idea, here are some of the URLs I have to work with. On the left
is the “ideal” URL structure for the Ember router, based on the nesting in the
UI; on the right are the actual URLs for the equivalent pages on the Hacker News
website:

{% highlight text %}
“IDEAL” URL                                  |  ACTUAL URL
---------------------------------------------+---------------------------------------------
                                             |
/stories                                     |  /news
                                             |
/stories?filter=latest                       |  /newest
                                             |
/stories/9132815/comments                    |  /item?id=9132815
                                             |
/stories/9132815/comments?highlight=9133317  |  /item?id=9133317
{% endhighlight %}

You probably saw this coming – I can just write an adapter for this!

On one hand we have the Hacker News URLs, and on the other hand we have the
Ember router, and we an adapter in between – this much should be obvious.

What is not obvious though, is *where* we would put that adapter and what it
would look like. It would help if we take a step back consider what’s the actual
role of these URLs in an Ember app.

If you think about it, URLs is really just a way for Ember app to serialize the
current state of the application. When you first open the app, Ember will
deserialize the initial state from the URL and show the right things on the
screen. As you use the app, Ember will keep updating the URLs, so that the
application states are persisted across refresh, back buttons and so on.

With that in mind, the thing we need to adapt should become more clear. What I
actually want to do here is to influence how Ember reads and writes these
states, and from there I can trick Ember into seeing different URLs than what is
actually shown to the user.

As it turns out, I am once again, not alone in solving this problem. Ember
already support two ways to read and write the URLs out-of-the-box: the “normal”
URLs using the history API, and the hash URLs to support older browsers:

{% highlight text %}
HISTORY LOCATION                             |  HASH LOCATION
---------------------------------------------+----------------------------------------------
                                             |
/stories                                     |  #/stories
                                             |
/stories?filter=latest                       |  #/stories?filter=latest
                                             |
/stories/9132815/comments                    |  #/stories/9132815/comments
                                             |
/stories/9132815/comments?highlight=9133317  |  #/stories/9132815/comments?highlight=9133317
{% endhighlight %}

To support these two types of URLs, Ember is once again using the adapter
pattern. These two mechanisms are encapsulated inside the `HistoryLocation` and
`HashLocation` classes, which expose a uniform interface to the rest of the
stack regardless of which concrete implementation is being used.

This is great news, because I can just as easily write my own adapter, too!

{% highlight js %}
App.HackerNewsLocation = Ember.HistoryLocation.extend({
 
  getURL: function() {
    var actualURL = this._super();

    switch( actualURL ) {

      case "/news":
        return "/stories";

      case "/newest":
        return "/stories?filter=latest";

      ...
    }
  },
 
  formatURL: function( logicalPath ) {
    switch( logicalPath ) {

      case "/stories":
        return "/news";

      case "/stories?filter=latest":
        return "/newest";

      ...
    }
  }

});

App.register("location:hacker-news", App.HackerNewsLocation);
 
App.Router.reopen({
  location: "hacker-news"
});
{% endhighlight %}

Because Ember already has to support the two different URL types across the
entire stack, once I implemented this adapter correctly, everything Just Works™
– for example, when you generate a link using the `{{ link-to ... }}`
handlebars helper, Ember would first call `formatURL` to before putting it
into the href attribute of the `<a>` tags, so that when a user command-click on
a link to open it in a new tab, they will end up at the right place.

To be honest, I am a little surprised by how well this worked out, given that
I am probably the only one who uses the location adapters this way.

This is a great testament to the power of the adapter pattern. By slicing things
at the right boundary of abstraction, your code can work seamlessly with use
cases that you haven’t even dreamed of when you wrote the original code.

### Storing User Preferences

The last challenge that I want to talk about briefly is storing the user's
preferences.

There is a little trick I would like to show you: open [this page](http://chancancode.github.io/hn-reader/preferences)
on two different tabs/windows, and then a long discussion thread on another. Try
changing the "Folding Threshold" slider – you will notice that the value updates
instantly in the other preferences tab/window, and the comments thread would
re-render accordingly to reflect that setting.

While this is probably not a very useful feature, it is in fact solving a real
problem.

What I really want to accomplish is to store the preferences in a way that is
persisted across browser sessions. Naturally, I turned to the [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
API for this. The problem, is that I also want to observe/bind to these values
in my Ember app, so that I can use them in my handlebars templates, computed
properties, and so on.

In Ember apps, the data binding functionality is provided by `Ember.Object`, or
more accurately the `Ember.Observable` mixin that is included in `Ember.Object`.

If we put the two APIs side-by-side, you might notice some similarities:

{% highlight text %}
LOCAL STORAGE                        |  Ember.Observable
-------------------------------------+-------------------------------------
                                     |
localStorage.getItem("key");         |  obj.get("key");
                                     |
localStorage.setItem("key", value);  |  obj.set("key", value);
                                     |
$(window).on("storage", ...);        |  obj.addObserver( ... );
{% endhighlight %}

This seems like a textbook example for the adapter pattern:

{% highlight js %}
App.LocalStorage = Ember.Object.extend({

  init: function() {
    $(window).on("storage", Ember.run.bind(this, "_onStorageEvent") );
  },

  unknownProperty: function(key) {
    return localStorage.getItem(key);
  },

  setUnknownProperty: function(key, value) {
    localStorage.setItem(key, value);
    return true;
  },

  _onStorageEvent: function(e) {
    this.notifyPropertyChange(e.key);
  },

  willDestroy: function() {
    $(window).off("storage");
  }

});
{% endhighlight %}

Indeed, all I have to do is to write an adapter that exposes the same interface
as an `Ember.Object` (`Ember.Observable`), with that, the rest of the Ember
is able to bind and observe its values as usual.

(See [this blog post](https://medium.com/the-ember-way/metaprogramming-in-emberjs-627921395299)
for in in-depth explanation. My [full implementation](https://github.com/chancancode/hn-reader/blob/master/app/initializers/03-preferences-store.js)
also added a caching layer to improve performance.)

## The Possibilities

With these examples, I hope I have showed you the power of the adapter pattern.
I think this is an important pattern to consciously learn when you are using a
full-stack framework like Ember and Rails.

A lot of people will tell you that a set of small, composable libraries is
better than an opinionated framework, because when your constraints doesn’t line
up perfectly with the framework’s choices, you are basically out of luck.

I think this is not necessarily true. When using your own set of libraries, you
basically have to implement all the adapters to glue together all the individual
components yourself. On the other hand, a well-designed framework like Ember and
Rails is basically just a curated set of libraries that work together seamlessly
out-of-the-box. If something doesn't work for you out-of-the-box, you can just
replace those parts and drop in a custom adapter or two.

I hope that you can also see past the examples and use cases I've shown here.

Perhaps you have an existing content site and you are considering doing a
redesign in Ember.js. Maybe you can consider writing a quick scraper adapter for
your prototype, instead of bothering the backend team to implement a full-blown
JSON API on day one?

Suppose you are building a presentation software that has a presenter display
component and the full-screen slides in two separate windows. If you recognize
that the URLs are just a way to track the current application state, perhaps you
could [implement a `LocationAdapter` backed by `localStorage`](http://emberjs.jsbin.com/luxivi?id=demo#/present)
to keep everything in sync?

Once you are down the path of enlightenment, the possibilities are endless.

(Thank you EmberConf organizers, volunteers, speakers and attendees for the
amazing conference! <3 <3 <3 <3 <3)

## Hire Us!

Interested in Ember.js training for your team? Need help building your next
*ambitious* web application? [Get in touch](http://brewhouse.io/#hire-us)!

P.S. If you are in Vancouver, join us at our regular [Ember meetups](http://meetup.com/Vancouver-Ember-js/)!
