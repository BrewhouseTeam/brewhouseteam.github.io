---
layout:       work
collection:   work
title:        "Retarget Links"
headline:     "We shipped a link shortener MVP in 6 weeks"
thumbnail:    retargetlinks.svg
hero:         retargetlinks-desktop.jpg
ship_date:    March 1, 2014
project_link: http://retargetlinks.com
tags:
- MVP Build
- Development
- Recruitment
---

Retarget Links came to us with an idea: create a shortlink which, when followed, would allow advertisers to neatly retarget ads later based on the link the user had clicked. By inserting a retargeting pixel in the URL shortener's interstitial page, Retarget Links allows advertisers to display 10 banner ads which reinforces their message to their audience.

The idea for Retarget Links was brought to us on a napkin. After measuring the scale required for initial launch using [tool], we built an app with Rails, built in payments with Stripe, and shipped just 6 weeks later allowing TractionConf and others to start using the app.

# Scaling

This type of product could become congested if some popular social media users build and share links. We had to consider the architecture and ensure that the right level of effort was applied during this first build.

We prefer to take a reactive approach with a project like this. Meaning that an acceptable limit is tested but then the growth and current usage is measured to ensure that you can see ahead when more scaling work needs to be performed.

A limit of 200 requests per second was defined and achieved using just 2 Heroku dynos. The application was also served as a horizontally scaling solution so that the product owner can use the Heroku interface to scale the application as they need (database performance could also be increased if needed).

# Heavy iteration

To build an MVP product in this short time frame we had to deploy often. Each feature was developed and deployed when it was completed, leading to testable features daily or even hourly. This allowed the Product Owner to test the features and provide feedback for future features. Meaning time was saved potentially building old product validation thesis.
