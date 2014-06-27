---
layout: post
title: "Say Hello to Roundup Roger"
author: "jenn"
date: 2014-06-27 15:36
---

At Brewhouse, we spend Fridays doing creativity work. During these wonderful days, we leave the client work behind and work on interesting hacks and innovation projects. Over the last 10 weeks, I’ve been able to spend my Fridays working on a project with [Philippe](https://github.com/pcreux) called [Roundup Roger](https://github.com/BrewhouseTeam/roundup-roger). Roundup Roger is an open source tool meant to replace a team’s wrap-up meeting with email correspondence. In case you're not clear on what a wrap-up meeting is, it's quite similar to an agile standup (or scrum), but is meant to be run at the end of the business day.

You’re probably thinking, “How anti-social of you!”.  Yes, you’re right, we're endorsing email correspondence over face-to-face interaction. But we're talking about wrap-up meetings here, not beer Fridays. 

The point of a wrap-up is to educate the team on the following:

* What you’ve accomplished during the last business day.
* What you’ll be working on next.
* Whether you’ve got any blockers that are impeding your progress.

Email works well in this situation because it prevents "chatty Carls" from commandeering your meeting, and allows concise discourse that can be re-visited later if needed. Also, for those of us who have trouble with context switching after programming all day, it can be easier to communicate the work you’ve accomplished by writing it out as opposed to communicating verbally.

Another benefit of an email wrap-up is submission flexibility. Some of our team members finish later in the day than others, and often accomplish a lot after the in-person wrap-up happens. With Roundup Roger, team members have the flexibility to respond to the reminder email at any time. As long as they send their email before the roundup is sent in the morning, their contributions will be included.


##How Does Roundup Roger Work?

Reminder emails are sent out daily at a scheduled time. Each team member responds to the reminder email, outlining the three items above. 

![reminder email](/images/posts/reminder-email.png)

The following day, a roundup email is sent to the entire team with each member’s contributions from the previous day.

![roundup email](/images/posts/roundup-email.png)


##Technical Details

Roundup Roger is a [Sinatra](http://www.sinatrarb.com/) app, that capitalizes on [Sequel's](https://github.com/jeremyevans/sequel) ORM layer. 

After using [Rails](http://rubyonrails.org/) over the last couple of years, I had become soft. It’s a sad moment when you realize you’ve become accustomed to having everything done for you. It took me a few weeks to stop trying to use [ActiveRecord](http://guides.rubyonrails.org/active_record_querying.html) when querying the database. But, in the end, I had a good cry and got over myself. I then got much better at using the Sequel gem’s ORM layer. 

I’ve also realized that Sinatra is not really a framework at all, but more of a library. I suppose this is why people call it a 'micro-framework'. 

“Hey Sinatra! Thanks for nothing!” 

Jokes aside, Sinatra ended up being a great tool to solve this problem. As it turns out, we didn’t really need much of the ‘good stuff’ that comes along with Rails. The app itself doesn’t have a web UI and is meant to be run solely via scheduled tasks in production. 


###Building Emails

To build emails, we used [Virtus](https://github.com/solnic/virtus) to create a common interface for defining attributes. It allowed us to do things like this:

{% highlight ruby %}
OutboundEmail.new(to: recipients, body: body, subject: subject)
{% endhighlight %}

When a user replies to a reminder email, we retrieve the payload passed from [Mandrill](https://www.mandrill.com/), and grab the name, email and body, such that we can later apply these to the roundup email. 

When we build the roundup email, we strip each email body to remove signatures. This was somewhat tricky, as different email clients apply signatures differently.

{% highlight ruby %}
  PATTERNS = ['—\n+Sent', '--', '>? ?On'].freeze

  def stripped_body
    PATTERNS.each do |pattern|
      self.body = strip_pattern(pattern)
    end
    body.strip
  end

  def strip_pattern(pattern)
    body.gsub(/\n(#{pattern}| [^\n]+\n?[^\n]+\n+\>).*/m, "")
  end
{% endhighlight %}

We then separate each person’s contribution with a random ascii separator, because, WHY NOT?

{% highlight ruby %}
def separator
    [
      "█║▌│ █│║▌ ║││█║▌ │║║█║ │║║█║ █│║▌",
      "▇ ▅ █ ▅ ▇ ▂ ▃ ▁ ▁ ▅ ▃ ▅ ▅ ▄ ▅",
      "▀▄▀Make something people want▄▀▄",
      "★★★★★★★★★★★★★★★★★★",
      "",
      ].sample
  end
{% endhighlight %}


###Sending Emails

We use [Pony](https://github.com/benprew/pony) to send emails. This is where the magic happens... 

{% highlight ruby %}
class SendOutboundEmail
  def self.call(email)
    Pony.mail({
      :to => email.to,
      :from => ENV['EMAIL_FROM'], 
      :subject => email.subject, 
      :html_body => email.body,
      :via => :smtp,
      :via_options => {
        :address        => ENV['SMTP_ADDRESS'],
        :port           => ENV['SMTP_PORT'],
        :enable_starttls_auto => true, 
        :user_name      => ENV['SMTP_USER_NAME'],
        :password       => ENV['SMTP_PASSWORD'],
        :authentication => :plain
      }
    })
  end
end
{% endhighlight %}


###Scheduling and Business Time

We use the [Business Time](https://github.com/bokmann/business_time) gem to prevent reminders and roundups from being sent on weekends. Perhaps this item should be configurable for those of you who like to work on weekends (why??).

We use the Heroku Scheduler to plan our tasks for daily execution. 

We'd like to think setup is pretty simple. Just schedule the following two rake tasks based on your team’s needs:

{% highlight ruby %}
rake send_reminders
{% endhighlight %}

{% highlight ruby %}
rake send_roundup
{% endhighlight %}

There is also a ```send_test_email``` rake task to test whether SMTP settings are configured correctly. 


##We Use This

Since we like to [eat our own dog food](http://brewhouse.io/blog/2014/04/24/this-week-in-rails-the-backstory.html#dogfooding) at Brewhouse, we've been using Roundup Roger as part of our daily efforts for the last couple of months. Our hope is that others will find the same value that we've found. The more teams that try this out, the more we'll know about how to improve it. As always, feedback is welcome.

[Give it a try!](https://github.com/BrewhouseTeam/roundup-roger)

