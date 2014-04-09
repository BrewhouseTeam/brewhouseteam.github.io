---
layout:    post
title:     "What's new in Rails 4.1"
author:    godfrey
published: true
category:  blog
date:      2013-12-17 10:32:40
counturl:  http://coherence.io/blog/2013/12/17/whats-new-in-rails-4-1.html
tags:
  - ruby
  - rails
  - rails 4.1
---

<blockquote><em>This was originally published on the Coherence blog on December 17th, 2013. It has been migrated here for historical purposes.</em></blockquote>

In case you haven't been paying attention, Rails 4.1 beta [was released today][weblog-post]!
While this is a minor release, there are still plenty of handy new features
that's worth getting excited about. Here are a few of my favourites, along with
some thoughts on why I think they are useful.

(This post is based on my lightning talk at [#VANRUBY][vanruby], the original
slides can be found [here][slides].)

Action Mailer Previews
----------------------

Testing email templates in Rails has always been pretty painful. My current
workflow involves:

1. Make changes to the email template
2. Deliver the email via the rails console
3. Check the output in the browser
4. Rinse and repeat

The [Letter Opener][letter-opener] gem makes this easier, but this is still far
from ideal. Fortunately for us, [@pixeltrix](https://github.com/pixeltrix) did
the hard work to integrate the [MailView][mail-view] gem into Rails 4.1. You
can now easily create previews for your mailers and view them in the browser
from `http://localhost:3000/rails/mailers`:

{% highlight ruby %}
# In /test/mailers/previews/notifier_preview.rb
class NotifierPreview < ActionMailer::Preview
  def welcome
    # Mock up some data for the preview
    user = FactoryGirl.build(:user)

    # Return a Mail::Message here (but don't deliver it!)
    Notifier.welcome(user)
  end
end
{% endhighlight %}

It should be noted that although the preview files live under the test
directory by default (which can be changed via `config.action_mailer.preview_path`),
it is actually run inside the development environment. So if you need to use
gems like `FactoryGirl` to generate fake data, you'll need to make sure they
are added to the development group in your Gemfile as well.

If your app doesn't currently have a `test` folder (i.e. `rspec` users), it
might be tempting to change the default `config.action_mailer.preview_path`
to something like `/app/mailer/previews`. However, please be aware that the
`/app` folder is eager-loaded in production, so that's probably not the best
place to put these preview files.

Read more about this feature:

* [Release notes](http://edgeguides.rubyonrails.org/4_1_release_notes.html#action-mailer-previews)
* [Documentation](http://edgeapi.rubyonrails.org/classes/ActionMailer/Base.html)
* Pull request: [#13332](https://github.com/rails/rails/pull/13332)

Active Record Enums
-------------------

Have you ever used multiple `boolean` columns to compose a single complex state
on your models? I've definitely done this before and things get out of
hand really quickly.

Enums to the rescue!

{% highlight ruby %}
class Bug < ActiveRecord::Base
  # Relevant schema change looks like this:
  #
  # create_table :bugs do |t|
  #   t.column :status, :integer, default: 0 # defaults to the first value (i.e. :new)
  # end

  enum status: [ :new, :assigned, :in_progress, :resolved, :rejected, :reopened ]

  belongs_to :assignee, class_name: 'Developer'

  def assignee=(developer)
    if developer && self.new?
      self.status = :assigned
    else
      self.status = :new
    end

    super
  end
end

Bug.resolved           # => a scope to find all resolved bugs

bug.resolved?          # => check if bug has the status :resolved

bug.resolved!          # => update! the bug with status set to :resolved

bug.status             # => a symbol describing the bug's status

bug.status = :resolved # => set the bug's status to :resolved
{% endhighlight %}

Internally, these states are mapped to integers in the database to
save space. It's also worth mentioning that the methods added by the `enum`
macro are mixed-in via a module. This means you can easily override them in
your model and use `super` to reach the original implementation.

There are a few caveats you should keep in mind when using this feature:

__I__. Despite its name, this feature doesn't actually use the `ENUM` type that is
   implemented in certain databases. The mapping between states
   and their corresponding integers are maintained in the Ruby model file.
   This means that you should not change the order of the `enum` symbols once
   they are added. To remove unused states, you can use an explicit mapping:

{% highlight ruby %}
class Bug < ActiveRecord::Base
  enum status: {
    new: 0,
    in_progress: 2,
    resolved: 3,
    rejected: 4,
    reopened: 5
  }
end
{% endhighlight %}

__II__. Avoid using the same names inside different enums in the same class!
   Doing so will leave Active Record very confused!

{% highlight ruby %}
class Bug < ActiveRecord::Base
  enum status: [ :new, ... ]
  enum code_review_status: [ :new, ... ] # WARNING: Don't do this!
end
{% endhighlight %}

__III__. If you need to write custom scopes to query the enum columns, you would have
   to pass the integers instead of the symbols. You can access the enum-integer
   mapping via a constant added by the macro:

{% highlight ruby %}
class Bug < ActiveRecord::Base
  scope :open, -> {
    where('status <> ? OR status <> ?', STATUS[:resolved], STATUS[:rejected])
  }
end
{% endhighlight %}

__IV__. Currently, the dirty tracking methods (e.g. `status_was?`) have not been
   updated to work with enums yet (they currently return the mapped integer
   instead of the symbols). This should be fixed before the final release. (See
   [#13267](https://github.com/rails/rails/pull/13267) for the progress.)

Read more about this feature:

* [Release notes](http://edgeguides.rubyonrails.org/4_1_release_notes.html#active-record-enums)
* [Documentation](http://edgeapi.rubyonrails.org/classes/ActiveRecord/Enum.html)
* Original commit: [db41eb8a](https://github.com/rails/rails/commit/db41eb8a6ea88b854bf5cd11070ea4245e1639c5)

Action Pack Variants
--------------------

As web developers, we are well aware that we have fully transitioned into the
[post-PC era][post-pc-era]. As much as I love [responsive design][responsive-design],
it is not a silver bullet for the multi-device web. In many cases, it is more
appropiate to tailor your views to serve the most relevant content and workflow
for specific device categories.

With **Action Pack Variants**, this will become much easier in Rails 4.1:

{% highlight ruby %}
class ApplicationController < ActionController::Base
  before_action :detect_device_variant

  private

    def detect_device_variant
      case request.user_agent
      when /iPad/i
        request.variant = :tablet
      when /iPhone/i
        request.variant = :phone
      end
    end
end

class PostController < ApplicationController
  def show
    @post = Post.find(params[:id])

    respond_to do |format|
      format.json
      format.html               # /app/views/posts/show.html.erb
      format.html.phone         # /app/views/posts/show.html+phone.erb
      format.html.tablet do
        @show_edit_link = false
      end
    end
  end
end
{% endhighlight %}

This example sets up a `before_action` filter to match the `User-Agent` HTTP
header against certain keywords, and assign the `request.variant` accordingly.
By specifying the supported variants in the `respond_to` block, Rails will
render the appropiate template for the specific format and variant combination.
It also allows you to run additional variant-specific code by passing a block.

In fact, you can even skip the declaration - if you have the appropiate
template in your `views` directory, Rails will automatically pick it up. On the
other hand, if a variant does not have a specialized template, Rails will
fallback to the default template for the format (i.e. `show.html.erb`). This
allows you to share a template between two variants. In this example, the
`tablet` variant will reuse the default template if `/app/views/posts/show.html+phone.erb`
is absent.

Although most examples use the `User-Agent` header to showcase this feature,
it's worth noting that the actual implementation in Rails is completely
agnostic from that. `request.variant` can be assigned any time before the
template is rendered based on arbitrary conditions, such as the request
(sub)domain, HTTP headers, session data, or even the result of a coin flip.

This makes the feature very flexible, and can potentially be used for many
things such as API versioning, A/B testing, or even feature rollouts!

Read more about this feature:

* [Release notes](http://edgeguides.rubyonrails.org/4_1_release_notes.html#variants)
* [Documentation](http://edgeapi.rubyonrails.org/classes/ActionController/MimeResponds.html#method-i-respond_to)
* Pull requests: [#12977](https://github.com/rails/rails/pull/12977), [#13290](https://github.com/rails/rails/pull/13290)

Application Message Verifier
----------------------------

Rails 4.1 also included a built-in helper to generate signed messages with
[HMAC][hmac]. The message verifier was previously used to power things like
signed cookies, but it is now much easier to use it for other purposes.

For example, you can implement a stateless "reset password" feature without
having to store any tokens in the database:

{% highlight ruby %}
class User < ActiveRecord::Base
  class << self
    def verifier_for(purpose)
      @verifiers ||= {}
      @verifiers.fetch(purpose) do |p|
        @verifiers[p] = Rails.application.message_verifier("#{self.name}-#{p.to_s}")
      end
    end
  end

  def reset_password_token
    verifier = self.class.verifier_for('reset-password') # Unique for each type of messages
    verifier.generate([id, Time.now])
  end

  def reset_password!(token, new_password, new_password_confirmation)
    # This raises an exception if the message is modified
    user_id, timestamp = self.class.verifier_for('reset-password').verify(token)

    if timestamp > 1.day.ago
      self.password = new_password
      self.password_confirmation = new_password_confirmation
      save!
    else
      # Token expired
      # ...
    end
  end
end

class Notifier < ActionMailer::Base
  def reset_password(user)
    @user = user
    @reset_password_url = password_reset_url(token: @user.reset_password_token)
    mail(to: user.email, subject: "Your have requested to reset your password")
  end
end
{% endhighlight %}

That way, everything that is required to fufill the password reset request is
included in the link, nothing need to be stored in the database. This can also
be used for things like `OAuth` (the `state` parameter).

When using this feature, it is important to conisder possible [replay attacks][replay-attack].
In the example above, if we did not include a timestamp to check for expiration,
the same URL can be used to reset the user's password at any time if the email
ended up in the wrong hands!

Also, the key used to sign the message is derived from your application's
`secret_key_base` and the "salt" you passed (`"User-reset-password"` in the
example). Changing either will invalidate any previously signed messages.

Spring
------

Depending on the gems you use, an average Rails app probably take around ~5
seconds to boot. That's 5 seconds wasted every time you run your tests, even
when you are just running a single isolated test case! If you are following
[TDD][tdd], you are probably doing this 50 times a day. That's [5 days wasted][xkcd-time]
in the last five years!

Luckily for all of us, new applications generated with Rails 4.1 comes with
built-in integration with the [Spring][spring] application preloader.

Spring works by keeping your application running in the background so you
don't need to boot it every time you run a test, rake task or migration. If
you are familiar with [Zeus][zeus] gem or the [Spork][spork] gem, this should
sound famaliar. However, it transparently wraps common Rails commands
(`rake` and `rails` by default) with binstubs, so if you have `./bin`
in your `PATH`, things should automagically become much faster for you, no
actions required!

I tried this on the [Caliper][caliper] dashboard, and we can save almost 5
seconds between test runs when spring is loaded. Can I get my 5 extra days
off now? ;)

You can read about how it works in the [Spring README][spring-readme] as
well as how to install this for existing applications.

Read more about this feature:

* [Release notes](http://edgeguides.rubyonrails.org/4_1_release_notes.html#spring-application-preloader)
* [Upgrading guide](http://edgeguides.rubyonrails.org/upgrading_ruby_on_rails.html#spring)
* [Documentation][spring-readme]
* Pull request: [#12958](https://github.com/rails/rails/pull/12958)

Even More Features
------------------

This is just scratching the surface of this release. There are many other
features that you might find useful, such as
[a `secrets.yml` for all your secrets](http://edgeguides.rubyonrails.org/4_1_release_notes.html#config-secrets-yml),
[time travelling in tests](https://github.com/rails/rails/pull/12824),
[better JSON handling](https://github.com/rails/rails/pull/12183),
[`Module#concerning`](http://edgeguides.rubyonrails.org/4_1_release_notes.html#module-concerning),
[`to_param` macro](https://github.com/rails/rails/pull/12891) and more.
I encourage you to checkout the [release notes](http://edgeguides.rubyonrails.org/4_1_release_notes.html)
for a full list of changes!

## #VANRUBY Upgrade Clinic

We will be running our [4.1 upgrade clinic](http://www.meetup.com/vancouver-ruby/messages/61805312/)
again at the [#VANRUBY hack night](http://www.meetup.com/vancouver-ruby/events/154207602/)
today. Stop by and say hi if you are in town!

[weblog-post]:       http://weblog.rubyonrails.org/
[vanruby]:           http://vanruby.org/
[slides]:            http://www.slideshare.net/godfreykfc/rails-41
[post-pc-era]:       http://en.wikipedia.org/wiki/Post-PC_era
[responsive-design]: http://alistapart.com/article/responsive-web-design
[letter-opener]:     https://github.com/ryanb/letter_opener
[mail-view]:         https://github.com/37signals/mail_view
[tdd]:               http://en.wikipedia.org/wiki/Test-driven_development
[xkcd-time]:         http://xkcd.com/1205/
[spring]:            https://github.com/jonleighton/spring
[spring-readme]:     https://github.com/jonleighton/spring#readme
[caliper]:           https://caliper.io/
[zeus]:              https://github.com/burke/zeus
[spork]:             https://github.com/sporkrb/spork
[HMAC]:              http://en.wikipedia.org/wiki/Hash-based_message_authentication_code
[replay-attack]:     http://en.wikipedia.org/wiki/Replay_attack
