---
layout:    post
title:     "Elegant tests with Truth Tables"
author:    "philippe"
category:  blog
date:      2015-04-13 10:00
published: true
tags:
- test
- cleancode
shared_square_image: http://brewhouse.io/images/posts/2015/apr/truthtables.png
shared_description: Truth Tables help writing readable tests that are easy to maintain.
---

Truth Tables help writing readable tests that are easy to maintain.

Here is an example:

{% highlight ruby %}
describe "#to_dollars" do
  [
    [      nil,         nil],
    [        0,     "$0.00"],
    [       12,     "$0.12"],
    [     4_10,     "$4.10"],
    [   -23_00,   "$-23.00"],
    [  1230_00, "$1,230.00"]
  ].each do |amount, dollars|
    it "converts #{amount.inspect} to #{human.inspect}" do
      expect(to_dollars(amount)).to eq dollars
    end
  end
end
{% endhighlight %}

<!-- break -->

You can also use a hash if you like hash rockets:

{% highlight ruby %}
describe EnterprisePlan, "#cost" do
  { # emails      cost
           0  =>  0_00, # free up to 200 emails
         100  =>  0_00,
         200  =>  0_00,
         250  =>  1_00, # 2 cts per email up to 400
         400  =>  4_00,
         500  =>  5_00, # 1 cts per email for 400+
        1000  => 10_00
  }.each do |emails, cost|
    it "charges #{cost} for #{emails} emails" do
      expect(EnterprisePlan.new.cost(emails)).to eq cost
    end
  end
end
{% endhighlight %}

And you can go crazy with multiple inputs and outputs:

{% highlight ruby %}
describe Money do
  [ # currency  amount       human    with currency
    [    "USD",     10,     "0.10",       "$0.10" ],
    [    "EUR",     10,     "0.10",       "€0.10" ],
    # ...
  ].each do |currency, amount, human, human_with_currency|
    context "for #{currency} #{amount}" do
      it "displays #{human} by default" do
        expect(Money.new(amount, currency).human).to eq(human)
      end

      it "displays #{human_with_currency} with currency" do
        expect(Money.new(amount, currency).human(with_currency: true).to eq(human_with_currency)
      end
    end
  end
end
{% endhighlight %}

In my opinion, Truth Tables are really easy to read and they are also great to maintain. Adding a new test case takes a couple of seconds and does not impact readability. Here are a few more examples:

{% highlight ruby %}

{ # ip              country   region   city
  "13.34.22.22"  => ["us"   , "or"   , "Portland"],
  "133.54.22.22" => ["ca"   , "bc"   , "Vancouver"],
  "127.0.0.1"    => [nil    , nil    , "local" ]
}


{
  "Mozilla/5.0 (Macintosh; Intel Mac OS 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36" =>
  { browser: "Chrome", platform: "Mac", device_type: "Computer", bot: false },

  "Mozilla/5.0 (Macintosh; Intel Mac OS 10_9_4) AppleWebKit/537.78.2 (KHTML, like Gecko) Version/7.0.6 Safari/537.78.2" =>
  { browser: "Safari", platform: "Mac", device_type: "Computer", bot: false },
}


[                                                                     # alert?
  [ { last_notification_at: nil,        threshold: 1000, value: 1200 }, true ],
  [ { last_notification_at: 1.hour.ago, threshold: 1000, value: 1200 }, false ],
  [ { last_notification_at: 1.hour.ago, threshold: 1000, value: 2000 }, true ],
]
{% endhighlight %}


Alright, what do you think about all this? Are Truth Tables easy to read? Did I convince you to write tests with Truth Tables? Or maybe you already use Truth Tables and I missed something... And yes, I can write another sentence with **Truth Tables**, and in bold this time! :) Leave a comment below, I'm always happy to discuss it!
