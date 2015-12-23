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
shared_description: We love a healthy dose of transparency at Brewhouse. Here's our year end, by the numbers.
---

<p class="excerpt">{{ site.data.recap.excerpt }}</p>

<!-- break -->
{% for highlight in site.data.recap.highlights %}
<section class="recap-section">
  <div class="container content">
    <div class="row flex">
      <div class="col-xs-12 col-md-6">
        <div class="recap-heading">
          <div class="recap-badge">
            <i class="recap-badge-icon zmdi {{ highlight.icon }}"></i>
          </div>
          <h2 class="recap-title">{{ highlight.title }}</h2>
          <div class="recap-counter">
            <ul class="recap-counter-blocks list-inline text-center">
              {% for number in highlight.amount %}
              <li>{{ number }}</li>
              {% endfor %}
            </ul>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-md-5">
        <div class="recap-desc">
          <p>{{ highlight.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</section>
{% endfor %}
