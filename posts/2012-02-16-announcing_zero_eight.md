---
title: Announcing Pakyow 0.8
time: 9:05am PST
---

It's been a little while since the last major version of Pakyow (0.7) was rolled out. Since then Bret Young and I have been planning out the next step. Now that the plan is solid, we wanted to publicly announce the direction for 0.8.

So, here it is.

## View Processors

Pakyow's stance is that views should consist only of structure. As of 0.7, views could only be defined in HTML. However, there are lots of ways to define view structure, such as Markdown and HAML. Our goal is to allow views to be defined using any structural template language.

Instead of building in support for multiple template languages, we plan to add a feature called a view processor. A processor can be defined for any template language. When a view file is loaded, the processor for that file type is used to process it into HTML. The presenter will continue to deal only with HTML views, keeping things simple.

View processors will be defined by a developer at the application level. A processor can handle any type of view, as long as it can be converted into HTML. Here's an example processor that converts Markdown views into HTML:

    ruby:
    parser [:md, :markdown] do |view_contents|
       RDiscount.new(view_contents).to_html
    end

It's important to note that this feature will not introduce any additional overhead (when running an application with view caching turned on). Upon startup, any non-HTML views will be converted into HTML and cached just like an HTML view.

## Presenter/Core Interface

Interacting with the Presenter isn't very intuitive. This will be addressed head on in 0.8 by a complete redesign of the Presenter API. I [proposed several changes](https://groups.google.com/d/msg/pakyow/CWP65SBZbms/LwLqZggtL1MJ) a few weeks ago in a thread on the mailing list. This will be the starting point for the rewrite, although the final API may differ from what was proposed.

In any case, the rewrite will make writing and understanding your code much easier.

## Route/Hook Changes

Several changes are planned to routes and hooks. First, named routes will be introduced. These named routes can be referenced throughout the business logic, meaning you will never have to deal with URLs outside of the route definitions.

Named routes also allow hooks to be defined in different ways. As of 0.7, hooks were defined for a route in the route definition itself. In 0.8, it will be possible to associate named routes with named hooks completely separate from the route definition.

User defined route groups will be introduced, unifying the declaration of multiple routes and hooks. RESTful routes will be rewritten using groups, which will bring flexibility to RESTful route definitions.

## Pakyow Application Class

In the first version of Pakyow, two things could be defined in the application class: configuration and routes. As of 0.7, handlers, hooks, and middleware are also defined in the application class. Here's an example:

    ruby:
    class PakyowApplication < Pakyow::Application
      configure(:env) do
        ...
      end
      
      middleware do
        ...
      end
      
      routes do
        hook :foo do
          ...
        end
        
        get '/', :before => :foo do
          ...
        end
      end
      
      handlers do
        handler :not_found, 404 do
          ...
        end
      end
    end

Yikes, this is confusing. Hooks are not really routes but they are defined in the routes block. Handlers also contain business logic, but they're defined in their own block.

To improve this, routes, hooks, and handlers into a single block named "core". A "presenter" block will also be added where presenter-specific things (such as view processors) can be defined. Similar things are grouped together and everything has a place.

## View Changes

In earlier versions of Pakyow, view containers are defined using the "id" attribute. This attribute was originally chosen because it must be unique, so only a single instance of a particular container could exist on a page. This has proved to be more limiting than it is useful. To solve this problem we plan to extend the container definition to include the "data-container" attribute. This attribute can be used in cases where multiple instances of a container is needed in the same view.

Pakyow makes use of the microdata specification to tell the view about the data it presents. This information is used in the binding process. Up to this point, we've only made use of the "itemprop" attribute. This will be extended in 0.8 to include the "itemscope" attribute. This will allow for a cleaner syntax when creating views. Below are two examples that show the difference:

### 0.7

    html:
    <div>
      <span itemprop="contact[full_name]">John Doe</span>
      <a itemprop="contact[email]">johndoe@gmail.com</a>
    </div>

### 0.8

    html:
    <div itemprop="contact" itemscope>
      <span itemprop="full_name">John Doe</span>
      <a itemprop="email">johndoe@gmail.com</a>
    </div>

View scopes will be exposed to back-end code and will bring more power to the data binding process. This is how data would be bound to the first example above:

    ruby:
    view.find('div').bind(contact)

It works, but the back-end code knows too much about the view. There's no reason the back-end code should care what kind of tag the data is being bound to (or class, or id, etc). All the back-end should care about are the data labels. By exposing scopes, something like this becomes possible:

    ruby:
    view.data(:contact).bind(contact)

The further separation of front-end and back-end code is a big win.

## Closing Thoughts

We're excited about 0.8 and the opportunities it opens for 0.9 and 1.0. If you're interested in participating, please [join the discussion on the mailing list](https://groups.google.com/d/msg/pakyow/owwpXNrP0Y4/LJoAvfjlP1YJ). Your feedback and ideas are welcome, and they go a long way towards making Pakyow a framework that's even more useful to developers. Implementation details for each feature will be posted to the mailing list in the coming weeks, so keep an eye out.

Thanks for reading!

Bryan
