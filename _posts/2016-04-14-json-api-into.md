---
layout: post
title: "Uploading Base64 Images Through a Rails API"
author: "paulo"
date: 2016-04-29 8:00
published: true
tags:
  - rails
  - jsonapi-resource
  - rspec-api-documentation
  - apitome
shared_description: ""
---

Let’s say we have a [Rails](http://rubyonrails.org) app that uploads images using `carrierwave`. We want to extend this functionality to let a mobile app upload images as well. The only constants we know are that the photos should be sent to our Rails app through a RESTful JSON API, and that the images are strings encoded in base64.

<!-- break -->

# Here are the tools that we are going to use
- [carrierwave-base64](https://github.com/lebedev-yury/carrierwave-base64) - Upload files encoded as base64 to carrierwave.
- [jsonapi-resources](https://github.com/cerebris/jsonapi-resources) - provides a framework for developing a server that complies with the JSON API specification.

_For The Stretch Goal_

- [rspec_api_documentation](https://github.com/zipmark/rspec_api_documentation) - Generate pretty API docs for your Rails API
- [apitome](https://github.com/modeset/apitome) - Rails viewer for the documentation

# Add Models to DB and mounting the uploader
_Implementing carrierwave-base64_

We need a place to store the images. We could use a generator to create a `Post` table that has an `image` column which stores strings.
{% highlight ruby %}
>$ rails g model post image:string
>$ rake db:migrate
{% endhighlight %}

With our generated model, we attach a base64 image uploader which will allow us to attach an object in the fields of our database. The code still looks like an ordinary `carrierwave` implementation -- but with a really small difference. Instead of having `mount_uploader` in the model, we would add `mount_base64_uploader` instead.

{% highlight ruby %}
# app/models/post
class Post < ActiveRecord::Base
  mount_base64_uploader :image, ImageUploader
end

# app/uploaders
class ImageUploader < CarrierWave::Uploader::Base; end
{% endhighlight %}

{% highlight ruby %}
# rails console
p = Post.new
base64_image = Base64.encode64(File.read(awesome_picture.jpg))
p.image = "data:image/jpg;base64,#{base64_image}"
p.save!
{% endhighlight %}

Now that can save a base64 image, we now have to create an API endpoint that our mobile app can call so they can post images.

# Creating the JSON API Endpoint
__implementing jsonapi-resources__

Although there is a lot more to explore in `jsonapi-resources`, I will only touch on just a few of its really cool features. I believe this gem deserves it's own blogpost on how much benefit it provides with just a few lines of code.

Now let's create a `jsonapi-resources` controller and resource with generators that the gem provides.
{% highlight ruby %}
>$ rails generate jsonapi:resource api/post
# =>
# app/resources/api/post_resource.rb
class Api::PostResource < JSONAPI::Resource; end

# app/controllers/api/application_controller.rb
class Api::ApplicationController < JSONAPI::ResourceController
  protect_from_forgery with: :null_session
end

# app/controllers/api/posts_controller.rb
class Api::PostController < Api::ApplicationController; end

# config/router.rb
namespace "api" do
  jsonapi_resources :post, only: [:create]
end
{% endhighlight %}

Although the `ApplicationController` that we have written inherits from the `jsonapi-resources` controller. This can also be a normal controller that includes a `ActsAsResourceController`.

In the routes, we are using `jsonapi_resources` method. This gives us a lot of useful endpoints. For the sake of this example, let's just focus on a posting endpoint and add `only: [:create]`. Thus giving:
{% highlight javascript %}
api_post POST   /api/posts(.:format)           api/posts#create
{% endhighlight %}

This is actually all we need to post a base64 image through an API. From here we can use postman
{% highlight javascript %}
curl -X POST -H "Content-Type: application/vnd.api+json" -H "Cache-Control: no-cache" -H "Postman-Token: 233cdeb0-ba65-7bd5-c550-8e8b79e181bb" -d '{
  "data": {
      "type": "post",
      "attributes": { "image": "data:image/png;base64,..." }
  }
} ' "http://localhost:3000/api/posts"
{% endhighlight %}

# Stretch Goal: Testing & Documentation
_rspec api documentation_

It is important to test and document API implementations. With `rspec_api_documentation`, we can do both at the same time. In my opinion, the best part of using this gem is that it does not generate the documentation for a failed example. Also, example documentation can be skipped with the `document: false` option.

{% highlight ruby %}
# spec/acceptance/post_spec.rb
require "rails_helper"
require "rspec_api_documentation/dsl"

resource "Posts" do
end
{% endhighlight %}

To set up our test, we would have to first include `rspec_api_documentation` dsl. This gives us wrappers to have headers to our requests and setting HTTP verbs as context. We also use `resource` instead of `describe` to define what we are testing.

{% highlight ruby %}
resource "Posts" do
  def request_attributes
    {data: {
       type: "post", attributes: {
         image: valid_base64_image,
         caption: "Small caption",
         campaign_id: campaign.id } } }
  end

  header "Accept", "application/vnd.api+json"
  header "Content-Type", "application/vnd.api+json"
end
{% endhighlight %}

Below I have added a method that will be passed in a request method in my "example" ("example" in an acceptance test is analogous to an `it` block). A header method takes in 2 arguments: the header field name as a string and the header value.

{% highlight ruby %}
resource "Posts" do
  def request_attributes...

  post "/api/posts" do
    example "Post a photo" do
      do_request(request_attributes)
      expect(status).to eq 201

      images = JSON.parse(response_body)["data"]["attributes"]["image"]
      expect(images["image"]["url"]).to be_present
    end
  end
end
{% endhighlight %}

Now, let's examine what goes in the test. In `rspec` we normally use `describe` or `context`. In an `rspec_api_documentation` test, we use the http verb, followed by the path that we want to test. It also takes in a block that contains a `do_request` method. This method can take in an argument. In a `GET` request, it does not need an argument, but for our case, the `POST` request takes in a hash as an argument.

Run the test and generate the docs with:
{% highlight ruby %}
>$ rake docs:generate

# Or jus run the test without generating the documentation
>$ rspec spec/acceptance
{% endhighlight %}

In the beginning of this post, I have also mentioned `apitome`. This is just a wrapper for the `json_api_documentation` to make it prettier
