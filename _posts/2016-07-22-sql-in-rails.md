---
layout: post
title: "Advanced SQL in Rails - Part 1"
author: alex
date: 2016-08-04 13:00
shared_description: Turbocharge your Rails workflow by taking advantage of advanced SQL, right from within Rails.
draft: false
published: true
---
The more I work with Rails apps, the more I love ActiveRecord. It’s a really elegant abstraction over your data layer, and lets you focus on business logic instead of crafting SQL statements. For the majority of use cases, this works great. But as apps grow in both database size and complexity, we can start to see some compelling reasons to get “closer to the metal” and work more directly with our database.

<!-- break -->

It’s no secret that databases are fast. For complex aggregate functions that involve processing data from thousands or hundreds of thousands of rows, databases can easily outperform any implementation in Ruby. ActiveRecord gives us some power here, too (shout-out to `.sum` and `.group`!). But what if we wanted to go further?

In part 1 of this post, I’m going to cover two powerful features common to most relational databases today: window functions and views. In part 2, I'll discuss how you can leverage their power from right within Rails. I’m using Postgres, but the examples I show should work in your RDBMS of choice (with a few tweaks to syntax here and there).

## Window Functions
Your average (ha!) aggregate function returns just that: an aggregated result. As a simple example, let’s say I wanted to get the balance of a bank account by summing all of the transactions:

{% highlight sql %}
SELECT sum(amount) FROM transactions WHERE account = 'debit';

  sum
--------
 387.04
{% endhighlight %}

Using the `sum()` function, we get back a single result. Now, what if we wanted to return all the records for the ‘debit’ account, with a running total? For instance, we might want to construct a view that looks like this:

{% highlight sql %}
    date    | amount | balance
------------+--------+---------
 2016-07-01 |  50.25 |   50.25
 2016-07-01 |  17.35 |   67.60
 2016-07-01 |  21.56 |   89.16
 2016-07-02 |  14.01 |  103.17
 2016-07-02 |  79.23 |  182.40
 2016-07-02 | -15.00 |  167.40
 2016-07-02 |  46.23 |  213.63
 2016-07-03 | 100.74 |  314.37
 2016-07-03 |  72.67 |  387.04
{% endhighlight %}

This is where window functions come in. They allow you to compute aggregate functions for each individual row using a ‘window’ into the query that can slice the data up in different ways. In this example, for any given row, we can ask the database to compute the value for ‘balance’ by taking the results from our original query and drawing a ‘window’ around a subset of the rows, then sum the result. Here’s what that query would look like:

{% highlight sql %}
SELECT date, amount,
sum(amount) OVER(ORDER BY date, id) AS balance
FROM transactions
WHERE account = 'debit';
{% endhighlight %}

We can construct a window function using `OVER`. Everything between the parentheses defines how the window will be dynamically constructed for each row. Here, we say that we want to create a column called ‘balance’ which will contain the sum of the amount column, but we want to calculate it by considering only the rows up to and including the current row, as sorted by date and ID.

Whew! This is where an animation might come in handy:

![Animated example of an SQL window function](/images/posts/2016/sql_in_rails_post/window_function_example.gif)

In addition to just sorting the result set in different ways, we can also compute values by partitioning the result set, essentially grouping each row into different ‘buckets’ before calculation. For instance, what if our transactions table had an ‘account’ column, and we wanted to display a table containing the transactions from every account, with a running balance for each account:

{% highlight sql %}
SELECT date, amount, account,
sum(amount) OVER(PARTITION BY account ORDER BY date, id) AS balance
FROM transactions;

    date    | amount | account | balance
------------+--------+---------+---------
 2016-07-01 |  50.25 | debit   |   50.25
 2016-07-01 |  17.35 | debit   |   67.60
 2016-07-01 |  21.56 | debit   |   89.16
 2016-07-02 |  14.01 | debit   |  103.17
 2016-07-02 |  79.23 | debit   |  182.40
 2016-07-02 | -15.00 | debit   |  167.40
 2016-07-02 |  46.23 | debit   |  213.63
 2016-07-03 | 100.74 | debit   |  314.37
 2016-07-03 |  72.67 | debit   |  387.04
 2016-06-15 |     25 | savings |      25
 2016-06-22 |     25 | savings |      50
 2016-07-01 |     25 | savings |      75
 2016-07-08 |     25 | savings |     100
 2016-07-16 |     25 | savings |     125
(14 rows)
{% endhighlight %}

We’ve kept our `ORDER BY` clause, but we’ve added `PARTITION BY`. Here’s what’s actually happening:

![Animated example of an SQL window function with partition](/images/posts/2016/sql_in_rails_post/window_function_partition.gif)

Both of these examples are something that could be done at your ActiveRecord layer, maybe with clever usage of scopes and virtual attributes. But as your datasets grow, these kind of calculations become prohibitively expensive to do in-memory. Offloading processing like this to the database becomes an attractive option.

## Views
In our examples above, the ‘balance’ column has always been a virtual column. We don’t store it in the database; we compute it on-the-fly every time we run the query. We could add a column for it in our table, but then we’d need to ensure that it gets calculated correctly every time a record in the table is created, updated or deleted. Plus, since we know we’re going to need these queries a lot for displaying to the user, it would be nice if we could store it for easy access.

Database views allow you to do just that: store a query, and access it as if it were a table. You get the benefit of a common interface through which to access your data, without worrying about the complexities of persisting dynamic values.

Creating a view is pretty easy in Postgres. Let's create one with our example query above:

{% highlight sql %}
CREATE VIEW debit_account_activity AS (
  SELECT date, amount,
  sum(amount) OVER(ORDER BY date, id) AS balance
  FROM transactions WHERE account = 'debit'
);
{% endhighlight %}

Next time we want to access that data, we can just query the view as if it were a table instead of rewriting the entire query:

{% highlight sql %}
SELECT * FROM debit_account_activity;

    date    | amount | balance
------------+--------+---------
 2016-07-01 |  50.25 |   50.25
 2016-07-01 |  17.35 |   67.60
 2016-07-01 |  21.56 |   89.16
 2016-07-02 |  14.01 |  103.17
 2016-07-02 |  79.23 |  182.40
 2016-07-02 | -15.00 |  167.40
 2016-07-02 |  46.23 |  213.63
 2016-07-03 | 100.74 |  314.37
 2016-07-03 |  72.67 |  387.04
(9 rows)
{% endhighlight %}

Note that using a view in this way is analogous to creating a method; when you call `SELECT * FROM debit_account_activity`, Postgres will simply run the query you gave it when you created the view.

Many databases, including Postgres, have another type of view, called a materialized view. Materialized views will actually persist the results from the query as if it were a table. Because of this, however, they need to be refreshed whenever the underlying data changes, so they’re best for scenarios where real-time data is not a priority.

## Summary
So far, we've seen how we can use views and window functions to construct efficient queries in SQL, avoiding many of the common pitfalls encountered when pulling together data for a view. In Part 2 of this post, I'll discuss how we can use this to our advantage within Rails applications. Stay tuned!

