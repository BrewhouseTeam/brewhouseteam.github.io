---
layout: post
title: "Introducing Brewhouse's Rails Template"
author: "philippe"
date: 2016-02-01 8:00
published: true
tags:
  - brewhouse
  - rails
shared_description: "The base Rails app we use at Brewhouse to bootstrap a new web app."
---

We've shipped over a dozen Ruby on Rails apps that all share
the same base set of gems and configuration files. In order to save some
time and ensure that our next web apps share a common set of best
practices, we've put together the
[brewhouse-rails-template](https://github.com/BrewhouseTeam/brewhouse-rails-template).

The [brewhouse-rails-template](https://github.com/BrewhouseTeam/brewhouse-rails-template)
is a Ruby on Rails 4.2 application ready to deploy to Heroku with popular gems
configured to work nicely together and a
[self-destroying
script](https://github.com/BrewhouseTeam/brewhouse-rails-template/blob/master/bootstrap)
to
bootstrap your app by renaming all configuration and classes to your application name.

<!-- break -->

## What about generators?

We reviewed the excellent
[Suspenders](https://github.com/thoughtbot/suspenders) gem by Thoughtbot and found
it bundles quite a number of gems we don't use.
Customizing it to suit our needs would have been
quite difficult and maintaining a fork would have been even harder. However, we do 
recommend going through the
[code](https://github.com/thoughtbot/suspenders) as it features a
[lot](https://github.com/thoughtbot/suspenders/blob/master/templates/_javascript.html.erb)
of
[nice](https://github.com/thoughtbot/suspenders/blob/master/templates/disable_xml_params.rb)
[tricks](https://github.com/thoughtbot/suspenders/blob/master/templates/json_encoding.rb)
to get the most out of Rails.

We also experimented with building a [Rails application template](http://guides.rubyonrails.org/rails_application_templates.html) that we could use when creating a new Rails app to set up gems and modify configuration files.
Making an application template turned out to be tedious as
we would write code to inject code into existing code. It's hard to
understand what the template is trying to achieve and the output often
does not look right (wrong indentation etc).
On top of that, the feedback loop is quite slow as we would have to generate a
brand new rails app everytime we made a change. When we started to write specs to test our application template, we decided to take the simpler approach of making a base rails app that we'll keep
updated as new versions of gems get published.

## What's in the box?

A Ruby on Rails 4.2 application ready to deploy to Heroku with popular gems
configured to work nicely together and a `bootstrap` script that takes
care of renaming all configuration and classes to match your application
name.

### The basics

* `devise` with a `User` model setup and mailer previews available at
  `/rails/mailers`
* `simple_form` set up for bootstrap 3
* `virtus` for building
[service objects](http://brewhouse.io/blog/2014/04/30/gourmet-service-objects.html)
* `schema_auto_foreign_keys` for a robust data layer where orphan
  records are not a thing
* `sidekiq` with dashboard at `/sidekiq`
* `bootstrap-sass` with a couple of defaults in `_variables.scss`
* `roadie-rails` to inline css in emails so that GMail picks up the
  styles

### Dev env

* `dotenv-rails` to store config and secrets in env variables
* `letter_opener` to open emails in the browser in dev env
* `factory_girl` with generators integration setup
* `spring` bin-stubs in `./bin` (ProTip: Add `./bin` to your `$PATH`)

### Test

* `rspec` for unit testing
* `cucumber` with `capybara-webkit` and `capybara-screenshot` for
  integration tests
* `simplecov` because test coverage matters

### Production

* `puma` 'cause it's fast
* `rails_12factor` to run the app on Heroku
* `heroku-deflater` to compress assets
* `rollbar` to get notified about errors
* `newrelic_rpm` to monitor performances
* `app.json` to setup free add-ons (rollbar, newrelic, papertrail, etc.), environment variables and run migrations when you deploy to Heroku

## Usage

Assuming you want to create "my-rails-app":

<ol>
  <li>
    <p>Clone the `brewhouse-rails-template` repo:</p>
    <p>
      <code>
        git clone git@github.com:BrewhouseTeam/brewhouse-rails-template.git my-rails-app
      </code>
    </p>
  </li>
  <li>
    <p>Bootstrap your app (rename all configuration and classes to your application name)</p>
    <p>
      <code>
        cd my-rails-app && ./bootstrap my-rails-app
      </code>
    </p>
  </li>
</ol>

## Et voilà! A great Rails app with solid foundations!

We hope you'll find
[brewhouse-rails-template](https://github.com/BrewhouseTeam/brewhouse-rails-template)
to be a solid starting point for your next rails app.

As always, questions, comments, and contributions are more than welcomed.

Happy coding!
