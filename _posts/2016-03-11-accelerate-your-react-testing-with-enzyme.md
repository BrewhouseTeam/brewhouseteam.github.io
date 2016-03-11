---
layout: post
title: "Accelerate your React testing with Enzyme"
author: alex
date: 2016-03-10 12:00
shared_description: AirBnb's Enzyme library is the fastest and most elegant way to test your React code.
draft: false
published: true
---

When it comes to integration testing, Javascript frontends are notoriously hard to test &mdash; there’s lots of setup required, and you often need to rely on clunky simulations of user interactions like clicks and keyboard events.

React’s virtual DOM offers some interesting opportunities for simplifying the process of testing, and AirBnb’s [Enzyme framework](https://github.com/airbnb/enzyme) makes testing your components an absolute pleasure. We recently tried out Enzyme on a React project at Brewhouse. We were blown away by how much simpler it was to write tests, and we’re never looking back.

<!-- break -->>

It’s not the only option, of course. React itself offers the [ReactTestUtils library](https://facebook.github.io/react/docs/test-utils.html) - in fact, Enzyme depends on this for its integration with React. But Enzyme’s jQuery-style approach to node selection and manipulation makes it super familiar and really easy to work with.

Let’s investigate how we can put Enzyme to work. To demonstrate some of its features, I put together a small little app called [Gif Grabbr](https://gif-grabbr.herokuapp.com/). It uses the [GIPHY API](https://github.com/Giphy/GiphyAPI) to find random GIFs based on your search. [Take it for a spin](https://gif-grabbr.herokuapp.com/) first, then come back here to check out some code.

![Gif Grabbr](/images/posts/2016/enzyme_post/gif-grabbr-demo.gif)

_(Note: In the examples below I'm using [Mocha](https://mochajs.org/) with [Chai](http://chaijs.com/) and [Karma](https://karma-runner.github.io/) as the test runner, but Enzyme can be used with pretty much any testing setup. Have a look at the [Gif Grabbr source](https://github.com/alextaylor000/gif-grabbr) to see more details about my setup.)_

## Shallow Rendering
Enzyme’s biggest strength is its shallow rendering capabilities. Not only does this encourage you to limit the scope of your tests to a single component, it also prevents errors deep in your node tree from affecting all your tests, and removes the requirement to mock a ton of objects.

Consider the `App` component in GIF Grabbr, which is the root component within which everything else is rendered:

{% highlight javascript %}
// components/app.js

// ...

class App extends React.Component {

  // ...

  render () {
    return (
      <div style={styles}>
        <h1>gif grabbr</h1>
        <p>find a GIF on <a href='http://giphy.com'>giphy</a>. Keep pressing enter for more results.</p>
        <div>
          <SearchBar onSearch={this.handleSearch}/>
        </div>
        <ImageDisplay
          loading={this.state.loading}
          url={this.state.gif.url}
          width={this.state.gif.width}
          sourceUrl={this.state.gif.sourceUrl}
          />
      </div>
    );
  }
}
{% endhighlight %}

To ensure the stability of my tests, as well as for performance reasons, I can use `.shallow()` to render this component only one level deep:

{% highlight javascript %}
const wrapper = shallow(<App />);
 {% endhighlight %}

This gives me a `ShallowWrapper` object which I can do all sorts of fun stuff with. To illustrate how Enzyme is handling this render, let's use `.debug()` to take a look at the output:

{% highlight javascript %}
wrapper.debug()

"<div style={{...}}>
<h1>
gif grabbr
</h1>
<p>
find a GIF on
<a href="http://giphy.com">
giphy
</a>
. Keep pressing enter for more results.
</p>
<div>
<SearchBar onSearch={[Function]} />
</div>
<ImageDisplay loading={true} url={[undefined]} width={[undefined]} sourceUrl={[undefined]} />
</div>"
{% endhighlight %}

`.debug()` returns a HTML-ish string representing the rendered output. Notice that the shallow render didn't touch the `SearchBar` or `ImageDisplay` components, but it _did_ pass in any props that were available at the time. In our tests, this allows us to verify that a child component would have received the correct props without needing to actually render the thing.

{% highlight javascript %}
// components/__tests__/imageDisplay.test.js

// ...

it('Passes loading:true to ImageDisplay', () => {
  const wrapper = shallow(<App />);
  const imageDisplay = wrapper.find('ImageDisplay');
  assert.equal(imageDisplay.prop('loading'), true);
});
{% endhighlight %}

## Put the '$' back in DOM traversal
Enzyme's three flavours of rendering (shallow, full and static) all return wrapper objects which give you jQuery-style power over your node tree. No longer must you wade through a jungle of nested arrays to in order to test some deep-level node:

{% highlight javascript %}
// components/imageDisplay.js
class ImageDisplay extends React.Component {

  // ...

  render () {
    const url = this.props.loading ? 'loading.gif' : this.props.url;
    const width = this.props.width || 200;
    return (
      <div style={styles}>
        <a href={this.giphySourceUrl()} title='view this on giphy' target='new'>
          <img id='gif' src={url} width={width} />
        </a>
      </div>
    );
  }
{% endhighlight %}

{% highlight javascript %}
// components/__tests__/imageDisplay.test.js

// ...

describe('ImageDisplay', () => {
  it('Renders the loading gif at the default width when passed loading:true', () => {
    const props = {
      loading: true
    };
    const wrapper = shallow(<ImageDisplay {...props}/>);
    const image = wrapper.find('img');

    assert.equal(image.prop('src'), LOADING_GIF);
    assert.equal(image.prop('width'), DEFAULT_WIDTH);
  });

  // ...

}
{% endhighlight %}

Using the wrapper I get from `.shallow()`, I can just search for the image tag instead of needing to know exactly where it is in the node tree. This encourages a more declarative form of testing, minimizing your tests' reliance on a specific tree structure.

## Enzyme Selectors FTW
The selector is more than meets the eye. In addition to CSS-style selectors, [an Enzyme Selector](https://github.com/airbnb/enzyme/blob/master/docs/api/selector.md#enzyme-selectors) can find nodes by their component constructor, display name, even object properties:

{% highlight javascript %}
// components/imageDisplay.js

// ...

class ImageDisplay extends React.Component {

  // ...

  render () {

    // ...

    return (
      <div style={styles}>
        <a href={this.giphySourceUrl()} title='view this on giphy' target='new'>
          <img id='gif' src={url} width={width} />
        </a>
      </div>
    );
  }
}
{% endhighlight %}

{% highlight javascript %}
// components/__tests__/imageDisplay.test.js

// ...

it('Renders an image when passed a url', () => {
  const props = {
    url: 'http://www.example.com/pusheen.gif'
  }
  const wrapper = shallow(<ImageDisplay {...props}/>);
  const image = wrapper.find({src: 'http://www.example.com/pusheen.gif'});
  assert.equal(image.length, 1);
});
{% endhighlight %}

## Simulations
Enzyme gives you a concise and elegant way of simulating user events, one of the trickier aspects of UI testing. Just pass the name of the event you want to simulate, along with any required data:

{% highlight javascript %}
// components/__tests__/searchBar.test.js"

// ...

  it('Triggers a new search as the user types', () => {
    const onSearchStub = sinon.spy();
    const wrapper = shallow(<SearchBar onSearch={onSearchStub}/>);
    const searchField = wrapper.find('input');
    const event1 = {target: {value: 'cat'}};
    const event2 = {target: {value: 'cats'}};

    searchField.simulate('change', event1);
    searchField.simulate('change', event2);
    assert.equal(onSearchStub.calledTwice, true);
  });

...
{% endhighlight %}

It's also worth noting that the event argument can be _anything you want_. Unlike ReactTestUtils, you're not limited to [only events that React understands](https://facebook.github.io/react/docs/events.html#supported-events). Following convention, you could call `wrapper.simulate('donut')` and Enzyme would simply look for an `onDonut` event handler. Pretty neat.

## Conclusion
Enzyme is an elegant and powerful way of testing your React applications. It can significantly increase the brevity of your tests thanks to its selector engine, and its approach to event simulation is quite promising. It also plays nicely with most test suites and assertion libraries out there, so you probably don't need to change your workflow to start using it today.

Hit up the [Enzyme docs](http://airbnb.io/enzyme/) to learn more. You should also check out [Leland Richardson's Lightning Talk](https://www.youtube.com/watch?v=V5N0Ukb8LGg) at ReactConf 2016 to get a good overview of the problems Enzyme solves.
