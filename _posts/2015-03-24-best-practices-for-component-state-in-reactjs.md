---
layout:    post
title:     "Best Practices for Component State in React.js"
author:    "gabe"
category:  blog
date:      2015-03-24 10:00
published: true
tags:
- reactjs
- javascript
- component
- state
---

When writing React applications, it's important to know when and when not to use state in components. In this post, I will review what I consider to be best practices for working with state. TL;DR:

1. If a component does not own a datum, then that datum should not influence it's state.
2. Store the simplest possible values to describe a component's state.
3. Leave calculations and conditionals to the render function.

These rules obviously have exceptions and should be violated when appropriate; though if you're able to follow them most of the time, you will find that your components will be easier to break down. Tests will be easier to write, and the entire application will have fewer bugs. Let's take a closer look at each of these rules.

<!-- break -->

## 1) If a component does not own a datum, then that datum should not influence it's state

First, and probably the most important of all, the state of a component should not depend on the props passed in. Of course props may pass down state-like ideas - for example, on a custom input component, I may choose to have a `disabled` prop which disables some internal text input - but when I say "state", I'm referring specifically to the state attribute of the component. You may begin to notice a code smell when the state starts to depend on it's props. Take a look at the following snippet:

{% highlight js %}
var React = require('react/addons');

class UserWidget extends React.Component {
  // ...

  // BAD: set this.state.fullName with values received through props
  constructor (props) {
    this.state = {
      fullName: `${props.firstName} ${props.lastName}`
    };
  }

  render () {
    var fullName = this.state.fullName;
    var picture = this.props.picture;

    return (
      <div>
        <img src={picture} />
        <h2>{fullName}</h2>
      </div>
    );
  }
}
{% endhighlight %}

What's wrong with this? It may not be obvious at first, but if `firstName` or `lastName` change, the view of this `UserWidget` will not change. The constructor function only runs when the component is mounted and thus `fullName` is forever what it was when the component mounted\*. Developers who are new to React will often make this mistake, perhaps because `setState` is the easiest and most obvious way to update the component view.

You should ask yourself whether this component owns this data. Were `firstName` and `lastName` created internally? If not, then the state should not depend on it\*\*. And what is the best way to avoid this? Calculate `fullName` as a part of the `render` function.

{% highlight js %}
render () {
  var fullName = "${this.props.firstName} ${this.props.lastName}";
  // ...
}
{% endhighlight %}

By moving this to the render function, we are never again concerned whether `fullName` will be updated. React has hooks to run a function whenever props are updated - _i.e._ `componentWillReceiveProps` - however, I would consider using this an anti-pattern because it adds complexity when it's not needed.

Of course, if you don't care about props after the component is initialized, [then this entire rule doesn't apply](http://facebook.github.io/react/tips/props-in-getInitialState-as-anti-pattern.html).

<small style="font-size:12px; margin-bottom: -20px; display: block;">
\*When using `React.createClass` instead of `extends React.Component`, replace `constructor` with `getInitialState`.
</small>

<small style="font-size:12px; margin-bottom: 30px; display: block">
\*\*At some point, "state" will need to be set within something. In the flux pattern this may be a root "controller" component listening to a bunch of stores.
</small>

## 2) Store the simplest possible values to describe a component's state

When describing the component's state, you should do it with the simplest possible representation. In many cases, this means preferring the use of boolean flags.

Consider the following example where we have some component which stores a list of classes in it's state based on whether it was clicked or hovered. (And for what it's worth, I have seen this kind of thing a lot in the wild):

{% highlight js %}
var React = require('react/addons');
var cx = React.addons.classSet;

class ArbitraryWidget extends React.Component {
  // ...

  constructor () {
    this.state = {
      classes: []
    };
  }

  // BAD: push 'hover' into this.state.classes when mousing over the component
  handleMouseOver () {
    var classes = this.state.classes;
    classes.push('hover');

    this.setState({ classes: classes });
  }

  // BAD: remove 'hover' from this.state.classes when the mouse leaves the component
  handleMouseOut () {
    var classes = this.state.classes;
    var index = classes.indexOf('hover');
    classes.splice(index, 1);

    this.setState({ classes: classes });
  }

  // BAD: toggle 'active' in this.state.classes when the component is clicked
  handleClick () {
    var classes = this.state.classes;
    var index = classes.indexOf('active');

    if (index != -1) {
      classes.splice(index, 1);
    } else {
      classes.push('active');
    }

    this.setState({ classes: classes });
  }

  render () {
    var classes = this.state.classes;

    return (
      <div
        className={cx(classes)}
        onClick={this.handleClick.bind(this)}
        onMouseOver={this.handleMouseOver.bind(this)}
        onMouseOut={this.handleMouseOut.bind(this)} />
    );
  }
}
{% endhighlight %}

This component works; however, I do have some serious reservations. It's state is now an awkward array of strings. `this.state.classes = ['active', 'hover']`. Not only does this format hurt the readability of the code, but it makes it more difficult to change. Having other components relying on whether or not my array of classes contains `hover` isn't quite the same as checking a boolean flag. Consider this refactoring where we instead store boolean values that represent whether or not the component should have a class - _e.g._ `isHovering === true` implies that I should use the `hover` class:

 {% highlight js %}
var React = require('react/addons');
var cx = React.addons.classSet;

class ArbitraryWidget extends React.Component {
  // ...

  constructor () {
    this.state = {
      isHovering: false,
      isActive: false
    };
  }

  // GOOD: set this.state.isHovering to true on mouse over
  handleMouseOver () {
    this.setState({ isHovering: true });
  }

  // GOOD: set this.state.isHovering to false on mouse leave
  handleMouseOut () {
    this.setState({ isHovering: false });
  }

  // GOOD: toggle this.state.isActive on click
  handleClick () {
    var active = !this.state.isActive;
    this.setState({ isActive: active });
  }

  render () {
    // use the classSet addon to concat an array of class names together
    var classes = cx([
      this.state.isHovering && 'hover',
      this.state.isActive && 'active'
    ]);

    return (
      <div
        className={cx(classes)}
        onClick={this.handleClick.bind(this)}
        onMouseOver={this.handleMouseOver.bind(this)}
        onMouseOut={this.handleMouseOut.bind(this)} />
    );
  }
}
{% endhighlight %}

Whoa! By boiling the state concerns down to boolean values we must calculate the array of classes from within the render function; though, we also enhance the readability of the component. `this.state.isHovering` is a far better representation of the __actual__ component state than `this.state.classes.indexOf('hover') != -1`. The component can be more easily extended and tested because we're not concerned with the construction of some array.

I'd like to repeat that you should always aim for the simplest representation of the state. This does _not_ necessarily mean you're only storing boolean values. It may very well be that deeply nested objects are the only option. It may also be that you can get away with storing a number. Or a string. Or a function.

Imagine being a third party and trying to observe the state of a component which returns an array of classes. Is this useful to you? Of course not. It's woefully brittle. Contrasted that with a boolean `isActive` is much more actionable. I hope you understand what I mean.

## 3) Leave calculations and conditionals to the render function

Following the previous two rules, this one should already be in place; however, it's still worth noting. Whenever possible, make decisions and do calculations at the last possible moment: in the render function. Though perhaps slightly slower than other approaches, it ensures the least amount of redirection in the component. Enhanced readability and extensibility should always come before micro-optimizations.

Do I need to concatenate the `firstName` and `lastName` prop? Move it to the render function.

Which classes does my component need to use? Decide in the render function.

Should I show placeholder text if I don't have any items on my todo list? Decide in the render function.

Do I need to format a phone number so that it looks more presentable? Do it in the render function.

How should I render out subcomponents? Decide in the render function.\*

What am I having for lunch today? Decide in the render function.

<small style="font-size:12px;">
\* For the love of all that is holy, please do not store components in the state.
</small>

## CPU intensive calculations

Because I'm suggesting that you defer just about everything to the render function, it would follow that even CPU intensive calculations are deferred as well. To avoid repeated complex renderings, consider a [memoization function](https://lodash.com/docs#memoize).

## Do not store values on the instance of the component

Just don't. Storing values on the instance of a component is doing this:

{% highlight js %}
var React = require('react/addons');

class ArbitraryWidget extends React.Component {
  // ...

  constructor () {
    this.derp = 'something';
  }

  handleClick () {
    this.derp = 'somethingElse';
  }

  render () {
    var something = this.derp;
    // ...
  }
}
{% endhighlight %}

This is particularly bad, not only because you're breaking the obvious convention of storing state on `this.state`, but because `render` won't automatically trigger when `this.derp` is updated.

## Unit Testing

As an added bonus, the component unit tests are easier to write because all of the cruft falls down to the render function. Said cruft becomes a view concern and decision making is offset to the user. Of course, testing the view is still very important, but in my opinion you should do this with end to end tests. Things are less likely to break when you're only checking for the simplest possible values rather than complex ones that require many conditions to reproduce and only describe concerns of the display.

## Exceptional Cases

As my mother says, "You should be careful with your always and nevers." Please take what you've read here with a grain of salt. Forcing yourself to adhere to these practices in truly exceptional cases may hurt more than help. Though, if you do find yourself unable to follow these rules, it may be a sign that you need to break the component down into smaller ones. By keeping the component simple and deferring to the render function, groupings begin to appear which assist with this exercise.

## Anything else?

Is there something I've missed? Do you disagree? See a typo? What should I write about next? Leave a comment below or [@ me on twitter](https://twitter.com/gabescholz). If you're in the Vancouver, BC area we should grab a coffee and talk about JavaScript!

## Hire Us!

Interested in React.js training for your team? Need help building your next ambitious web application? We're a Rails and JavaScript shop located in beautiful Vancouver, BC. [Get in touch!](http://brewhouse.io/#hire-us)
