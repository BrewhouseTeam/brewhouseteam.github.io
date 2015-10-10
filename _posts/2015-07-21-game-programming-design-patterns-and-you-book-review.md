---
layout: post
title: "Game Design Patterns -- A Book Review"
author: "chuck"
date: 2015-09-25 08:13
tags:
  - software
  - books
  - programming
shared_square_image: http://brewhouse.io/images/posts/2015/10/event-listener-nodes-square.png
shared_description: Into web development? Learn how design patterns used in other fields such as videogame programming can help you.
draft: false
published: true
---

<!-- ![DesignPatternsAnimaion](/images/posts/2015/09/design-patterns.gif) -->

<figure style="display: block; max-width: 100%;height: auto;">
  <iframe style="border: 0" width="100%" height="300" src="https://s3-us-west-2.amazonaws.com/brewhouse-io/blog/cubes.framer/index.html"></iframe>
</figure>
<figcaption>Animation built with <a href="http://framerjs.com/">FramerJS</a>, source code <a href="https://github.com/BrewhouseTeam/cubes-framer">here</a></figcaption>

<br><br>

Programming is one truly interesting skill. Many choose to study it for years in University, while others can pick it up in their spare time simply by reading and completing tutorials online. Learning to build things quickly can be both lucrative and life-improving. However, knowing more of the theory behind programming will help you write great code and comparing your style of programming to others can be a terrific eye-opener.

Over time, as many developers work on a codebase the software will typically suffer from some common problems: tightly coupled code and spaghetti code are recurrent topics amongst developers -- and create messes most will want to avoid.

For the past ten years I’ve been coding professionally, I’ve neglected to spend more time learning the underlying theories behind programming. Always preferring the hungry route of digging into the practical parts of development, blazing ahead while building tools and apps. That was until I took an interest in creating video games, which is when Robert Nystrom’s [Game Programming Patterns](http://gameprogrammingpatterns.com) caught my attention.

<!-- break -->

If you're not familiar with the concept of Design Patterns, they loosely outline various architectural methods you could employ to solve common problems anyone working on software could encounter. One of the more notable collections of Design Patterns is the book [Design Patterns: Elements of Reusable Object-Oriented Software](http://www.amazon.ca/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612) by four authors, appropratiely dubbed the "Gang of Four".

Nystrom has compiled almost twenty of the [Design Patterns](http://www.blackwasp.co.uk/GofPatterns.aspx) written about by the Gang of Four, including some of the more popular ones used today by web developers (**[Event Queue](http://gameprogrammingpatterns.com/event-queue.html)**, **[Service](https://en.wikipedia.org/wiki/Service_layers_pattern)**, **[Dirty Flag](http://gameprogrammingpatterns.com/dirty-flag.html)**, **[Factory](https://en.wikipedia.org/wiki/Factory_method_pattern)**, **[State](https://sourcemaking.com/design_patterns/state)**, **[Observer](http://gameprogrammingpatterns.com/observer.html)** and **[Prototype](https://sourcemaking.com/design_patterns/prototype)**, for instance). They’ve been written from the perspective of how best to organize a video game codebase, though he’s also taken care to craft them so they can be easily digested by programmers of any skill level.

Although a ton of these concepts were new to me, it was the crossover between the two worlds (Web Development, which I know rather will and Videogame Development, which I know nothing about) that I found most interesting. For instance, reading about [the Double Buffer pattern](http://gameprogrammingpatterns.com/double-buffer.html) and how it's used when rendering graphics had clear similarities in my mind to the typical app deployment strategy used by [Capistrano](http://capistranorb.com/) (for running commands on and deploying your web apps to remote servers). Let's dive into some of these comparisons:


<figure style="border: 1px solid #dedede; padding-bottom: 1px; margin-top: 50px;">
  <img src="/images/posts/2015/10/double-buffer-swap-sm.png" />
</figure>

## The Double Buffer Pattern

What is a Buffer?

<blockquote>
  <p>
    “In computer science, a data buffer (or just buffer) is a region of a physical memory storage used to temporarily store data while it is being moved from one place to another.”
    <br><small>Source: <a href="https://en.wikipedia.org/wiki/Data_buffer">Wikipedia</a></small>
  </p>
</blockquote>

In the web app world, we need to deploy our programs to remote servers to run in production mode for any people or other programs to use and abuse. Our tool of choice for this is called Capistrano. When deploying via Capistrano, each release (a snapshot of code at a specific time) is stored in multiple directories on the server. The webserver (Apache, nginx, etc.) points to the `current` symlink on your filesystem, which in turn points to the most recent release directory. This is what's served up to end users on the requesting side. The last step when completing a new deploy is to essentially flick a switch, and direct the `current` symlink from the old, outdated directory to the brand new release directory. Following that the end users will now see the newly updated code coming down from your server.

When rendering graphics for a video game most often you would start by running physics calculations, realizing the new position of entities (bullets, players, etc) in the game's worldspace, then drawing these changes in a new frame for the screen. However, you want to avoid showing this new frame until the physics calculations have completed. Otherwise, you may end up with some entities in the correct locations while others are in incorrect locations, graphics tearing, or worse. Therefore, it's best to be drawing the next frame ahead of time, and storing it in a buffer for later use. Then, when it's done being drawn, you switch the old frame out for the new one.

This bait and switch trick is not only brilliant, but a great solution to a common problem in computing which the Buffer patterns solve eloquently.


## The Command Pattern

<blockquote>
  <p>
    “Commands are an object-oriented replacement for callbacks.”
    <br><small>Source: <a href="http://gameprogrammingpatterns.com/command.html">Game Programming Patterns</a></small>
  </p>
</blockquote>


You've been given the task to create a spreadsheet application, and you're working on the Undo / Redo functionality for this spreadsheet. Or, you're building an turn-based strategy game, and you need an Undo / Redo feature to allow the player to step back in time. I imagine you can already see the correlation between the application world and videogame world here.

Receiving commands from a user, whether to command units to move around a game board or entering a formula into a spreadsheet is a fantastic feature of computers (remember pencils &amp; erasers?). What's needed is the ability to store the history of those commands, queued up in the order they were given. Then, a way of rolling back through each command one by one or all at once.

Nystrom goes into depth on how to implement an Undo / Redo feature using the Command pattern (which he says is one of his favourite patterns), and the pseudocode he's written can be applied in any subfield of computer programming. It's another terrific example of just how transferrable these design patterns are from one area of expertise to another.

<figure style="border: 1px solid #dedede; padding-bottom: 1px; margin-top: 50px;">
  <img src="/images/posts/2015/10/event-listener-nodes-sm.png" />
</figure>

## The Observer Pattern

You're playing a game, and you just found the secret spaceship locale, or killed your billionth goblin (or both, at the same time). A ding sounds, and a message appears to let you know you've unlocked one of those nifty coveted trophies (trophies because I'm a PlayStation fan. Apologies, achievers). The mechanics here require a sort of publish/subscribe system (sometimes shortened to PubSub). This typically involves a section of code in the system broadcasting a message to other parts of the system. The code that sends the message isn't calling another method defined somewhere directly, but rather sends a broadcast on a channel to space to proclaim "this happened!".

Observers, which have been registered ahead of time (usually when the app is initialized), subscribe to specific channels they care about and listen for messages being sent. If a message of interest is heard by the observer, say a bit of code responsible for physics broadcasts a message when the player walks into that secret area, then the observer responds by providing the player with the trophy.

In the past, Rails had a basic observer system built-in. This was typically used for "sweeping" the cache (removing expired cache data). Essentially, when a record was updated in the database, a message was sent out about it and any listening observers would remove the data they had retained about the record's previous version. However, [it was removed](http://blog.remarkablelabs.com/2012/12/observers-gem-extraction-rails-4-countdown-to-2013) along with page and action caching -- You can still [use and install it from here](https://github.com/rails/rails-observers).

I've also heard that the [reactive programming paradigm](https://en.wikipedia.org/wiki/Reactive_programming) relies heavily on Observables, though I have yet to jump into the beauty that is reactive programming.


## Wrapping Up

I'm hoping this has inspired you to dig deeper into programming design patterns, and instilled a deep and loving desire to learn all you can about the world of beautiful software architecture. If not, then that's okay, too.

For more, the book Game Programming Patterns is available for purchase in print, ebook, and pdf from the website: [gameprogrammingpatterns.com](http://gameprogrammingpatterns.com/)

It's also available to read for free online: [gameprogrammingpatterns.com/contents.html](http://gameprogrammingpatterns.com/contents.html)

What are you waiting for? Brush up on or learn some new design patterns now!


