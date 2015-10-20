---
title: "Failure Handling in Pakyow Apps"
time: 8:33pm CST
---

Over the weekend we pushed out two new gems to help you deal with failure in
your apps. They're written as plugins, meaning you get all the behavior just by
adding them to your `Gemfile`.

The first gem, `pakyow-fail` is a plugin that serves up 404 and 500 error pages
whenever your app encounters failure in production. This provides a good
starting point and it's easy to customize these views to match the look and feel
of your app.

In addition to elegantly handling the user side of failure, you as the app
developer also want to know when failure happens and the context around it. The
second gem, `pakyow-fail-mail`, does just this.

Whenever an exception is raised you'll get an email containing details about the
request, along with a stacktrace. This is the first of many error reporters
we'll be releasing over the next few weeks ([Hipchat](https://www.hipchat.com/),
[Airbrake](https://airbrake.io/), and [Honeybadger](https://www.honeybadger.io/)
are a few of the others we're working on).

Read more about these new plugins in the
[docs](http://pakyow.com/docs/handling-failure). You can also peruse the code on
[Github](https://github.com/metabahn/pakyow-fail). Enjoy!

[bryanp](http://twitter.com/bryanp)
