---
title: 0.8 Release
time: 10:45am CST
---

It's been 2 years since the last significant release to Pakyow. Today I am very excited to announce that the next version, 0.8 has been officially released. It's been a long time coming.

Since the last release we've been thinking, coding, and rewriting nearly every aspect of Pakyow. From the beginning we have wanted to build a framework that is easy for beginners, has great performance characteristics, and enables a process that's friendly to both designers and developers.

Happily, 0.8 is a huge step forward in all respects.

In addition to a fresh new release, we have a [new site](http://pakyow.com), [better docs](http://pakyow.com/docs), and a [warmup](http://pakyow.com/warmup) that will help you build and deploy your first Pakyow app.

Rather than review every little change, I'd like to walk through three of the biggest 0.8 changes.

## New Router

The router has been rewritten to include advanced features like grouping, namespacing, and route mixins and templates. Here's an example using the new built-in restful route template:

    ruby:
    restful :post, '/posts' do
      list do
        # code here
      end

      # other restful methods here

      collection do
        get 'collection_example'; end
      end

      member do
        get 'member_example'; end
      end
    end

The above creates the following routes:

- GET '/posts'
- GET '/posts/collection_example'
- GET '/posts/:post_id/member_example'

This only scratches the surface. Read up on the new router [here](http://pakyow.com/docs/routing).

## Updated View Syntax

Views are still composed from parts in 0.8. But we've made the view layer more powerful and easier to use by creating distinctions between the different parts of a view.

1. Templates
2. Pages
3. Partials

A template defines the general structure for a view and one or more containers:

    html:
    <body>
      <!-- @container my_container -->
    </body>

Pages implement a template and define content for its containers:

    html:
    ---
    template: my_template
    ---

    <!-- @within my_container -->
      content for my_container

      <!-- @include a_partial -->
    <!-- /within -->

Notice the `@include`? That's including a partial into the page. Composed together, the resulting view looks like:

    html:
    <body>
      content for my_container

      (content from a_partial)
    </body>

Read more about view building [here](http://pakyow.com/view_construction).

## Better View Transformation

One of the fundamental concepts in Pakyow has been that the front-end and back-end of an application are developed separately. This leads to logic-less views and isolated back-end code.The problem is that we didn't fully accomplish this in previous releases.

In 0.7, the back-end code used CSS selectors to address the part of a view it wanted to transform. This *created* a connection between back-end code and the view that made things brittle. As of 0.8, everything in the view is hidden except for what is explicitly exposed to the back-end.

Here's a view transformation example in 0.8.

The view:

    html:
    <div data-scope="post">
      <h1 data-prop="title">
        Title goes here
      </h1>
    </div>

Back-end code:

    ruby:
    view.scope(:post).apply([
      { title: 'Ima Post' },
      { title: 'Post 2' }
    ])

Resulting view:

    html:
    <div data-scope="post">
      <h1 data-prop="title">
        Ima Post
      </h1>
    </div>

    <div data-scope="post">
      <h1 data-prop="title">
        Post 2
      </h1>
    </div>

As you can see, back-end code is now expressed in terms of *data* rather than a *view-specific language*. This makes it possible to perform complete front-end refactors without changing any back-end code, so long as the same underlying data is represented.

Read more about view transformation and data binding [here](http://pakyow.com/view_binding).

## What's Next?

0.8 is the most stable release we've put out. There shouldn't be any major changes to the public API between 0.8 and 1.0. So, we hope to be on a more frequent release cycle from this point forward. At the same time, we plan to put out more content to help you use Pakyow to build your web apps.

We are planning for one more major release before hitting 1.0. A full roadmap will be published in the coming weeks, but our efforts will be focused in two main areas (such tease):

- A new pakyow-ui library for building auto-updating views
- Better integration with other Ruby web frameworks

This is an exciting release and we hope you enjoy it. As always, feel free to join the conversation here, on the [mailing list](http://groups.google.com/group/pakyow), or find us on [Twitter](http://twitter.com/pakyow). We'd love to hear from you.

[bryanp](http://twitter.com/bryanp)
