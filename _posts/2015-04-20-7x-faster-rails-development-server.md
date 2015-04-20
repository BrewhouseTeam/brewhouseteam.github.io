---
layout:    post
title:     "7x faster Rails development server"
author:    "philippe"
category:  blog
date:      2015-04-10 10:00
published: true
tags:
- performance
- rails
shared_square_image: http://brewhouse.io/images/posts/2015/apr/faster-rails-dev.png
shared_description: Truth Tables help writing readable tests that are easy to maintain.
---

We recently helped one of our clients speed up their Rails app by 3x - 17x, in development mode.

It is a large Rails 3.2 application running on Ruby 2.1, with 200+ models and 1,500+ routes.
Rendering a page in development mode would take about **12 seconds**. After a couple of hours, it would go up to **30 seconds**.

While the application is fairly large, those numbers were quite high, so we knew there was something wrong going on.

We followed this process:

1. Measure response time using the Chrome Developer Tools and [ApacheBench](http://httpd.apache.org/docs/2.2/programs/ab.html).
2. Find bottlenecks with [rack-mini-profiler](https://github.com/MiniProfiler/rack-mini-profiler) and [Flame Graphs](https://github.com/SamSaffron/flamegraph).
3. Fix the bottleneck.
4. Go to step 1.

Please join us on this journey towards better performance, developer-happiness, and saving $$$!

## Speed up assets by 14x

Visiting the home page would take about 4 seconds to render and 7 more seconds to serve about 100 assets.

Serving 100 asset files should not be that slow to serve. We used [Flame Graphs](https://github.com/SamSaffron/flamegraph) with [rack-mini-profiler](https://github.com/MiniProfiler/rack-mini-profiler) to dig into this.

Setting it up was easy. Just add the following to your `Gemfile`:

{% highlight ruby %}
gem 'flamegraph'
gem 'rack-mini-profiler'
{% endhighlight %}

Visit a page with `?pp=flamegraph` and instead of displaying the page, it displays a Flame Graph!

Flame Graphs are disabled for assets by default, so comment out [this line](https://github.com/MiniProfiler/rack-mini-profiler/blob/a0117654f02e97db999ba41a20c8c4c5d5291ace/lib/mini_profiler_rails/railtie.rb#L23) to render a Flame Graph for assets.

Here is a Flame Graph for rendering `/assets/jquery.js`:

![Original Flame Graph](/images/posts/2015/apr/perf-flamegraph-assets.png)


90% of the time, serving assets was spent running the Garbage Collector because of an OutOfBandGC rack middleware. While this middleware had a positive impact in production, it was also responsible for slowing down serving assets in the development environment by 14x.

We disabled the OutOfBandGC in the development environment to serve assets in 0.5 seconds, instead of 7 seconds. Serving a page with assets would take 5 seconds, instead of 10. That's **2x faster!**

## ActiveAdmin, Y U RELOAD?

Now that the asset issue is fixed, let's see what we can do to speed up page rendering. We decide to focus on rendering a page without changing any files.

![Flame graph serve page](/images/posts/2015/apr/perf-flamegraph-before.png)

As you can see, ActiveAdmin reloads its configuration files which isn't necessary. We've [submitted a patch](https://github.com/activeadmin/activeadmin/pull/3783) which saves about a second to render a page. **1.2x faster!**

## Routes, Y U RELOAD?

The previous Flame Graph shows that the routes were reloaded with no reason, as well. Digging into the Flame Graph, we figured out that [rails_dev_tweaks](https://github.com/wavii/rails-dev-tweaks) was responsible for this. Upgrading to the latest version fixed that bug and saved another two seconds. **1.4x faster!**

## One worker is enough!

Seven unicorn workers were used in dev environment in order to mitigate the slow asset issue. Now that it's fixed, we get similar performances with a webrick server to run one request.

Using one worker is obviously better for memory usage as it uses about 7x less memory. That prevents swapping and speeds up the entire system.

It is also better for Rails code reloading and caching. When you change a ruby file, Rails reloads this file which take an extra 2 seconds. When you change an asset file, Rails has to recompile the assets which takes another extra 2 seconds, on average. With multiple workers, each worker has to reload and recompile the first time you hit it after a change. So changing a file is likely to not only impact the next request you perform but also the subsequent requests that hit a worker that's out of date.

Here is a chart that demonstrates this problem using seven workers:

![Response time for 7 workers](/images/posts/2015/apr/perf-chart-7-workers.png)

With one webrick worker:

![Response time for 1 worker](/images/posts/2015/apr/perf-chart-1-worker.png)

## What about that memory leak?

Those fixes mitigated the memory leak that was slowing down Garbage Collection. After 250 requests, it would take about 30 seconds to serve a page and its assets -- the fixes we introduced brought that number down to 2 seconds. **15x faster!**

![Chart response time after 250 requests](/images/posts/2015/apr/perf-chart-250-requests.png)

## Measure it, spot it, fix it and make it better, faster, stronger

We've been able to spot and fix bottlenecks, one after the other, until the performance was okay. Rack Mini Profiler and Flame Graph helped us a bunch to find bottlenecks. In the end, this process was pretty straightforward.

It took us a couple of days to make this application 7 times faster on average in dev environment. Knowing that 10 developers worked on it full-time... I'll let you do the math!
