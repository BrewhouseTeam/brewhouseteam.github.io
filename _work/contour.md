---
layout:       work
collection:   work
title:        "Contour"
headline:     "We shipped a PO system with realtime chat in 10 weeks"
thumbnail:    contour.svg
hero:         contour-desktop.jpg
project_link: http://retargetlinks.com
tags:
- MVP Build
- Development
- Design
---

We were privileged to work with the Contour team in Vancouver to build and ship their MVP.

Contour required a web based product to allow cannabis retailers and produces in Washington to discuss products and purchase them in realtime.

Our challenge was to make a compelling product where conventional purchase orders and inventory control would work with a realtime chat based interface.

Contour is a good example of how products are moving towards a ["Conversational Commerce"](https://medium.com/@chrismessina/2016-will-be-the-year-of-conversational-commerce-1586e85e3991) for businesses rather than consumers.

# Technologies

Being a 10 week MVP, the team decided to keep with the Rails development stack and investigate the best way WebSockets could be created to allow realtime conversation. Time boxed spikes were carried out to investigate ActionCable (Rails 5 alpha at the time) and [Pusher](https://pusher.com/). It was found that ActionCable at the time was not stable enough to use in production and it would take time for the team to fix issues that the client did not have.

To reduce the need of having a complex Javascript application on the front end and ship the product faster, [Turbolinks](https://github.com/rails/turbolinks) 3 was used to allow fast in place partial replacement of content. This provided the near instant changes on the interface from messages passed through Websockets.

The use of view templates in this way allowed the team to iterate on views with the client faster.

# How did we work with them

We started the project from a high level view of the milestones. Those milestones were distilled to small areas that could be focussed on. For this project it was splitting the realtime discussion component and the inventory, purchase order component.

At the start of every weekly iteration we planned with the client what would be accomplished so that the product owner could prepare any areas of domain knowledge the week ahead.

## Constant Communication

Great software comes from the ability to discuss all the features with the product owner constantly. On this project we used a combination of [Slack](https://slack.com/) and daily standup calls to ensure that everyone was on the same page and no blockers prevented progress.

## Changes of scope

As with most early products the project started out without a full detailed analysis of all features. [We don't build to spec](https://www.youtube.com/watch?v=essNmNOrQto). To ensure the best possible product can be delivered, we managed the features by [measuring the importance](https://twitter.com/eiriklv/status/688002062429323265) and [the happy path](https://en.wikipedia.org/wiki/Happy_path).

With the client's permission we added 20% of extra time to allow to account for further changes during the project. This meant the client had the flexibility to add and remove from the scope during the project.

## Fast feedback

We deployed the application to Heroku from week 1 so that the product features could be tested by the Contour team. This gave them the ability to provide feedback and think further on their future features.
