---
layout:    post
title:     "Fixing a slow Rails development server"
author:    "philippe"
category:  blog
date:      2015-04-27 10:00
published: true
tags:
- performance
- rails
shared_square_image: http://brewhouse.io/images/posts/2015/04/faster-rails-dev.jpg
shared_description: How we've fixed a slow Rails dev environment and made it 7 times faster
---

We recently helped one of our clients speed up their Rails app in development mode.

This Rails 3.2 application runs on Ruby 2.1, it has 200+ models, 1,500+ routes and rendering a page in development mode takes about **12 seconds**. After 250 requests, this number goes up to **30 seconds**!

Within a couple of days, we succeeded to make it **7 times faster** on average in development environment.

![Success chart](/images/posts/2015/apr/perf-chart-over-fixes.png)

Please join us on this journey towards better performance, developer-happiness, and saving **$$$**!

<!-- break -->

## Speed up serving individual assets by 14x

Visiting the home page would take about 4 seconds to render and 7 more seconds to serve about 100 asset files.

Serving 100 asset files should not be that slow to serve. We used [Flame Graphs](https://github.com/SamSaffron/flamegraph) with [rack-mini-profiler](https://github.com/MiniProfiler/rack-mini-profiler) to dig into this.

To set this up, just add the following to your `Gemfile`:

{% highlight ruby %}
gem 'flamegraph'
gem 'rack-mini-profiler'
{% endhighlight %}

... and visit a page with `?pp=flamegraph`. Boom! It displays a Flame Graph!

Flame Graphs are disabled for assets by default, so comment out [this line](https://github.com/MiniProfiler/rack-mini-profiler/blob/a0117654f02e97db999ba41a20c8c4c5d5291ace/lib/mini_profiler_rails/railtie.rb#L23) to render a Flame Graph for assets.

Here is a Flame Graph for rendering `/assets/jquery.js`:

![Original Flame Graph](/images/posts/2015/apr/perf-flamegraph-assets.png)


90% of the time serving assets is spent running the garbage collector (GC) because of a custom rack middleware. This custom rack middleware would disable the Garbage Collector for the duration of the request and trigger a Garbage Collection at the end of it. While this middleware had a positive impact in production, it was responsible for slowing down serving assets in development environment by 14x.

Disabling this middleware in development environment brought serving 100 assets from 7 seconds down to 0.5 seconds. Serving a page with assets would take 5 seconds, instead of 10. That's **2x faster!**

## ActiveAdmin, Y U RELOAD?

Now that the asset issue is fixed, let's see what we can do to speed up page rendering. We decided to focus on rendering a page without changing any files.

![Flame graph serve page](/images/posts/2015/apr/perf-flamegraph-before.png)

As you can see, ActiveAdmin reloads its configuration files which isn't necessary. We've [submitted a patch](https://github.com/activeadmin/activeadmin/pull/3783) which saves about a second to render a page. **1.2x faster!**

## Routes, Y U RELOAD?

The previous Flame Graph shows that the routes were reloaded with no reason. Digging into the Flame Graph, we figured out that [rails_dev_tweaks](https://github.com/wavii/rails-dev-tweaks) was responsible for this. Upgrading to the latest version fixed that bug and saved another two seconds. **1.4x faster!**

## One worker is enough!

Seven unicorn workers were used in dev environment in order to mitigate the slow asset issue. Now that it's fixed, we get similar performances with a webrick server to run one request.

Using one worker is obviously better for memory usage as it uses about 7x less memory. That prevents swapping and speeds up the entire system. It is also better for Rails code reloading and caching since having seven workers means that each worker will have to reload the code or recompile an asset when you perform a change.

Here is a chart that demonstrates this problem using seven workers. We perform a code change, and then refresh the page 10 times. The first request hits a unicorn worker that reloads the code (4 seconds). The second request hits another unicorn worker that reloads the code (4 seconds). The third request is lucky and hits a worker that has already reloaded the code (2 seconds). And so on... After the tenth request, 6 out of 7 workers have reloaded the code.

![Response time for 7 workers](/images/posts/2015/apr/perf-chart-7-workers.png)

With one webrick worker, the code is reloaded once at the first request:

![Response time for 1 worker](/images/posts/2015/apr/perf-chart-1-worker.png)

## Less code reloads = less memory leaks

After 250 requests, it would take about 30 seconds to serve a page and the web server would take about 1gb of memory. The fixes we introduced which prevented unnecessary code reloads helped mitigate the memory leak. After 250 requests, it would only take 2 seconds to serve a page. **15x faster!**

![Chart response time after 250 requests](/images/posts/2015/apr/perf-chart-250-requests.png)

## Measure it, spot it, fix it and make it better, faster, stronger

The process we followed was pretty straightforward:

1. Measure response time using the Chrome Developer Tools and [ApacheBench](http://httpd.apache.org/docs/2.2/programs/ab.html)
2. Find a bottleneck with [rack-mini-profiler](https://github.com/MiniProfiler/rack-mini-profiler) and [Flame Graphs](https://github.com/SamSaffron/flamegraph)
3. Fix it
4. Repeat until the performances are good enough

We fixed a rack middleware that was forcing GC runs, we improved ActiveAdmin to only reload code when necessary, we upgraded a rack middleware (rails_dev_tweaks) that was forcing code reloads, and we finally used only one web worker to reload code once after a file change.

In the end, the app is 3x faster when loading a page after a code change and up to 17x faster when loading a page without code change and after 250 requests. It took us a couple of days to make this application **3 to 17 times faster** in development environment.

With 10 developers working on it full-time... well, I'll let you do the math!
