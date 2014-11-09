---
layout: post
title: "Healthy Codebase and Preparatory Refactoring"
author: "philippe"
category: blog
date: 2014-11-10 8:00
published: true
tags:
  - cleancode
  - development
  - process
  - refactoring
shared_square_image: TODO
shared_description: TODO
---

In a [recent episode of the RubyRogues podcast](http://devchat.tv/ruby-rogues/178-rr-book-club-refactoring-ruby-with-martin-fowler), [Martin Fowler](http://martinfowler.com) and [Jessica Kerr](https://twitter.com/jessitron) literally spoke my mind. They named two concepts that I deeply believe in and care about: Healthy Codebase and Preparatory Refactoring. They expressed them in beautiful words and powerful metaphors, which enable me to share them with you in this article.

After 43 minutes of discussions on the steps of refactoring, Martin introduced the concept of Healthy Codebase.

"*A healthy codebase allows you to keep going fast. You're slowed down by having stuff that's unclear.*", says Martin. *"The analogy is often made between code and writing. And of course, this is part of the theme of [David's RailsConf talk](http://www.confreaks.com/videos/3315-railsconf-keynote-writing-software) that was so controversial, that he thinks of code not as mathematics but as writing. And I'm very much in agreement with him on this. But that has a consequence which says that if code is writing, it means you have to put a lot of effort into making it clear. And ask any good rewriter what they do most of the time, and it's rewriting."*

We have to realise that unclear code slows us down. It is *"an economic judgment"* that code quality results in speed. So the *"Code quality versus Speed"* is a non-sense.

*"Many times, I run into teams that say: 'Management isn't allowing us to do a quality job here because it will slow us down. And we've appealed to management and said we need to put more quality in the code, but they've said no, we need to go faster instead'. And my comment to that is that as soon as you're framing it in terms of code quality versus speed, you've lost. Because the whole point of refactoring is to go faster."*

Martin then illustrates his metaphor of the "Healthy Codebase":

*"If you keep yourself healthy then you'll be able to run faster. But if you just say: 'Well, I want to run a lot so I'm therefore going to run a whole load all the time and not eat properly and not pay attention about this shooting pain going up my leg', then you're not going to be able to run quickly very long. You have to pay attention to your health. And same with the codebase. You have to continuously say: 'How do we keep it in a healthy state?' Then we can go fast, because we're running marathons here with codebases. And if we neglect that internal quality of the codebase, it hits you surprisingly fast."*

So a "Healthy codebase" is a well written codebase that is clean and easy to understand. Keeping a codebase healthy allows us to move fast. But how do we ensure that we take some time to refactor before moving on to the next task? [Charles Max Wood](https://twitter.com/cmaxw) asks this exact question: *"A lot of people pick up TDD and they do red, green and go to the next ticket. How do you get to the point where you actually have [the refactoring step] as part of your workflow and make it automatic?"*

This is where Jessica Kerr jumps in to talk about Preparatory Refactoring and illustrates it with a beautiful metaphor.

*"So, my strategy is before the red test […] I'm going to go refactor the code […] to make the change I want to make really easy. It's like I want to go 100 miles east but instead of just traipsing through the woods, I'm going to drive 20 miles north to the highway and then I'm going to go 100 miles east at three times the speed I could have if I just went straight there. When people are pushing you to just go straight there, sometimes you need to say, 'Wait, I need to check the map and find the quickest route'. The preparatory refactoring does that for me. And plus, it puts the refactoring at the beginning so it's sure to get done."*

Preparatory Refactoring has some great benefits as it makes you go through the following steps:

* 1 - understand the architecture of the code you are about to change
* 2 - plan and design the changes you are about to make
* 3 - refactor the code while you are still in the confortable "green" zone
* 4 - share the code resulting from the refactoring step (it can be reviewed and deployed separately from the new functionality)
* 5 - write the code for the new functionality (it is easy and fast since the codebase is ready for this change)

As Martin describes:

*"[This process] asks you 'What would this code need to look like to make this change I'm about to make simple?' So, you ask yourself that question and then you say, 'Well, can I refactor it to be like that?' and then make the change. And if you can do that, it's almost always going to be faster because in the refactoring step, you're not going to be in debug land. It's a relatively straightforward process. And then you've made the hard part, which is adding the new functionality, a hell of a lot easier."*

I am very grateful to [Martin Fowler](http://martinfowler.com) and [Jessica Kerr](https://twitter.com/jessitron) for expressing Healthy Codebase and Preparatory Refactoring in such beautiful words and powerful metaphors. I hope that they have convinced you to experiment them if you are not already enjoying their benefits.
