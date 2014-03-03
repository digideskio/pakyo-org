---
title: 0.7.1 Release
time: 8:55am CST
---

Announcing Pakyow 0.7.1, available now on Rubygems. This minor release fixes a few issues discovered since the last release and also adds a few small features to core and presenter.

## Rubinius Support

This release brings support for Rubinius (tested in 1.2.4 and 2.0-dev). A special thank you to the great people on the #rubinius channel for helping us solve a few issues. You were a huge help!

## Misc Presenter Changes

A binder can now be defined for multiple labels. It's as simple as passing multiple arguments to the binder_for method:

    ruby:
    class MyBinder < Pakyow::Presenter::Binder
      binder_for :this, :that
    end

The in_context method now passes the current context as a parameter to the block. This allows you to (optionally) keep up with multiple contexts and is useful when using nested contexts:

    ruby:
    view.find('#foo').in_context { |foo_context|
      foo_context.find('#bar').in_context {
        puts "Bar context: #{context}"
        puts "Foo context: #{foo_context}"
      }
    }

## Application Generation Changes

The config.ru rackup file has been fixed so that it uses the builder created by Pakyow. It wasn't before and, as a result, middleware was not being loaded. Since this change is only effective for applications generated from this point on, we recommend changing your rackup file manually. Here's the new version:

    ruby:
    require File.expand_path('../config/application', __FILE__)
    PakyowApplication::Application.builder.run(PakyowApplication::Application.stage(ENV['RACK_ENV']))
    run PakyowApplication::Application.builder.to_app

We also fixed the rakefile so that it can be run for a specific environment and accept additional arguments. Again, we recommend changing your rakefile in existing apps:

    ruby:
    require File.expand_path('../config/application', __FILE__)
    PakyowApplication::Application.stage(ENV['ENV'])

## Bug Fixes

Several bug fixes are included in this release:

- Fixed issue running with ignore_routes turned on. This was broken for some use cases.
- Fixed view caching to work under all scenarios.
- Fixed View#content= method to allow setting content to nil.
- Fixed Views#find method.
- Binder#action now adds a leading slash to the path if necessary.

## Discussion

If you have any comments on this post please join the conversation on our [mailing list](https://groups.google.com/forum/#!topic/pakyow/B2JS8vOzR9Q). Bug reports should be submitted to our [GitHub Repo](https://github.com/metabahn/pakyow/issues).