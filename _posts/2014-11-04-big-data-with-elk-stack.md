---
layout: post
title: "Big data in minutes with the ELK Stack"
author: "philippe"
category: blog
date: 2014-11-04 8:00
published: true
tags:
  - kibana
  - logstash
  - elasticsearch
  - bigdata
shared_square_image: http://blog.goodbits.io/images/posts/2014/Nov/bigdata.png
shared_description: We here at Brewhouse have built a data analysis and dashboarding infrastucture for one of our clients over the past few weeks. They collect about 10 million data points a day ...
---

We've built a data analysis and dashboarding infrastructure for one of our clients over the past few weeks. They collect about 10 million data points a day. Yes, that’s big data.

My highest priority was to allow them to browse the data they collect so that they can ensure that the data points are consistent and contain all the attributes required to generate the reports and dashboards they need.

I chose to give a try to the [ELK stack](http://www.elasticsearch.org/overview/): [ElasticSearch](http://www.elasticsearch.org/overview/elasticsearch/), [logstash](http://www.elasticsearch.org/overview/logstash/) and [Kibana](http://www.elasticsearch.org/overview/kibana/).

<!-- break -->

[ElasticSearch](http://www.elasticsearch.org/overview/elasticsearch/) is a schema less database that has powerful search capabilities and is easy to scale horizontally. Schema-less means that you just throw JSON at it and it updates the schema as you go. It indexes every single field, so you can search anything (with full text search) and aggregate and group data. Registering a new node to a cluster is a matter of installing ElasticSearch on a machine and editing a configuration file. ElasticSearch takes care of spreading data around and spliting out requests over multiple servers.

[logstash](http://www.elasticsearch.org/overview/logstash/) allows you to pipeline data from and to anywhere. This is called an ETL (for Extract Transform Load) pipeline in the Business Intelligence and Data warehousing world. This is what allows us to fetch, transform and store events into ElasticSearch.

[Kibana](http://www.elasticsearch.org/overview/kibana/) is a web based data analysis and dash boarding tool for ElasticSearch. It leverages ElasticSearch search capabilities to aggregate and visualise your (big) data in seconds.


![flow](/images/posts/2014/Nov/flow.jpg)

## *logstash*: ETL pipeline made simple

*logstash* is a simple tool that streams data from one or many inputs, transforms it and outputs it to one or many outputs.

### Inputs: read and parse data

Inputs are data sources such as log files (`/var/log/*.log`) or data stored in a *S3 bucket*, *RabbitMQ*, *redis*, etc. Once the raw data is read, *logstash* parses it using codecs such as *JSON*, *key=value*, *graphite format* etc. You can find a [full list of inputs and codecs](http://logstash.net/docs/1.4.2/) on [*logstash* documentation](http://logstash.net/docs/1.4.2/).

Let's write a *logstash* configuration file to load data from an S3 bucket containing text files with one JSON blob per line.

{% highlight ruby %}
# logstash.conf

input {
  s3 {
    bucket => "my-bucket"
    credentials => [ "aws-key", "aws-token" ]
    codec => "json"
  }
}
{% endhighlight %}


### Filters: transform and extend data

We now have data in the *logstash* pipeline. It’s time to transform it a little. Take this sample input file:

{% highlight json %}
// s3://my-bucket/input-1.txt

{ "action":"start game", "user":"bob",  "time":123456789, ip:"56.42.42.42"  }
{ "action":"win game",   "user":"kale", "time":123456792, ip:"134.26.26.26" }

...
{% endhighlight %}


We can get *logstash* to generate a proper *@timestamp* field (later used by Kibana) and to add geolocalization using the ip address with the following filters:

{% highlight ruby %}
# logstash.conf

input {
  # ...
}

filter {
  # Parse the `time` attribute as a UNIX timestamp (seconds since epoch)
  # and store it in `@timestamp` attribute. This will be used in Kibana later on.
  date {
    match => [ "time", "UNIX" ]
  }

  # Add geolocalization attributes based on ip.
  geoip {
    source => "ip"
  }
}
{% endhighlight %}

### Output: load data

The output section is quite similar to the input one. You can output to stdout (handy for debugging purpose or to pipe into another command) as well as storing into S3, loading into a database such as ElasticSearch etc.

Let’s output to stdout using ruby-debug format:

{% highlight ruby %}
input {
  # ...
}

filter {
  # ...
}

output {
  stdout {
    codec => ruby-debug
  }
}
{% endhighlight %}

and run *logstash* to ensure that everything is wound up properly:

{% highlight ruby %}
# $> logstash -f logstash.conf


{
        "action" => "start game",
          "user" => "bob",
          "time" => 123456789,
            "ip" => "56.42.42.42",
      "@version" => "1",
    "@timestamp" => "1973-11-29T21:33:09.000Z",
          "path" => "s3://my-bucket/input-1.txt",
         "geoip" => {
                      "ip" => "56.42.42.42",
           "country_code2" => "US",
           "country_code3" => "USA",
            "country_name" => "United States",
          "continent_code" => "NA",
             "region_name" => "NC",
               "city_name" => "Raleigh",
             "postal_code" => "27668",
                "latitude" => 35.79769999999999,
               "longitude" => -78.6253,
                "dma_code" => 560,
               "area_code" => 919,
                "timezone" => "America/New_York",
        "real_region_name" => "North Carolina",
                "location" => [
            [0] -78.6253,
            [1] 35.79769999999999
        ]
    }
}
# ...
{% endhighlight %}

Nice, all attributes were parsed properly and we now have *@timestamp* and *geoip* attributes.

Our final configuration file looks like this:

{% highlight ruby %}
input {
  s3 {
    bucket => "my-bucket"
    credentials => [ "my-aws-key", "my-aws-token" ]
    region_endpoint => "us-east-1"
    # keep track of the last processed file
    sincedb_path => "./last-s3-file"
    codec => "json"
  }
}

filter {
  # set the event timestamp
  date {
    match => [ "time", "UNIX" ]
  }

  # add geoip attributes
  geoip {
    source => "ip"
  }
}


output {
  elasticsearch_http {
    host => "localhost"
    port => "9200"
  }
}

{% endhighlight %}


There is quite a lot going on in just a few lines of code, eh?

On top of this *logstash* keeps track of the inputs it had processed. So you can restart it without being concerned of data duplication.

Although *logstash* is written in *Ruby*, it is really fast. The packaged version runs on *JRuby* and it takes advantage of the JVM's threading capabilities by throwing a dozen of threads to parallelize data processing.

## ElasticSearch & Kibana

*logstash* is now ready to store data into *ElasticSearch*. Getting ElasticSearch running on your machine [takes minutes](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/setup.html). [Setup Kibana](http://www.elasticsearch.org/overview/kibana/installation/) and you can now browse your data. A couple of clicks later, you've got a good looking dashboard.

![kibana-dashboard](/images/posts/2014/Nov/kibana.jpg)

### Setting this up in production

There is an excellent [chef cookbook](https://github.com/lusis/chef-logstash) to deploy *logstash* in minutes.

We decided to use a hosted solution to manage the ElasticSearch cluster. The top two seem to be [qbox.io](http://qbox.io) and [found.no](http://found.no). [found.no](http://found.no) provides reserved instance and allows you to scale your cluster without any downtime.

Kibana comes as a plugin on all hosted ElasticSearch services, so you just have to tick a checkbox and you're ready to go!

Performance wise, an ElasticSearch cluster with 4 x [Amazon EC2 c3.xlarge](http://aws.amazon.com/ec2/instance-types/#Compute_Optimized) is sufficient to run Kibana reports on the last 30 days. This is about 3 billion data entries.

## ELK store and visualize huge amounts of data in minutes

*logstash* enabled me to deliver a ETL pipeline that is highly performant, reliable and easy to maintain in a matter of hours. *Elastic Search* is a no brainer data base that ingests anything you throw at it and scales horizontally when need be. *Kibana* allows you to make sense of your data and publish dashboards in minutes. I recommend you giving it a try to these powerful and simple tools.

Kibana 4 is on the way and a final version should be released in the next couple of months. It provides new features to generate business-oriented reports such as unique counts, funnels, etc. Until then, and to report on years of data, we've implemented a pipeline to load data into the data warehouse solution [Amazon Redshift](http://aws.amazon.com/redshift/). But this is a whole other story.

If this is a project you're working on and would like some help, reach out for a chat!
