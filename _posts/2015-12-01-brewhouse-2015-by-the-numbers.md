---
layout: yearly_recap
title: "Brewhouse 2015 - by the numbers"
author: "kalv"
category: blog
date: 2015-12-30 8:00
published: true
tags:
  - brewhouse
  - numbers
shared_description: We love a healthy dose of transparency at Brewhouse. Here's our 2015 year end, by the numbers.
---

<p class="excerpt">{{ site.data.recap.excerpt }}</p>

<!-- break -->
{% for highlight in site.data.recap.highlights %}
<section class="recap-section">
  <div class="container content">
    <div class="row flex">
      <div class="col-md-6">
        <div class="recap-heading text-center">
          <div class="recap-badge">
            <i class="recap-badge-icon zmdi {{ highlight.icon }}"></i>
          </div>
          <h2 class="recap-counter">{% for number in highlight.amount %}{{ number }}{% endfor %}</h2>
          <h3 class="recap-title">{{ highlight.title }}</h3>
        </div>
      </div>
      <div class="col-xs-12 col-md-5">
        <div class="recap-desc">
          <blockquote>
            {{ highlight.desc | markdownify }}
            <div class="social-actions">
              <a href="https://twitter.com/share?via=BrewhouseTeam" class="twitter-share-button" data-lang="en" data-url="http://brewhouse.io{{ page.url }}" data-related="chancancode,kalv,pcreux,chuckbergeron" data-counturl="{{ page.counturl }}" data-text="{{ highlight.desc }}">Tweet</a>
            </div>
          </blockquote>

          {% if highlight.details %}
            <div class="recap-details">
              {{ highlight.details | markdownify }}
            </div>
          {% endif %}

        </div>
      </div>
    </div>
  </div>
</section>
{% endfor %}
