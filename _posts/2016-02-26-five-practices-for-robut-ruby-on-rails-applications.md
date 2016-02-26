---
layout: post
title: "Five practices for robust Ruby on Rails applications"
author: philippe
date: 2016-02-26 12:00
shared_description: A few extra keystokes here and there can make a Rails application robust.
draft: false
published: true
---


Whenever I come across a rails application with inconsistent data or bugs that are hard
to nail down I tell myself: "They (the developers) were just a couple of keystokes away from preventing those issues from happening".

At [brewhouse](http://brewhouse.io), we follow five simple practices to make our Rails application robusts. It all comes down to failing early, loudly and often. We ensure that data is valid and applications behave properly by catching issues early on.

<!-- break -->

## Use `Hash#fetch` to catch malformed hash

`unexpected method 'upcase' for nil`... Whenever you expect a Hash to contain a key, prefer `fetch()` over
`[]`. `fetch()` will raise an error when the key is missing so you won't
pass `nil` values around and see unrelated errors happening down the
line.

## `case ... else raise` to catch invalid data

Always add an `else raise ...` clause to your `case` statements. You
want to know when you've received an unexpected value rather than
ignoring it and moving on.

## Use ActiveRecord `!` methods to fail loudly

Data is often being seen as the most valuable asset in a company. Failing silently to persist data can have a huge impact then.
Whenever you're not expecting an operation to fail, use the "bang"
version of `create!`, `update!` and `destroy!` that raise exceptions on
failure. This extra key stroke
will save you from dealing with inconsistent data.

Used in test code, it ensures that the setup doesn't fail silently...
there is nothing worse than a test that passes because the setup was
incorrect.

Also, always wrap multiple calls into an SQL transaction to prevent your data from getting into an in-between state.

## Add ActiveRecord validations to perform live checks

Pairing ActiveRecord validations with the use of 'bang methods' is a great way to ensure you persist valid data. For example:

{% highlight ruby %}
class Post < ActiveRecord::Model
  validates :author, :blog, presence: true
  validates :published_by, presence: true, if: :published?
  validates :comment_count, numericality: { greater_or_equal_to: 0 }
  # ...
end
{% endhighlight %}

## Use database constraints to ensure data consistency

Your database is your best friend when it comes to ensuring data is
present, not duplicated and that orphans are not left in the database.

### `null: false`

Given the fact that the large majority of columns are required in a database, you should define columns with `null: false` by default.

### `index ... unique: true`

Did you know that rails `has_one` does not prevent duplicate
associations from being created?

{% highlight ruby %}
class Account
  has_one :account_settings
end

account = Account.create!
account.create_account_settings!
account.create_account_settings!
account.create_account_settings!

account.account_settings
 # => one of the three account settings you've created... -_-
{% endhighlight %}

The best way to prevent this from making data inconsistent is to add a unique index.

{% highlight ruby %}
add_index :account_settings, :account_id, unique: true
{% endhighlight %}

The database will throw an error if you attempt to persist a duplicate
record.

### `foreign_key`

You don't want orphan records in your database, do you?

Foreign keys help such things from happening. I'd recommend using the ruby gem
[schema_auto_foreign_keys](https://github.com/SchemaPlus/schema_auto_foreign_keys) to automatically add foreign keys on your
behalf.

## A few extra keystrokes goes a long way

A few extra keystrokes here and there can save you from hours of
debugging or recovering from inconsistent data. Use `!`, `raise`,
`validate` and database constraints. Your coworkers and future-self
will thank you.

As always, feedback is greatly appreciated. I'd be happy to hear of any other practices I didn't cover here.
