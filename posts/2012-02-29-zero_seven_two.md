---
title: 0.7.2 Release
time: 8:45am PST
---

Announcing Pakyow 0.7.2, available now on Rubygems. Here's the lowdown.

## Graceful Shutdown

Pakyow will now shut down the application server gracefully. Many thanks to [Chad Taylor](https://twitter.com/tessellator) for contributing this code!

## Bug Fixes

Several bug fixes are included in this release:

- Fixed an issue with setting view path when ignore_routes is turned on. Request path is now used as the view path in all cases.
- Fixed a request format bug. Routes now match properly, even with a format specified.
- Mailer now sets only the HTML part of the message.

## Discussion

If you have any comments on this post please join the conversation on our [mailing list](https://groups.google.com/d/msg/pakyow/aiA0mKQXISM/eVA5dMr2siwJ). Bug reports should be submitted to our [GitHub Repo](https://github.com/metabahn/pakyow/issues).
