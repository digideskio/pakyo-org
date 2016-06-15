---
title: "Pakyow v0.11 Release Announcement"
time: 7:45am CST
---

Pakyow v0.11 is now available on RubyGems. This is planned to be the last major
release before 1.0, and the work reflected that. We focused mostly on improving
the developer experience while taking the opportunity to optimize framework
internals. This release also includes several critical bug fixes people have
encountered running Pakyow UI and Pakyow Realtime in production.

We also took the opportunity to dust off the website and update the messaging.
Included in this effort are the following new guides covering some of the
conceptual details of the framework:

- [Why Pakyow?](https://www.pakyow.org/docs/overview)
- [Progressive Enhancement](https://www.pakyow.org/docs/overview/progressive-enhancement)
- [Auto-Updating Views](https://www.pakyow.org/docs/overview/views)
- [Rapid Prototypes](https://www.pakyow.org/docs/overview/prototypes)
- [Ring.js Components](https://www.pakyow.org/docs/overview/ring)
- [Prioritized User Trust](https://www.pakyow.org/docs/overview/trust)
- [Democratic Web](https://www.pakyow.org/docs/overview/democratic)

v0.11 was made possible with contributions from the following people:

- Chris Hansen
- Guru Khalsa
- Jay Hayes
- John Hager
- Karim Tarek
- Lydia Lowther
- Neil Spear
- Ryan Clardy

Thanks so much for your code, writing, ideas, and design critique.

Check out the [Release Walkthrough
screencast](https://www.youtube.com/watch?v=mlrDqw7oMAw) for a demo of this release.

Read on for a summary of what you'll find in v0.11.

## Binding Parts

There are two aspects to binding parts.

In the app logic, bindings can now be written like this:

```ruby
Pakyow::App.bindings do
  scope :post do
    prop :link do
      part :href do
        'https://www.pakyow.org'
      end

      part :content do
        'Pakyow'
      end
    end
  end
end
```

Prior to binding parts, this would look like:

```ruby
Pakyow::App.bindings do
  scope :post do
    prop :link do
      { href: 'https://www.pakyow.org', content: 'Pakyow' }
    end
  end
end
```

The new binding part syntax is much more clear. Both of the above examples will
work in v0.11 but the new syntax is preferred in most cases.

Binding parts also make it possible to specify the values that should be bound
to the view. For example, we can tell Pakyow to only bind the `href` value and
leave everything else alone:

```html
<div data-scope="post">
  <a data-prop="link" data-parts="href">
    Click This Link
  </a>
</div>
```

Multiple parts can be specified just like multiple class names:

```html
<a data-prop="link" data-parts="href content">
  Click This Link
</a>
```

Want to exclude particular values instead? Pakyow also supports the
`data-parts-exclude` attribute.

## Versioned Props

View versioning has been extended to support props. This makes it possible to
define multiple versions of a node representing a value and choose the
appropriate one in the app logic:

```html
<div data-scope="post">
  <a data-prop="link" data-version="plain">
    Click This Link
  </a>

  <a data-prop="link" data-version="icon">
    <i class="fa fa-link"></i>
    Click This Link
  </a>
</div>
```

```ruby
view.scope(:post).prop(:link).use(:icon)
```

## Restful Resource Definition

Restful resources can now be defined in a simpler way:

```ruby
Pakyow::App.resource :post, '/posts' do
  # define actions here
end
```

The above code registers the route set and also creates the restful bindings for
the `:post` scope. There's much less setup involved all around.

## WebSocket Bug Fixes & Improvements

All known issues with WebSockets (and Realtime / UI in general) have been
resolved in this release, including the following:

- Gracefully shuts down WebSockets if an error is encountered
- Makes session objects available when calling routes through a WebSocket
- Fixes a timing issue that caused join events to be fired before
  the connection was actually established
- Fixes a memory leak caused by converting channel names to `Symbol` objects
- Better handling of Redis connections; there will now only be two open
  connections for each app instance
- Fixes several message deliverability issues in production environments
- Replaces the `websocket_parser` gem with the more stable `websocket` gem
- Fixes Internet Explorer 11 support

## Request Path Normalization

Pakyow now normalizes request paths in the following cases:

- `/some//resource` is 301 redirected to `/some/resource`
- `/some/resource/` is 301 redirected to `/some/resource`

## Goodbye Nokogiri, Hello Oga

We replaced Nokorigi with Oga. This change has been on the roadmap for a long
time, and we're excited to include it in this release. Nokogiri is a great
library, but the libxml dependency made installation difficult in many cases.

By contrast, Oga is pure-Ruby with no dependencies. It is a bit slower than
Nokogiri, but that's fine in our case because we only incur the cost of parsing
when the app boots up the first time. After load Pakyow uses `StringDoc` for all
view transformations.

## Session Handling

Sessions are now built into Pakyow. Pakyow registers the `session` config
namespace and includes several [config options](https://github.com/pakyow/pakyow/blob/v0.11.0/pakyow-core/lib/pakyow/core/config/session.rb).
*See "Upgrade Notes" below for potential impacts on existing projects.*

## Config Changes

In addition to the new `session` namespace, this release includes the following
config changes:

- The `app.auto_reload` option has been moved to the new `reloader` namespace,
  which now includes a single `enabled` option
- All logging related config options now exist under the `logger` namespace;
  several config options have been renamed, [so have a look](https://github.com/pakyow/pakyow/blob/v0.11.0/pakyow-core/lib/pakyow/core/config/logger.rb)
- The `app.require_route` option has been renamed to `app.all_views_visible`

## Generated App Updates

Several changes have been made to the generated app, including:

- Dotenv is now included for managing environment variables
- Session middleware is now registered by Pakyow rather than in `app/setup.rb`
- Ring.js has been updated to v0.2.4

*See "Upgrade Notes" below for potential impacts on existing projects.*

## Other Bug Fixes & Minor Changes

There are a few other bug fixes and minor changes that are worth a mention:

- Pakyow now sets the `Content-Type` header to `utf-8`
- Mutations can now be invoked on mailers
- Mutations are now invoked in the app context, with helper methods available
- The `global` config options are now loaded first, giving priority to
  environment-specific options
- Execution order of before hooks is now resolved
- Several bugs were fixed around traversing scopes in nested partials
- We also fixed a bug causing nodes not to be removed in all cases
- The `rake pakyow:routes` task no longer fails when a regex route is present

## Upgrade Notes

The upgrade path to v0.11 is fairly straight-forward. Here are some things to
consider.

**Dotenv**

Add the `dotenv` gem to your `Gemfile`. Next, add the following code to the top
of `configure :global`:

```ruby
Dotenv.load
```

Create a local `.env` file for local config values. It's best-practice to
not check this file into version control, as production values are usually
managed via something other than dotenv.

**Sessions**

Remove any session middleware defined in `app/setup.rb`, or disable Pakyow's
built-in session handling by setting the appropriate config option:

```ruby
session.enabled = false
```

If you choose to use Pakyow's session handling, set the `SESSION_SECRET`
environment variable in your `.env` file (and in your production environment).

**Renamed Config Options**

Several config options were renamed. Please update any that you happen to use:

- `app.auto_reload` has been renamed to `reloader.enabled`
- `app.require_route` has been renamed to `app.all_views_visible`
- `app.log_output` has been renamed to `logger.stdout`
- `app.log` has been renamed to `logger.enabled`

**Ring.js**

You'll want to update [Ring.js](https://github.com/pakyow/ring) to `v0.2.4`, as
several bugs have been fixed.

## Conclusion

Thanks for reading! Now go enjoy v0.11 :-)

-[bryanp](http://twitter.com/bryanp)
