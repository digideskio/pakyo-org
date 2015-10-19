---
title: 0.8rc1 Release
time: 10:45am CST
---

We are happy to announce that 0.8rc1 is available on RubyGems! A lot of work has
gone into this release. An overview of major changes can be found below. Full
release notes will accompany the final 0.8 release. You can see this working in
the [example app](https://github.com/metabahn/paktest-0.8). 

### Routing

The routing engine has been rebuilt from the ground up to be more performant and
expressive. New features include route groups, namespaces, and templates. Routes
can also be named and referenced throughout the app. Here's an example:

```ruby
# creates a route named :foo
get('/foo/:id', :foo) {
  ...
}

# returns the path for :foo, populated with data
router.path(:foo, { id: 123 })
  # /foo/123
```

[Read More](https://groups.google.com/d/topic/pakyow/tZD41nMicGI/discussion)
<br>

### Presenter API

The API for manually creating and compiling views has been redesigned to be more
developer friendly. Roles for Presenter and View are now more clearly defined,
allowing you to do things like this:

```ruby
# compile my_template.html at /foo/bar
View.new('my_template.html').compile('/foo/bar')
```

[Read More](https://groups.google.com/d/topic/pakyow/CWP65SBZbms/discussion)
<br>

### View Scopes

This represents the bulk of work behind 0.8. Use of itemprop attributes has been
deprecated in favor of data-scope and data-prop. Here's a view in 0.7:

```html
<div>
  <h1 itemprop="post[title]">
    Title Goes Here
  </h1>

  <p itemprop="post[body]">
    Body Goes Here
  </p>
</div>
```

And here it is rewritten to use view scopes:

```html
<div data-scope="post">
  <h1 data-prop="title">
    Title Goes Here
  </h1>

  <p data-prop="body">
    Body Goes Here
  </p>
</div>
```

From a view logic perspective, it is now only possible to find and perform
manipulations on views with data-scope and data-prop attributes. This means the
view decides what it opens up to be changed, making view logic easier to write
and debug.

[Read More](https://groups.google.com/d/topic/pakyow/QL-8qemEN6A/discussion)
<br>

### Bindings

The syntax for defining bindings has been changed to be more consistent with
routes. Here's an example of a binding for the post view defined above:

```ruby
scope(:post) {
  binding(:title) {
    "Title Is: #{bindable.title}"
  }
}
```

When post data is bound to the view, the "Title Is: " text will be prepended to
the title of the post.

[Read More](https://groups.google.com/d/topic/pakyow/Ap-Ui6p3qBc/discussion)
<br>

### View Parsers

It's now possible to define views in languages other than HTML. Here's a
markdown parser that converts markdown views to HTML:

```ruby
parser(:md) { |content|
  RDiscount.new(content).to_html
}
```

Any view with a ".md" extension will be converted to HTML before being given to
the view logic. This means view compilation still works and view logic can treat
the view as any other HTML view.

Parsers can easily be created for HAML, ERB, or anything that can compile to HTML.

[Read More](https://groups.google.com/d/topic/pakyow/V7ulXFud7sA/discussion)

## Next Steps

Our goal is to have the final release ready in the next few weeks. There is a
bit of development work to do, mostly optimizations and a few convenience
features. Most of the remaining work involves rewriting the documentation. Our
plan is to launch a completely new documentation platform that will replace the
existing manual. If you would like to help us write documentation, reply on the
mailing list. This is a great opportunity to get to know 0.8.

## 1.0

We have a roadmap to 1.0 that will be announced after the final 0.8 release.
We've laid the groundwork with 0.8 and can't wait to announce the features that
are on their way.

## Discuss

If you have any comments please [join the
discussion](https://groups.google.com/forum/?fromgroups#!forum/pakyow). Bug
reports should be submitted via [GitHub](http://github.com/metabahn/pakyow).
