---
layout:       work
collection:   work
title:        "Contour"
headline:     "We shipped a PO system with realtime chat in 10 weeks"
thumbnail:    contour.svg
hero:         contour-desktop.jpg
ship_date:    March 1, 2014
project_link: http://retargetlinks.com
tags:
- MVP Build
- Development
- Design
---

- Getting realtime in the time frame we had
  - Spike around best solution, ActionCable vs Pusher
  - Reuse of view templates so that we didn't have

- Multiple design iterations around the workflow for handling the brokering of purchasing a product

"Conversation commerce" link to article

# How did we work with them

- We were working from a high level view of the milestones we wanted to achieve and focus on as small as possible areas of the product. So for Contour it was splitting the discussion component between retailers and producers and the inventory, purchase order component.
- Weekly planning

## Constant Communication
- Great software comes from an ability to discuss all the features with the product owner
- We kept open a great conversation channel with


## What about scope
- As with most early products the project started out without a full understanding on how the features will work in detail and the number of iterations would take place on an area of the product. So time had to be accounted for this.
- With the client's permission we added 20% of buffer time to allow to account for this. This meant the client had the flexibility to handle

## Fast feedback
- We deployed the application to Heroku from week 1 so that the product features could be tested by the Contour team and give them the ability to provide feedback and think further on their future features.

# What did we learn
We retrospective with every client so that together we can learn what went well and didn't. We found some key things to bring into the next MVP Build project we take on.

- Working on the PO part first, perhaps more design discovery could've mitigated a couple of days where we had to go over that work. We found too late in the project that PO handling was something we needed to.
- To be careful of the use of tooling. We had a slack later service to post messages at a set time, one team member used this to schedule a message 30mins before a meeting that they couldn't attend but this was seen as not personal or almost an excuse as it was posted by a bot.
