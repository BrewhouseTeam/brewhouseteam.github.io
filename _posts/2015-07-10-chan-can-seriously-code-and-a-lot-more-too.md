---
layout: post
title: "Chan can seriously code and a lot more too!"
author: "kalv"
date: 2015-07-10 16:13
tags:
  - team
shared_square_image: http://brewhouse.io/images/posts/2015/07/horse-chan-social.jpg
shared_description: Chan can seriously code and a lot more too! Godfrey Chan is moving on from Brewhouse.
draft: false
published: true
---

![HorseChan](/images/posts/2015/07/horse-chan.jpg)

Today is a bittersweet day for us, Godfrey Chan is moving on from Brewhouse and also Vancouver.

I first met Godfrey when he came back to Vancouver from some time away, he became very involved with the [Vancouver Ruby meetup](http://vanruby.org/) I was helping to organize. We found a similar interest with disrupting the web application monitoring space and very soon found ourselves working together on [Caliper](http://caliper.io) (a Javascript monitoring startup) and then Brewhouse the end of 2013.

Godfrey has been an essential member of the team that has helped build Brewhouse to what it is today. His passion for the development community both digitally and through in-person meetups has helped build the foundation on how Brewhouse works with the community today.

He is an active [core team member of Rails](http://rubyonrails.org/core/) and helped get the developer nights going and mentored a number of developers in town.

When I first saw him speak at a [VanRuby](https://vanruby.org) lightning talk event, his talk was more of a conference quality presentation, entertaining and educating. I knew at that moment he would give talks to even larger audience—he did that and much more; this year alone he’s spoken at  [EmberConf](https://www.youtube.com/watch?v=PXB93Z8azZE), [RailsConf](https://www.youtube.com/watch?v=IjbYhE9mWuk), [Ruby Nation](http://www.rubynation.org/) and [GoRuCo](http://goruco.com/).

He dogfooded our own product, [Goodbits.io](https://goodbits.io) by starting [This Week in Rails](https://rails-weekly.ongoodbits.com/)—the best email roundup focused on what’s happening with Rails and the Rails community. ([Sign up](https://rails-weekly.ongoodbits.com/) if you want to know what’s going on with edge Rails!)

Amongst the many things we’ll miss, we’ll miss these the most:

- The many uses of emoji icons in our team Slack, even more now that they've [released emoji reactions](http://slackhq.com/post/123561085920/reactions)!
- His quick puns that truly are priceless, we’re going to have to make a bot from all his previous replies
- Bowling with Godfrey, which was like watching a ballerina break dance (you have to see it to believe it)
- His ability to pull the best face in all photos (below was our first Brewhouse meeting photo, I think he was trying to pull the trollface)

![First BrewhouseTeam meeting](/images/posts/2015/07/1st-team-meeting.jpg)

As for where Godfrey is going, he’ll be heading to Portland (so still cascadia!) to work with leaders in the open source community at [Tilde](http://www.tilde.io/about-us/).

<div id="teams" class="brewhouse">
  <img id="godfrey" src="/images/posts/2015/07/godfrey.png"></img>
</div>
<audio id="power-up">
  <source src="/images/posts/2015/07/power-up.mp3"></source>
  <source src="/images/posts/2015/07/power-up.ogg">beep</source>
</audio>


The Brewhouse team—and Vancouver’s development community at-large—will truly miss Godfrey, but we're very happy and incredibly proud to have been able to work with him. Good luck with your next chapter in Portland, mate!


<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
<script>
  $(window).scroll( function() {
    var bottom_of_teams = $("#teams").offset().top + $("#teams").outerHeight();
    var bottom_of_window = $(window).scrollTop() + $(window).height();

    if(bottom_of_window > bottom_of_teams + $(window).height() * 0.1){
      to_tilde();
    } else {
      to_brewhouse();
    };
  });

  var to_tilde = function() {
    if($("#teams.brewhouse").length) {
      $("#power-up")[0].play();
    }
    $("#teams").removeClass("brewhouse").addClass("tilde");
  }

  var to_brewhouse = function() {
    $("#teams").removeClass("tilde").addClass("brewhouse");
  }
</script>

<style>
  #teams {
    height: 396px;
    width: 680px;
    background: url('/images/posts/2015/07/brewhouse-tilde-bkg.png');
    transition: background-position 1s;
    position: relative;
    margin-bottom: 50px;
  }

  #teams.tilde {
    background-position: -733px 0;
  }

  #godfrey {
    position: absolute;
    bottom: 0;
    transition: height 1s, opacity 1s, left 1s;
    transition-timing-function: ease-out;
  }

  #teams.brewhouse #godfrey {
    opacity: 0.5;
    height: 155px;
    left: -22px;
  }

  #teams.tilde #godfrey {
    opacity: 1;
    height: 210px;
    left: -46px;
  }
</style>
