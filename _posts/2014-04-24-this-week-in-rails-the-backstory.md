---
layout:    post
title:     "This Week in Rails: the Backstory"
author:    godfrey
category:  blog
date:      2014-04-24 09:04
published: true
tags:
  - rails
---

<p>
  <a href="http://brewhouse.io{{ page.url }}">
    <img class="img-right img-responsive" alt="This Week in Rails Logo" src="/images/2014-04-24-this-week-in-rails-backstory.jpg">
  </a>
</p>

I recently started a newsletter called [*This week in Rails*](http://rails-weekly.goodbits.io)
(you may have [heard](http://ruby5.envylabs.com/episodes/495-episode-458-april-22nd-2014#story-3)
about it) – a weekly digest of notable commits, issues, pull-requests and other
interesting things happening around the Rails ecosystem. I'd like to share my
motivations behind the newsletter and some of the things I've learned along the way.

## Knowledge Sharing

My biggest goal of the newsletter is to share knowledge. Since I [joined](https://twitter.com/bitsweat/status/413014212303024128)
the Rails committer team last year, I had the opportunity to follow the
development of Rails very closely. This helped me to gain a much better
understanding of the tools I use at work and greatly enhanced my productivity.
It also forced me to read a lot of code written by other people, which is a
great way to learn and improve my craft as a programmer.

Despite the tremendous benefits, following a project as large as Rails could be
quite overwhelming. On average, I receive about 40 email notifications from
GitHub every day, most of them from new comments on issues and pull-requests.
At times, it could also be quite difficult to understand the background of a
commit or pull-request just by reading the code.

In my newsletter I attempt to unlock these learning opportunities for more
people by filtering out most of the noise and presenting the tidbits in an
easy-to-digest format. I also try to provide a little bit of background to help
my readers understand the context of the code.

## Highlighting & Encouraging Contributions

If you aren't paying close attention, you often only hear about the shiniest new
features on every major/minor release of Rails. However, open-source work is all
about the non-shiny, seemingly unimportant changes. Every week there are
countless individual contributors pouring hours upon hours of their personal
time to quietly improve rails – one bug report, one bug fix, one
documentation change, one small feature at a time. The stability you enjoy on
Rails today is a battle fought and won by [literally thousands](http://contributors.rubyonrails.org/)
of nameless heroes.

By highlighting these smaller patches in my newsletter, my goal is to demystify
the process of contributing to Rails and hopefully encourage more contributions
(to Rails and other open-source projects) over time.

## Dogfooding

I am also a big believer of [eating your own dogfood](http://en.wikipedia.org/wiki/Eating_your_own_dog_food).
At Brewhouse, we are working on an in-house product called [Goodbits](https://goodbits.io/?utm_source=brewhouse-blog-backstory)
(you can read more about it [here](http://blog.goodbits.io/2014/04/15/we-built-goodbits/)).
The Rails newsletter gave me the perfect opportunity to use the product the same
way our customers would. This is a great way to learn about the need of our
customers needs and experience the quirks in the product first-hand.

This effort has already paid off a few times by now. As an example, one of the
early issues of my newsletter tipped off the wrong wires inside Gmail's spam
filter and never made it to my subscribers' inbox. After a lot of
trial-and-error, we determined that it was because I hotlinked my custom logo
image from a public Dropbox folder. Following our findings, we implemented a
more robust image hosting solution before we officially rolled out the custom
logo feature for our customers.

## The Results

The newsletter has been very well-received. In the span of a few weeks, over 450
readers subscribed to my newsletter. Except for the one issue that went into the
spam folder, the newsletter had consistently logged an open rate of over 80% and
over 40% click rate. (This is [well above](http://mailchimp.com/resources/research/email-marketing-benchmarks/)
typical "marketing" emails.)

To be honest, this completely exceeded any expectations I had when I started
this as a [Friday afternoon project](http://brewhouse.io/2014/04/04/welcome-to-brewhouse.html#staying-creative).
While not very "sexy", it turns out that email newsletters could be a very
powerful medium to engage with your readers.

If you haven't already, you should [check out my newsletter](http://rails-weekly.goodbits.io/archive)
and consider [subscribing](http://rails-weekly.goodbits.io)! Got some
interesting niche content to share with your customers, coworkers or your
community? Give [Goodbits](https://goodbits.io/?utm_source=brewhouse-blog-backstory)
a spin and let us know what you think!
