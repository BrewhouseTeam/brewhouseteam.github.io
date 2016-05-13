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

Goodbits helps companies and individuals build and send email newsletters in minutes by focusing their time on curating content collected automatically from Slack, Twitter, Buffer, RSS feeds, and more. Teams can collaborate in real-time using a beautiful and simple to use drag-and-drop builder.

## Sending Email

One of the main challenges in building Goodbits is maintaining the highest possible levels of email deliverability. We have specialized on the technical challenges of sending email including SPAM algorithms and SPF/DKIM signing of emails. Over the last two years, we have tested and worked with almost every API-driven sending provider out there.

Goodbits also allows users to send with their existing ESP (Email Sending Provider). Our deep integration with [Campaign Monitor](https://www.campaignmonitor.com/) and [MailChimp](http://mailchimp.com/) give us a deep understanding of how these companies construct email templates, manage subscribers, and send the final emails.

## Content Collection

One of the core values of this product is to remove the pain of collecting and curating content. The first MVP we shipped was released with just a simple Chrome extension capturing the largest need from the target market.

The next stage was to build a collection service that could be extended with a limited team and scale on infrastructure that was affordable in the early stages of the product. Our team engineered a feed collection architecture and re-usable code for OAuth connectivity and processing of a link. This method provided fast delivery of API integrations with services like [Slack](https://slack.com/), [Buffer](https://buffer.com/), and [Twitter](https://twitter.com).

## Email Editor & Templates

It's important for brands to have control over the way their emails look and feel. For that reason we built a [WYSIWYG](https://en.wikipedia.org/wiki/WYSIWYG) template designer in Javascript to allow users to see their changes instantly, giving them the ability to design emails to match their brand guidelines.