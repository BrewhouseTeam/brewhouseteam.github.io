---
layout: post
title: "CarrierWave, Cloudinary and the path to Image Manipulation Enlightenment"
author: alex
date: 2016-04-08 16:20
tags:
  - example
  - tags
  - here
shared_description: You can integrate CarrierWave with Cloudinary to generate and serve images on-the-fly with user-specified content.
published: true
---

Images on the web are tricky business these days. With the rise of high-density screen resolutions, there's an increasing need to serve up a multitude of sizes and formats. Manipulation is also key: users want the ability to crop and edit their photos, even perform more advanced manipulations like colour correction and compositing.

For some time now, [ImageMagick](http://www.imagemagick.org/script/index.php) has been the mainstay for programmatic image manipulation. However, there's a new neighbour on the block, and they live in the cloud.

[Cloudinary](http://cloudinary.com/) is a SaaS product that offers storage and manipulation of images and video. Like Amazon S3 or Rackspace Cloud Files, it provides object storage for media assets. But the real magic of Cloudinary is its ability to dynamically generate and manipulate images on-the-fly.

We've been playing with Cloudinary recently on a client project, and I wanted to share a couple of tips on integrating Cloudinary into a standard Rails/CarrierWave workflow, as well as some general Cloudinary tips on image manipulation.

<!-- break -->
Let's get started!

## Photoshop meets URLs
Cloudinary has a [fantastic API](http://cloudinary.com/documentation/) for image manipulation, and *any* manipulation you can perform through the API can also be done right in the URL. Any public Cloudinary asset can be retrieved and manipulated on-the-fly using this scheme. Let's look at an example.

To start, I uploaded an SVG of the Brewhouse logo to Cloudinary. Here's that logo served as a 200x200 JPG:

![brewhouse logo](http://res.cloudinary.com/brewhouse-cloudinary-dev/image/upload/c_scale,h_200,w_200/v1460139153/brewhouse-logo.jpg)

The magic is all in the URL (I've split it into multiple lines here for readability):

{% highlight javascript %}
http://res.cloudinary.com/brewhouse-cloudinary-dev/
image/upload/c_scale,h_200,w_200/v1460139153/brewhouse-logo.jpg
{% endhighlight %}

This image will be generated on-the-fly the first time it's requested, and the derived image immediately cached for subsequent requests. Even on the first request, however, it's pretty darn fast.

Give it a shot - copy that URL and play with the parameters. For example, you could request `brewhouse-logo.png`, or `h_500,w_500`.

## It's Party (parrot) time
Let's do a more advanced example. The Brewhouse logo is pretty awesome, but I think it would be cooler like this:

![house of the brewparrot](http://res.cloudinary.com/brewhouse-cloudinary-dev/image/upload/c_scale,w_70,b_white/u_brewhouse-logo,c_scale,w_200,y_85,x_-5/party-parrot.gif)

{% highlight javascript %}
http://res.cloudinary.com/brewhouse-cloudinary-dev/
image/upload/c_scale,w_70,b_white/
u_brewhouse-logo,c_scale,w_200,y_85,x_-5/
party-parrot.gif
{% endhighlight %}

It's so mesmerizing. I can't... look... away...

## CarrierWave + Cloudinary
Cloudinary provides [a Ruby gem](https://github.com/cloudinary/cloudinary_gem) that seamlessly integrates with CarrierWave. You can use CarrierWave as normal, and simply `include Cloudinary::CarrierWave` in your uploader to get going.

You can chain standard CarrierWave manipulations with Cloudinary-specific transformations. The Cloudinary gem provides a `cloudinary_transformation` method which allows you to use Cloudinary transformations in your versions:


{% highlight ruby %}
  version :thumb do
    process :eager => true
    process :resize_to_fill => [250, 250]
    cloudinary_transformation :quality => 80
  end
{% endhighlight %}

## Dynamic image creation from the ground up

A particularly challenging problem we encountered recently was the need to dynamically composite multiple images and text together *and store the result* on Cloudinary. There were a couple of issues with this:

1. Cloudinary transformations operate on a single base image; you can add text and images to this base image, but you can't start with an empty "canvas" and build up from there. If we rely on a dynamic Cloudinary transformation to composite our final image, then the image that we're technically *storing* - the base image - will not accurately represent our intent. For example, if we're compositing two images together, one must be chosen and used as the base image to which all transformations are applied. This can get confusing when the image you're *storing* is simply an asset for the image you *want.*
2. Because of how CarrierWave uploaders get dynamically instantiated as they're needed, it can be tricky to provide your uploaders with runtime variables to use in your image manipulations.
3. Cloudinary's `cloudinary_transformation` method is a wrapper around the standard CarrierWave `process` method, which further amplifies the problem of using runtime content in your transformations.

One solution, of course, is to simply perform the dynamic generation in the URL, as above. But doing it this way does not allow you to store and use the derived image as you would any other image attached to a record; it also does nothing to solve problem #1.

After some head-scratching and code grokking, I found an elegant solution to all three problems which lets us harness the full power of Cloudinary, CarrierWave and user-generated content. I'll begin by outlining my solutions; the full code is provided below.

### Problem 1: Starting with a clean slate
Let's say I want to create an image with a company logo, an illustration, and some text. Conceptually, I want to think of this image not as a series of manipulations to the logo, but as a blank canvas to which all elements are added, resulting in an entirely new image. The solution to this was simple: use an empty image!

I used my formidable (ahem) design skills to craft a perfectly white 25x25 PNG. This becomes the "base image" for our transformation, and the first step is to resize it to whatever canvas size you desire. 

### Problem 2: Making it dynamic
CarrierWave creates callbacks for each processor step that you define in your uploaders. The scope in which these callbacks get executed makes it difficult to pass runtime parameters into your uploaders. Thankfully, CarrierWave provides a `model` helper method which allows you to access attributes on the record instance to which the image will be attached.

### Problem 3: Making it dynamic... with Cloudinary
Cloudinary's `cloudinary_transformation` method is a simple wrapper around CarrierWave's `process` and allows CarrierWave to hook into Cloudinary for image processing. But here's the rub: since `process` ends up getting called from within the Cloudinary gem itself, it doesn't have access to the `model` helper, and therefore does not allow you to specify dynamic content (at least not without some potentially ugly monkey-patching).

The most straightforward solution would be one that allowed developers to easily reason about the transformations in one place, and the logical place for that code is in the uploader. To accomplish this, I bypassed the `cloudinary_transformation` method entirely and instead provided a hash of all the Cloudinary transformation parameters. Since the hash is being created within the uploader, it has access to `model`, and so we can populate that hash in any way we please:


{% highlight ruby %}
  process :generate_on_upload
  
  def generate_on_upload
    {
      transformation: [
        resize_base_image,
        add_illustration,
        add_header_text,
        add_subtext,
        add_logo
      ]
    }
  end

  def add_illustration
    illustration = model.illustration.public_id
    { overlay: illustration, y: -75, width: 300 }
  end

  # etc ...

{% endhighlight %}

This hash is evaluated whenever an image is attached to a record. 

You're not limited to just model attributes; with attribute accessors defined on your uploader, you can pass in whatever you want:


{% highlight ruby %}
class CompositeImageUploader < CarrierWave::Uploader::Base
  attr_accessor :my_awesome_title
   
  process :my_transform

  def my_transform
    {
      transformation: [
        { overlay: "text:Arial_30:Hello #{@my_awesome_title}"},
        { overlay: "text:Arial_30:Hello #{model.title}"},
      ]
    }
  end
end
{% endhighlight %}


{% highlight ruby %}
File.open(base_image) do |f|
  company.illustration.my_awesome_title = "Hello instance vars!"
  company.illustration = f
  company.save!
end
{% endhighlight %}

The result is an uploader which can be customized at runtime to dynamically generate an image which can be accessed just like any other CarrierWave image. This is super useful if you need to composite an image and then serve different versions of that image (thumbnail, small, large, etc). Plus, if you define your processing outside of a version as above, the "base image" that gets uploaded to Cloudinary will be the actual composite, not whatever your base image is (goodbye, white square!)

![generated image](http://res.cloudinary.com/brewhouse-cloudinary-dev/image/upload/v1460146312/campaign-banner-1.png)


Below is the full uploader code that I used in this example, followed by a short snippet that demonstrates how to kick off an upload:

`app/uploaders/composite_image_uploader.rb`

{% highlight ruby %}
class CompositeImageUploader < CarrierWave::Uploader::Base
  include Cloudinary::CarrierWave

  def public_id
    "#{model.class.to_s.underscore}-#{mounted_as}-#{model.id}"
  end

  # Calling 'process' outside of a version block causes the image to be
  # processed before it's stored. As a result, subsequent requests
  # for versions will use a pre-composited image.
  process :generate_on_upload

  version :thumb do
    process :eager => true
    process :resize_to_fill => [250, 250]
  end

  # Returns a group of Cloudinary transformations which will be applied
  # in order when the image is uploaded
  def generate_on_upload
    {
      transformation: [
        resize_base_image,
        add_illustration,
        add_header_text,
        add_subtext,
        add_logo
      ]
    }
  end

  private
  def resize_base_image
    { crop: 'scale', width: 570, height: 630 }
  end

  def add_illustration
    illustration = model.illustration.public_id
    { overlay: illustration, y: -75, width: 300 }
  end

  def add_header_text
    { overlay: "text:Arial_40:#{headline}", color: 'rgb:818181', y: 150 }
  end

  def add_subtext
    # The dimensions you specify in a text overlay will determine how the text
    # is wrapped, as long as you also specify crop: 'fit'
    { overlay: "text:Arial_28_text_align_center:#{subtext}",
      width: 425, height: 400, crop: 'fit', y: 225
    }
  end

  def headline
    "House of the BrewParrot"
  end

  def subtext
    # The Cloudinary gem provides the 'smart_escape' method to sanitize strings
    # destined for its transformation engine.
    Cloudinary::Utils.smart_escape "When you party with The Parrot, the fun never stops."
  end

  def add_logo
    { overlay: model.logo.public_id, y: 75, width: 90 }
  end
end
{% endhighlight %}


{% highlight ruby %}
# Trigger a CarrierWave upload from an existing image in your assets pipeline.
# Processing will occur when the image is saved.
File.open(base_image) do |f|
  company.advert = f
  company.save!
end

# ...

def base_image
  File.join(
    Rails.root, 'app', 'assets', 'images', 'base_25x25.png'
  )
end

{% endhighlight %}

### Conclusion
With a little extra work, we can use CarrierWave to store images which have been composited with Cloudinary. Not only that, but we can pass options to Cloudinary at runtime in order to manipulate images based on user input or existing data.

If you're looking for a solution for dynamic image manipulation with Cloudinary, I hope you found this article useful! I'd love to hear your feedback in the comments below.


[(parrot image source)](http://s242.photobucket.com/user/texasbelle4732/media/Avatars/ParrotParty.jpg.html)

