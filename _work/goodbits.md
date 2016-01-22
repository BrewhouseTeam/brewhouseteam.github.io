---
layout:       work
collection:   work
title:        "Goodbits"
headline:     "We built Goodbits to help content curators share the best content in the world"
thumbnail:    goodbits.svg
hero:         goodbits-desktop.jpg
project_link: http://goodbits.io
tags:
- Design
- Development
- Product Management
---

Goodbits is a product we develop and maintain alongside our client work.

It allows users to build email newsletters in minutes by focusing their time on collecting content through automatic collection, team members or a chrome extension.

## Sending Email

A large part of this product is understanding how to achieve the best possible email deliverability. We've had to specialize on all technical concepts that relate to sending email such as SPAM algorithms and SPF/DKIM signing of emails. At this point, we have tested and worked with almost every API-driven sending provider out there.

Goodbits allows users to send with their existing ESP (Email Sending Provider). To do this we've worked deeply with [Campaign Monitor](https://www.campaignmonitor.com/) and [MailChimp](http://mailchimp.com/) APIs, gaining a deep understanding of how these companies construct email templates, manage subscribers, and send the final emails.

## Content Collection

One of the core values of this product is to remove the pain of collecting and managing content. The first MVP we shipped was released with just a simple Chrome extension capturing the largest need from the target market.

The next stage was to build a collection service that could be extended with a limited team and scale on infrastructure that was affordable in the early stages of the product. Our team engineered a feed collection architecture and re-usable code for OAuth connectivity and processing of a link. This method provided fast delivery of API integrations with services like [Slack](https://slack.com/), [Buffer](https://buffer.com/), and [Twitter](https://twitter.com).

## Email Editor & Templates

It's important for brands to have control over the way their emails look and feel. For that reason we built a [WYSIWYG](https://en.wikipedia.org/wiki/WYSIWYG) template designer in Javascript to allow users to see their changes instantly, giving them the ability to design emails to match their brand guidelines.