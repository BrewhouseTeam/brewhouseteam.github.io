---
layout: post
title: "Be nice to others and your future-self: use Data Objects."
author: pcreux
date: 2015-07-31 12:00
tags:
  - ruby
  - virtus
shared_square_image: http://brewhouse.io/images/posts/2015/07/data-objects-social.jpg
shared_description: "Data Objects are easier to understand and to manipulate than hashes. Do yourself a favor: use Data Objects."
draft: false
published: true
---

In Ruby, hashes and arrays are the go-to data structures. For example, Rails turns http params into a hash and a json payload is a hash with nested arrays and hashes. The flexibility those primitives offer is undeniable and is key to developer happiness.

There are times where those data structures become too complex and we have to dig deeper into the codebase to figure what a hash is supposed to contain. This is where Data Objects can help us a great deal.

<!-- break -->

Data Objects contain data; they don’t implement any behaviour. A Struct is the simplest Data Object you can think of. It has a defined set of attributes that are publicly available as instance methods.

{% highlight ruby %}
class Email < Struct.new(:from, :to, :subject, :body)
end
{% endhighlight %}

The main benefit of Data Objects is that they explicitly define the attributes available.

Documentation such as this is a great gift for other developers (and your future-self). A quick look at the Data Object definition tells us what attributes are available. No need to go through those four classes where a hash that's returned by a third-party API is transformed, filtered, reduced, deleted, symbolized keys and recursively flattened... wait, what?!

It also leads to a nicer syntax and better error messages:

{% highlight ruby %}
# with a hash
user_hash[:signup_time].to_date # => undefined method to_date for nil

# with a Data Object
user.signup_time.to_date # => undefined method signup_time for user
{% endhighlight %}

## Virtus, the Data Object's best friend

I fell in love with [Virtus](https://github.com/solnic/virtus) a couple years ago. It has a great syntax to define object attributes.

{% highlight ruby %}
class User
  include Virtus.model

  attribute :email, String
  attribute :verified, Boolean, default: false
  attribute :created_at, Time
end
{% endhighlight %}

The class `User` has setters and getters for the attributes defined and it can be initialized with a hash of attributes (using symbols or strings as keys):

{% highlight ruby %}
User.new(email: "bob@example.com", created_at: "2015-01-01 12:00:00")

# => #<User:0x007f97e0cca928
#       @email="bob@example.com",
#       @created_at=2015-01-01 12:00:00 -0800,
#       @verified=false>
{% endhighlight %}

The syntax to define attributes works as an excellent documentation. Ruby is not a typed language, but Virtus provides *some sort of a feel of optional typing*.

As you can see in the example above, Virtus attempts to coerce values to the type passed in. This is great for consuming APIs or http params: `Strings` will be converted to `Integer`, `Boolean` or `Time` if you’ve defined your attribute to be so. Even better, nested arrays and hashes can be coerced to other Virtus model.

{% highlight ruby %}
class Account
  include Virtus.model

  attribute :user, User
  attribute :plan, String
end

Account.new(user: { email: "bob@example.com" }, plan: "pro")
# => #<Account:0x007f97e0d1a0b8
#      @user=#<User:0x007f97e0d1ab08
#        @email="bob@example.com",
#        @created_at=nil,
#        @verified=false>,
#      @plan="pro">
{% endhighlight %}

Last but not least, the `#attributes` method turns your Virtus Data Objects back into primitives making Virtus a great serializer.

{% highlight ruby %}
user.attributes
# => {:email=>"bob@example.com", :verified=>false, :created_at=>2015-01-01 12:00:00 -0800}
{% endhighlight %}

## Wrapping API responses with Virtus

Let’s take the [Mandrill API](https://mandrillapp.com/api/docs/index.ruby.html) as an example here. The
[end-point `/messages/info.json`](https://mandrillapp.com/api/docs/messages.JSON.html#method=info) returns information about an email you sent including sender, subject, opens, clicks as well as all open and click events.

The ruby wrapper turns that json into (oh, surprise!) a large hash. You could query the hash via `reponse.fetch('metadata').fetch('user_id')` and look up the online documentation to determine what's available. Let's create a Data Object to wrap the API responses here. Using Virtus and some code-editing-fu it takes a couple of seconds to turn the documentation into a Data Object class.

![turn-text-doc-into-virtus](/images/posts/2015/07/vim-macros.gif)

Below is an excerpt of the `MandrillMessage` definition. The types and comments are just taken out of the html documentation. The list of "open details" will turn into a nested array of `OpenDetail` objects.

{% highlight ruby %}
class MandrillMessage
  include Virtus.model

  attribute :ts, Integer # the Unix timestamp from when this message was sent
  attribute :_id, String # the message's unique id
  attribute :sender, String # the email address of the sender
  attribute :template, String # the unique name of the template used, if any
  attribute :subject, String # the message's subject line
  attribute :email, String # the recipient email address
  attribute :tags, Array[String] # list of tags on this message
  attribute :opens, Integer # how many times has this message been opened
  attribute :opens_detail, Array[OpenDetail] # list of individual opens for the message
  attribute :clicks, Integer # how many times has a link been clicked in this message
  # ...

  class OpenDetail
    include Virtus.model

    attribute :ts, Integer # the unix timestamp from when the message was opened
    attribute :ip, String # the IP address that generated the open
    attribute :location, String # the approximate region and country that the opening IP is located
    attribute :ua, String # the email client or browser data of the open
  end
end
{% endhighlight %}

Let's give this a try and turn the hash returned by the API client into a `MandrillMessage`.

{% highlight ruby %}
MandrillMessage.new(mandrill_api.messages.info('123'))
# => #<MandrillMessage:0x007f97e0d1a0b8
#     @ts=2015-02-03 12:00:01 -8000,
#     @_id='123',
#     @sender="bob@example.com",
#     ...>
{% endhighlight %}

## Serializing data with Virtus

It is really easy to serialize a Virtus object into a database or a cache store. Say you want to persist a Report in an ActiveRecord model. We define the `report` attribute as a `:json` column and wrap it with a `Report` Data Object.

{% highlight ruby %}
class Report
  include Virtus.model

  attribute :opens, Integer, defaut: 0
  attribute :clicks, Integer, defaut: 0
end

class Email < ActiveRecord::Base
  # report is a jsonb attribute

  def report=(report)
    self['report'] = report.is_a?(Report) ? report.attributes : report
  end

  def report
    Report.new(self['report']) if self['report']
  end
end
{% endhighlight %}

{% highlight ruby %}
email = Email.create!(report: { opens: 3, clicks: 4 })
# or
email = Email.create!(report: Report.new(opens: 3, clicks: 4))
# => #<Email
#   id: 3,
#   report: {
#     "opens"=>3,
#     "clicks"=>2
#   },
#   created_at: "2015-07-31 19:08:35",
#   updated_at: "2015-07-31 19:08:35">

email.report
# => #<Email::Report:0x007f97e0c2afb8 @opens=3, @clicks=2>
{% endhighlight %}

## Data Objects > Hashes

Hashes and primitives are great but they can be obscure or hard to manage at times. I find Data Objects way easier to reason about. Data Objects self-document the code and make it more reliable. So the next time you deal with a complex data structure, do yourself a favor and turn it into a Data Object with Virtus. You'll thank yourself later.
