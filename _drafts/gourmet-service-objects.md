---
layout: post
title: "Gourmet Service Objects"
author: philippe
category: blog
published: false
tags:
  - rails
---

Your rails app's business logic is hidden in ugly controllers with 10+ lines long method and fat models powered by Longuini callbacks? Your tests are getting out of control and you spend most of your days looking at green dots? You want to impress your coworkers with Unicorn level code?

You need Gourmet Service Objects™!

I have been using services objects for the past three years and they reconciled me with Rails (as much as Automated tests reconciled me with software programming!).

## A service object **does** one thing

A service object (aka method object) performs one action. It holds the business logic to perform that action. Here is an example:

{% highlight ruby %}
# app/services/accept_invite.rb
class AcceptInvite
  def self.call(invite, user)
    invite.accept!(user)
    UserMailer.invite_accepted(invite).deliver
  end
end
{% endhighlight %}

The conventions I follow are:

* services go under the `app/services` directory. I encourage you to use subdirectories for business logic heavy domains: `app/services/invite/accept.rb` and `app/services/invite/create.rb` will define `Invite::Accept` and `Invite::Create`.
* services start with a verb (and do not end with Service): `ApproveTransaction`, `SendTestNewsletter`, `ImportUsersFromCsv`
* services respond to the `call` method. I found using another verb makes it a bit redondant: `ApproveTransaction.approve()` does not read well. Also, the `call` method is the de facto method for lambda, procs, and method objects.

## Benefits

### Service objects show what your application *does*

I can just glance over the `services` directory to see what your application **does**: `ApproveTransaction`, `CancelTransaction`, `BlockAccount`, `SendTransactionApprovalReminder`…

A quick look into a service object and I get what business logic is involved. I don't have to go through the controllers, active record model callbacks and observers to understand what "approving a transaction" involves.

### Clean-up models and controllers

Controllers turn the request (params, session, cookies) into arguments, pass them down to the service and redirect or render according to the service response.

{% highlight ruby %}
class InviteController < ApplicationController
  def accept
    invite = Invite.find_by_token!(params[:token])
    if AcceptInvite.call(invite, current_user)
      redirect_to invite.item, notice: "Welcome!"
    else
      redirect_to '/', alert: "Oopsy!"
    end
  end
end
{% endhighlight %}

Models only deal with associations, scopes, validations and persistence.

{% highlight ruby %}
class Invite < ActiveRecord::Base

  def accept!(user, time=Time.now)
    update_attributes!(
      accepted_by_user_id: user.id,
      accepted_at: time
    )
  end

end
{% endhighlight %}

It makes them way easier to maintain and to test!

### Call them from anywhere

Service objects are likely to be called from controllers as well as:

* other service objects

{% highlight ruby %}
class BatchSyncUsers do
  def self.call(users)
    users.map do |user|
      SyncUser.call(user)
    end
  end
end
{% endhighlight %}

* rake task

{% highlight ruby %}
task :sync do
  SyncLoggedTimeFromFreckle.call
end
{% endhighlight %}

* the console

{% highlight ruby %}
$> ApproveTransaction.call(transaction, user, 2.days.ago)
{% endhighlight %}

* even from test helpers to setup your integration tests!

{% highlight ruby %}
def create_approved_transaction
  transaction = FactoryGirl.create(:transaction)
  ApproveTransaction.call(transaction, FactoryGirl.create(:user))

  transaction
end
{% endhighlight %}

### DRY and Embrace change

I keep service objects as simple and small as I can. I compose service objects with other services objects, and I reuse them. My code is quite modular and I'm ready to embrace change.

{% highlight ruby %}
class SendNewsletter
  def self.call(newsletter)
    campaign = CreateMailchimpCampaign.call(newsletter)
    DeliverCampaign.call(campaign)
    DeleteCampaign.call(campaign)
  end
end

class SendTestNewsletter
  def self.call(newsletter)
    campaign = CreateMailchimpCampaign.call(newsletter)
    DeliverTestEmail.call(campaign)
    DeleteCampaign.call(campaign)
  end
end
{% endhighlight %}

### Clean up and speed up your test suite

Services are easy and fast to test since they are small ruby objects with one point of entry (the `call` method remember?). Complex services are composed with other services, so you can split up your tests easily.

I tend not to use any mocks or stub to test services that deal with active record objects. rspec-set helps me keep the running time quite low while having simple and robusts test. Once again, service objects are small and do one thing, so they tend to have a limited amount of dependencies.

## Real world services

I like to use instance of service objects to take advantage of using private methods. I also add Virtus into the mix to handle parameters. For instance:

{% highlight ruby %}
class AcceptInvite
  def self.call(*args)
    new(*args).call
  end

  include Virtus.model

  attribute :invite, Invite
  attribute :user, User
  attribute :account, Account
  attribute :time, default: ->(_,_) { Time.now }

  def call
    unless invite_already_accepted?
      accept_invite
      send_notification_to_inviter
    end
  end

  private

  def invite_already_accepted?
    # ...
  end

  def accept_invite
    # ...
  end

  def send_notification_to_inviter
    # ...
  end
end
{% endhighlight %}

Oh, and you can extract the first few lines into a helper to get down to:

{% highlight ruby %}
class AcceptInvite
  include Service

  attribute :invite
  # ...

  def call
    # ...
  end
end
{% endhighlight %}

## Return values!

The services I make have three flavours when it comes to communicating back to the caller.

### Flavour #1: Fail loudly

Most services I write are not supposed to fail. They do not return anything (meaningful) but they raise an exception if something goes wrong. Those services are likely to use methods that fail loudly such as `Hash#fetch`, `create!`, `save!`, `find_by_name!` etc.

### Flavour #2: Return created active record model

Those are the services which create records. The caller has to check if model is persisted and it has access to errors.

{% highlight ruby %}
def create
  attributes = params.fetch(:invite).
    merge(creator: current_user)
  @invite = CreateInvite.call(attributes)
  if @invite.persisted?
    redirect_to @invite
  else
    render :new
  end
end
{% endhighlight %}

### Flavour #3: Response object

Some services have several outcomes and complex errors handling. They return a response object which responds to `success?` and `error(s)`.

{% highlight ruby %}ruby
response = AcceptInvitation.call # ...
if response.success?
  redirect_to # ...
else
  render :edit, alert: response.error
end
{% endhighlight %}

This is it with service objects for now. Experiment with them, they will make your codebase more expressive and easier to maintain!