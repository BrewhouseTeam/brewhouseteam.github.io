---
layout: post
title: "Gourmet Service Objects"
author: philippe
category: blog
published: true
date:      2014-04-30 12:37
tags:
  - rails
---

Is your Rails app's business logic hidden in ugly controllers with 10+ lines long method and fat models powered by Linguini callbacks? Are your tests getting out of control and you spend most of your days looking at green dots? Do you want to impress your coworkers with Unicorn level code?

You need Gourmet Service Objects™!

I have been using service objects for the past three years and they reconciled my take on Rails (as much as automated testing reconciled my feelings for software programming!).

## A service object _does one thing_

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

The three conventions I follow are:

* Services go under the `app/services` directory. I encourage you to use subdirectories for business logic-heavy domains. For instance:
  * The file `app/services/invite/accept.rb` will define `Invite::Accept`
  * while `app/services/invite/create.rb` will define `Invite::Create`
* Services start with a verb (and do not end with Service): `ApproveTransaction`, `SendTestNewsletter`, `ImportUsersFromCsv`
* Services respond to the `call` method. I found using another verb makes it a bit redundant: `ApproveTransaction.approve()` does not read well. Also, the `call` method is the de facto method for lambda, procs, and method objects.

## Benefits

### Service objects show what my application *does*

I can just glance over the `services` directory to see what my application **does**: `ApproveTransaction`, `CancelTransaction`, `BlockAccount`, `SendTransactionApprovalReminder`…

A quick look into a service object and I know what business logic is involved. I don't have to go through the controllers, ActiveRecord model callbacks and observers to understand what "approving a transaction" involves.

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

This makes models and controllers much easier to test and maintain!

### DRY and Embrace change

I keep service objects as simple and small as I can. I compose service
objects with other service objects, and I reuse them. My code is quite
modular and I'm ready to Embrace Change™.

{% highlight ruby %}
class SendTestNewsletter

  def self.call(newsletter)
    campaign = CreateMailchimpCampaign.call(newsletter)
    DeliverTestEmail.call(campaign)
    DeleteCampaign.call(campaign) # Don't keep the test campaign around
  end

end

class SendNewsletter

  def self.call(newsletter)
    campaign = CreateMailchimpCampaign.call(newsletter)
    DeliverCampaign.call(campaign)
    # Could easily delete here as well, but we want to retain the legit campaigns
  end

end
{% endhighlight %}

### Clean up and speed up your test suite

Services are easy and fast to test since they are small ruby objects with one point of entry (the `call` method). Complex services are composed with other services, so you can split up your tests easily.

I tend not to use any mocks or stub to test services that deal with ActiveRecord objects. [rspec-set](https://github.com/pcreux/rspec-set) helps me keep the running time quite low while having simple and robusts test. Once again, service objects are small and do one thing, so they tend to have a limited amount of dependencies.

### Call them from anywhere

Service objects are likely to be called from controllers as well as:

* Other service objects:

{% highlight ruby %}
class BatchSyncUsers do

  def self.call(users)
    users.each { |user| SyncUser.call(user) }
  end

end
{% endhighlight %}

* DelayedJob / Rescue / Sidekiq Jobs:

{% highlight ruby %}
class SyncInvoicesJob
  def work
    SyncInvoices.call
  end
end
{% endhighlight %}

* Rake tasks:

{% highlight ruby %}
task :sync do
  SyncInvoices.call
end
{% endhighlight %}

* The console:

{% highlight ruby %}
$> ApproveTransaction.call(transaction, user, 2.days.ago)
{% endhighlight %}

* Even from test helpers to setup my integration tests!

{% highlight ruby %}
def create_approved_transaction
  transaction = FactoryGirl.create(:transaction)
  ApproveTransaction.call(transaction, FactoryGirl.create(:user))

  transaction
end
{% endhighlight %}


## Real world services

I like to use instances of service objects to take advantage of private methods. I add Virtus into the mix to handle parameters. For instance:

{% highlight ruby %}
class AcceptInvite

  def self.call(*args)
    new(*args).call
  end

  include Virtus.model

  attribute :invite,  Invite
  attribute :user,    User
  attribute :account, Account
  attribute :time,    Time,   default: proc { Time.now }

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

I extracted the `def self.call` into a helper module `Service`:

{% highlight ruby %}
module Service
  extend ActiveSupport::Concern

  included do
    def self.call(*args)
      new(*args).call
    end
  end
end

class AcceptInvite

  include Service
  include Virtus.model

  attribute :invite, Invite
  attribute :user, User
  attribute :account, Account
  attribute :time, default: proc { Time.now }

  def call
    unless invite_already_accepted?
      accept_invite
      send_notification_to_inviter
    end
  end

  private

  # ...

end
{% endhighlight %}

I sometimes inject dependencies to test services that orchestrate
complex operations. Since services respond to the `call` method, a
simple `proc` does the job.

{% highlight ruby %}
class Trumpet
  include Service
  # ...
end

class Bass
  include Service
  # ...
end

class OutOfTuneError < StandardError
end

class Conductor
  include Service
  include Virtus.model

  attribute :trumpet, Trumpet, default: proc { Trumpet }
  attribute :bass,    Bass,    default: proc { Bass }

  def call
    trumpet.call('C4 .. G4')
    bass.call('C2 D2 E2 E2')
  rescue OutOfTuneError => e
    # ...
  end
end


expect(Conductor.call(
  trumpet:  proc { "onk! onk!" },
  bass:     proc { raise OutOfTuneError }
)).to sound_awful
{% endhighlight %}


## Values: The Return

The services I write have three flavours when it comes to communicating back to the caller.

### Flavour #1: Fail loudly

Most services are not supposed to fail. They do not return anything (meaningful) but they raise an exception when something goes wrong. Those services are likely to use methods that fail loudly such as `Hash#fetch`, `create!`, `save!`, `find_by_name!` etc.

{% highlight ruby %}
class ContractController < LoggedInController

  def sign
    contract = current_user.contracts.find(params.fetch(:id))
    SignContract.call(contract: contract, user: current_user)
    flash[:notice] = "Contract signed!"
    redirect_to contract
  end

end
{% endhighlight %}



### Flavour #2: Return a persisted ActiveRecord model

The caller can check if an AR instance is persisted and then has access to its errors.

{% highlight ruby %}
class InviteController < LoggedInController

  def create
    attributes = invite_params.merge(creator: current_user)
    @invite = CreateInvite.call(attributes)

    if @invite.persisted?
      redirect_to @invite
    else
      render :new, alert: errors_for_humans(@invite.errors)
    end
  end

  private

  def invite_params
    params.fetch(:invite).permit(:token)
  end

end
{% endhighlight %}

### Flavour #3: Response object

Some services have several outcomes and complex error handling. They return a response object which responds to `success?` and `error(s)`.

{% highlight ruby %}
class InviteController < LoggedInController

  def accept
    result = AcceptInvitation.call(
      invite: Invite.find_by_token!(params[:token]),
      user: current_user
    )

    if result.success?
      redirect_to root_path, notice: "Welcome!"
    else
      redirect_to root_path, alert: result.error
    end
  end

end
{% endhighlight %}

That's it for service objects for now. Experiment with them, as I
believe they will make your codebase more expressive and easier to
maintain!

I'm happy to respond to any question or concern you guys might have. Feel free to
leave a comment below. <3 <3 <3


