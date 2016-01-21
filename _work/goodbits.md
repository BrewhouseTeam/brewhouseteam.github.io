---
layout:       work
collection:   work
title:        "Goodbits"
headline:     "We built Goodbits to help content curators share the best content in the world."
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

# Sending email

A large part of this product is understanding how to achieve the best possible email deliverability. We've had to specialize on all technical concepts that relate to sending email such as SPAM algorithms, SPF/DKIM signing of emails. We've probably tested and worked with all different API driven sending providers.

Goodbits allows users to send with their existing ESP (Email Sending Provider), to do this we've worked deeply with [Campaign Monitor](https://www.campaignmonitor.com/) and [MailChimp](http://mailchimp.com/) APIs. Understanding how they construct their email templates, manage subscribers and send the final emails.

# Content Collection

One of the core values of this product is to remove the pain of collecting and managing their content. The MVP that was first shipped was released with just a chrome extension capturing the largest need from the target market.

The next stage was to build a collection service that could be extended with a limited team and scale on infrastructure that was affordable in the early stages of the product. To do this the team engineered a feed collection architecture and re-usable code for OAuth connectivity and processing of a link. This method provided fast delivery of API integrations with services like [Slack](https://slack.com/), [Buffer](https://buffer.com/) and [Twitter](https://twitter.com).

# Email editor & Templates

Every email should unique an feel like a company or individuals brand. For that reason work was carried out in the product to allow multiple templates and modification of the design of those templates. A [WYSIWYG](https://en.wikipedia.org/wiki/WYSIWYG) "Designer" was built in Javascript to allow the user to see their changes instantly allowing them to construct their template quickly and elegantly.
