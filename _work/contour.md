---
layout:       work
collection:   work
title:        "Contour"
headline:     "We shipped a purchase ordering system with realtime chat in 10 weeks"
thumbnail:    contour.svg
project_link: http://joincontour.com
tags:
- MVP Build
- Development
- Design
---

In the fall of 2015, Vancouver-based Tantalus Labs approached Brewhouse to build Contour, a web-based system that allows cannabis retailers and producers in Washington to discuss and order products in realtime.

Our challenge was to make a compelling product where conventional purchase orders and inventory control would work within a realtime chat-based interface.

Contour is a great example of how products are moving towards ["Conversational Commerce"](https://medium.com/@chrismessina/2016-will-be-the-year-of-conversational-commerce-1586e85e3991) for businesses rather than consumers.

## Technologies

Being a 10 week MVP, the team decided to keep with the Rails development stack and investigate the best way WebSockets could be created to allow realtime conversation. Timeboxed spikes were carried out to investigate ActionCable (Rails 5 alpha at the time) and [Pusher](https://pusher.com/). We found that ActionCable at the time was not stable enough to use in production and it would take time that the client did not have for the team to fix issues.

To avoid the need to build a complex Javascript application on the front end in order to ship the product faster, [Turbolinks](https://github.com/rails/turbolinks) 3 was used to allow fast in-place partial replacement of content. This provided the near instant changes on the interface from messages passed through Websockets.

The use of view templates in this way allowed our team to iterate on views with the client really quickly.

## How We Worked Together

We started the project from a high level view of the milestones. Those milestones were distilled to small areas that could be focussed on during our weekly iterations. At a high level, we split the project into three major milestones: the realtime discussion component, inventory management, and purchase orders.

At the start of every weekly iteration we planned with the client what would be accomplished so that the product owner could prepare any areas of domain knowledge the week ahead.

## Constant Communication

Great software comes from constant discussion with the product owner around all of the features. On this project we used a combination of [Slack](https://slack.com/) and daily standup calls to ensure that everyone was on the same page and no blockers prevented progress.

## Changes of Scope

As with most early products the project started out without a full detailed analysis of all features. [We don't build to spec](https://www.youtube.com/watch?v=essNmNOrQto). To ensure the best possible product can be delivered, we managed the features by [measuring the importance](https://twitter.com/eiriklv/status/688002062429323265) and [the happy path](https://en.wikipedia.org/wiki/Happy_path).

With the client's permission we added 20% more time to the project to account for changes made throughout the project, giving Tantulus Labs the flexibility to add and remove from the scope during the project.

## Fast Feedback

We deployed the application to Heroku from week 1 so that the product features could be tested by the Contour team. This gave them the ability to provide feedback and think further on their future features.
