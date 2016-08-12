---
layout: post
title: "Advanced SQL in Rails - Part 2"
author: alex
date: 2016-08-12 09:00
shared_description: Turbocharge your Rails workflow by taking advantage of advanced SQL, right from within Rails.
draft: false
published: true
---
Welcome back, dear readers! In [part 1 of this post](http://brewhouse.io/2016/08/04/sql-in-rails.html), we did a quick overview of SQL's window functions and views. Now, we're going to see how we can use those features from right within Rails.

<!-- break -->

## Putting it all together

To demonstrate how we can spice up our Rails app with windows and views, let’s build a small Rails application called GifVotr. Think of it like Reddit for GIFs: you can post a GIF, and people can vote it up and down. The most popular GIFs will rise to the top.

We can start with some simple models and corresponding tables for GIFs and votes:

{% highlight ruby %}
class Gif < ApplicationRecord
  has_many :votes
end
{% endhighlight %}

{% highlight ruby %}
class Vote < ApplicationRecord
  belongs_to :gif

  scope :upvotes,   -> { where(value:  1) }
  scope :downvotes, -> { where(value: -1) }
end
{% endhighlight %}

With these simple models (and a [couple](http://giphy.com/gifs/season-11-the-simpsons-11x22-l2JdWch9V8wsn4mAw) [of](http://giphy.com/gifs/hackers-hacking-FnGJfc18tDDHy) [fun](http://giphy.com/gifs/tim-and-eric-mind-blown-EldfH1VJdbrwY) [GIFs](http://giphy.com/gifs/missiles-wargames-diBYl6TWc6pTW)), we can issue queries like:

{% highlight ruby %}
gif = Gif.first
# => <Gif ...>

gif.votes.upvotes.size
# => 12

gif.votes.downvotes.size
# => 5
{% endhighlight %}

If we wanted to calculate the rank of each GIF, we could sum up the votes for each GIF and then sort by that:

{% highlight ruby %}
class Gif < ApplicationRecord
  has_many :votes

  def score
    votes.sum(:value)
  end
end
{% endhighlight %}

{% highlight ruby %}
gif.score
# SELECT SUM("votes"."value") FROM "votes" WHERE "votes"."gif_id" = $1  [["gif_id", 7]]
# => 7
{% endhighlight %}

Our `score` method will issue a `sum` query every time it's called, which will translate into a lot of additional queries as your dataset grows. Plus, we don't just need to calculate the score - we also want to display the rank of each GIF - what's the #1 most popular GIF, the #2 most popular, etc. Doing that in Ruby land will get expensive quickly.

## Put a view on it

Instead, let's make a view! We'll start by loading up our database console using `rails db` and figure out how we can construct an SQL query that gives us the data we need. Remember, we're looking for the score of each GIF, as well as its rank relative to all the GIFs in the system.

{% highlight sql %}
SELECT row_number() OVER () AS id,
total_votes.gif_id,
total_votes.score,
rank() OVER (ORDER BY total_votes.score DESC) AS rank
FROM (
  SELECT gif_id, sum(value) AS score
  FROM votes GROUP BY gif_id
) AS total_votes;
{% endhighlight %}

{% highlight sql %}
 id | gif_id | score | rank
----+--------+-------+------
  3 |      7 |    26 |    1
  1 |      8 |    22 |    2
  2 |      9 |    14 |    3
(3 rows)
{% endhighlight %}

This is a pretty complex query, so let's break it down.

First, we need to calculate the score for each GIF. We can get this from the votes table with a basic aggregate function:

{% highlight ruby %}
SELECT gif_id, sum(value) AS score
FROM votes GROUP BY gif_id;
{% endhighlight %}

{% highlight ruby %}
 gif_id | score
--------+-------
      8 |    22
      9 |    14
      7 |    26
(3 rows)
{% endhighlight %}

Next, we want to take this result set and calculate a rank for each row, based on the score. The highest score will get the highest ranking. To do this, we can take the query above and use it in the `FROM` clause of our larger query, so that our calculations can operate on those results. We have to name this result set so that we can reference it in the rest of the query, so we'll call it 'total_votes'.

{% highlight sql %}
SELECT ...
FROM (
  SELECT gif_id, sum(value) AS score
  FROM votes GROUP BY gif_id
) AS total_votes;
{% endhighlight %}

We can use the `rank()` function to calculate the ranking for each row. Fun fact: you can't use `rank()` without a window function, which makes it a pretty great example!

{% highlight sql %}
SELECT ...,
rank() OVER (ORDER BY total_votes.score DESC) AS rank
FROM (
  SELECT gif_id, sum(value) AS score
  FROM votes GROUP BY gif_id
) AS total_votes;
{% endhighlight %}

We need to give `rank()` a sorting by which it should rank our results, so we use a window function and instruct it to order the rows by score, descending. Unsurprisingly, we name this column 'rank'.

Along with the 'rank' column, we also want to return the other columns from 'total_votes'. While we're at it, we should add an 'id' field so that our view feels like a real table:

{% highlight sql %}
SELECT row_number() OVER () AS id,
total_votes.gif_id,
total_votes.score,
rank() OVER (ORDER BY total_votes.score DESC) AS rank
FROM (
  SELECT gif_id, sum(value) AS score
  FROM votes GROUP BY gif_id
) AS total_votes;
{% endhighlight %}

## Waiter, there's a View in my Migration

Okay, we've got our query! Now, we can hook it up to Rails. Let's make a migration that will create this view in the database for us. We wrap our handcrafted query in a `CREATE VIEW` statement and call it 'rankings'. We can use Active Record's `execute` function to pass our SQL right into the database.

{% highlight ruby %}
class CreateRankingsView < ActiveRecord::Migration[5.0]
  def up
    execute <<-SQL
      CREATE VIEW rankings AS (
        SELECT row_number() OVER () AS id,
        total_votes.*,
        rank() OVER (ORDER BY total_votes.score DESC) AS rank
        FROM (
          SELECT gif_id, sum(value) AS score
          FROM votes GROUP BY gif_id
        ) AS total_votes
      )
    SQL
  end

  def down
    execute("DROP VIEW rankings")
  end
end
{% endhighlight %}

Here's where we diverge a bit from the Rails Way of things, so it's important to point out a few things:

1. Since we're passing raw SQL in this migration, we shouldn't use the `change` method, since Rails won't know how to reverse the migration. Instead, we should use `up`/`down` so that we can correctly drop the view if we need to roll it back.

2. When new migrations are run, Rails updates `db/schema.rb` to reflect the current state of the database. Since we're doing something custom now, *the result of this migration will not be visible in the schema file.* As a result, running `rails db:schema:load` will no longer put our database in the right state. This means that anywhere you rely on initializing the database from the schema - continuous integration, for example - you should simply use `rails db:migrate` instead.

(It's worth mentioning here that [thoughtbot](https://thoughtbot.com/) has created a gem called [Scenic](https://github.com/thoughtbot/scenic) which solves this second problem, among others. If you find yourself working with views often, have a look at Scenic.)

Anyway, now we've got a view in our database. Following the Rails convention of table/model naming, we can hook up a Ranking model to this 'table' of ours:

{% highlight ruby %}
class Ranking < ApplicationRecord
  self.primary_key = :id

  belongs_to :gif
end
{% endhighlight %}

This looks like any other table-backed model, except for one small difference: we need to tell our model what its primary key is, since Rails can't infer it from the schema.

Now that we've hooked up our view to a model, we've completely abstracted the fact that this is a complex SQL query, and we can proceed as if 'rankings' was actually a table.

Let's fast-forward a bit and see how all three of these models could work together to produce a complex result set while hitting the database just once:

{% highlight ruby %}
class Gif < ApplicationRecord
  has_one :ranking
  has_many :upvotes,   -> { upvotes   }, class_name: "Vote"
  has_many :downvotes, -> { downvotes }, class_name: "Vote"

  scope :with_votes,    -> { includes(:upvotes, :downvotes) }
  scope :with_rankings, -> { includes(:ranking) }
  scope :order_by_rank, -> { joins(:ranking).order('rankings.rank', 'rankings.id') }

  delegate :rank, to: :ranking

  def downvotes_count
    downvotes.size
  end

  def upvotes_count
    upvotes.size
  end
end
{% endhighlight %}

{% highlight ruby %}
class Ranking < ApplicationRecord
  self.primary_key = :id

  belongs_to :gif
end
{% endhighlight %}


{% highlight ruby %}
class Vote < ApplicationRecord
  belongs_to :gif

  scope :upvotes,   -> { where(value:  1) }
  scope :downvotes, -> { where(value: -1) }
end
{% endhighlight %}

(One thing to note about our `order_by_rank` scope: we're explicitly ordering by `rank` and `id` in order to guarantee a consistent sort order, since our `rank()` function will assign the same rank to GIFs with equal scores. Sorting by `id` ensures that features like pagination will continue to work predictably. If you want to nerd out more on rank functions, check out [this article](https://oracle-base.com/articles/misc/rank-dense-rank-first-last-analytic-functions).)

Back in ActiveRecord land, we can harness the power of scopes and associations to construct an efficient database query, with all the data we need, up front:

{% highlight ruby %}
@gifs = Gif.with_votes.with_rankings.order_by_rank

# SELECT "gifs"."id" AS t0_r0, "gifs"."image" AS t0_r1, "gifs"."created_at" AS t0_r2, "gifs"."updated_at" AS t0_r3, "votes"."id" AS t1_r0, "votes"."gif_id" AS t1_r1, "votes"."value" AS t1_r2, "votes"."created_at" AS t1_r3, "votes"."updated_at" AS t1_r4, "downvotes_gifs"."id" AS t2_r0, "downvotes_gifs"."gif_id" AS t2_r1, "downvotes_gifs"."value" AS t2_r2, "downvotes_gifs"."created_at" AS t2_r3, "downvotes_gifs"."updated_at" AS t2_r4, "rankings"."id" AS t3_r0, "rankings"."gif_id" AS t3_r1, "rankings"."score" AS t3_r2, "rankings"."rank" AS t3_r3 FROM "gifs" INNER JOIN "rankings" ON "rankings"."gif_id" = "gifs"."id" LEFT OUTER JOIN "votes" ON "votes"."gif_id" = "gifs"."id" AND "votes"."value" = $1 LEFT OUTER JOIN "votes" "downvotes_gifs" ON "downvotes_gifs"."gif_id" = "gifs"."id" AND "downvotes_gifs"."value" = $2 ORDER BY rankings.rank, "gifs"."id" ASC  [["value", 1], ["value", -1]] for those who scrolled to the end, I salute you!
=> #<ActiveRecord::Relation …>

@gifs.first.rank
=> 1

@gifs.first.upvotes_count
 => 30

@gifs.first.downvotes_count
 => 4
{% endhighlight %}

That's quite the query, isn't it? Bet you're glad you didn't have to worry about constructing *that* by hand!

## Conclusion
When the size and complexity of your data begins to outgrow ActiveRecord, you don't need to [throw away all your Rails magic](http://giphy.com/gifs/harry-potter-hp-hagrid-2gGEWrIGVioP6) just to get the results you need. With the right workflow, higher-level SQL features can integrate nicely with any Rails app. Your data will thank you!

Are you going to try out views and window functions on your next project? Are you working with them in your Rails app already? Drop me a line in the comments!

Related: [Advanced SQL in Rails - Part 1](http://brewhouse.io/2016/08/04/sql-in-rails.html)
