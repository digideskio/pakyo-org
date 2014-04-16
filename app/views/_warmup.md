# Installation

Pakyow is easy to install, but it relies on Ruby and RubyGems. Make sure
these are installed first. Here are some links that will help you install these
dependencies on your system:

- [Ruby](http://www.ruby-lang.org/en/downloads/)
- [RubyGems](http://rubygems.org/pages/download)

Once Ruby/RubyGems are installed, open a terminal prompt and type:

    console:
    gem install pakyow

Installation is complete!

# Reference App

If you get stuck at any point reference the warmup app on [GitHub](https://github.com/metabahn/pakyow-warmup). And if
you're still stuck, by all means ask for help on the [mailing list](http://groups.google.com/group/pakyow), 
or on [Twitter](http://twitter.com/pakyow)!

Btw, you can find the app running at [pakyow-warmup.herokuapp.com](http://pakyow-warmup.herokuapp.com).

# Project Generation

Pakyow ships with command-line tools that help you generate and manage
your projects. These tools make creating a new project really easy.
Let's create one for the purposes of this warmup:

    console:
    pakyow new warmup
    Generating project: warmup
    Running `bundle install`
    Done!

Pakyow creates the project structure for us, allowing us to get right
to work. Move into the new warmup directory and start the app server by
running the following command:

    console:
    cd warmup; pakyow server

Go to [localhost:3000](http://localhost:3000) to see your app running!

# Developing View First

Pakyow encourages a view-first development process. The goal of this process 
is to use the app in the browser as early as possible. Pakyow accomplishes this 
by allowing a front-end developer or designer to create a navigable prototype without 
writing any back-end code. This means that even with a limited skillset, you can 
create an app that your team (and project stakeholders) can interact with.

Views are easy in Pakyow, and are just HTML. There's no extended syntax. All of the
benefits of traditional template languages, like layouts and partials,
are retained.

There are three parts to a view:

1. Template: defines the reusable structure for a view
2. Page: implements a template with page-specific content
3. Partial: a reusable piece that can be included into a Page or Template

View building begins with a page. When fulfilling a request, Pakyow
first identifies the page to use based on the request path. For example,
a request for '/' would map to the 'index.html' page.

The page implements a single template. If a template isn't specified, Pakyow
uses the default template (named `pakyow.html`). By default, all templates are
defined in the `app/views/_templates` directory. Open the root project directory
into a text editor and have a look around.

Every Pakyow template defines one or more containers. Later on in the process,
we'll create pages that define content for these containers. Containers are 
defined with an inline comment:

    html:
    <!-- @container container_name -->

A nameless `default` container is defined for you in the `pakyow.html`
template. During construction, Pakyow composes page content with the
template to create the final view sent back in the response.

<div class="callout">
You might notice the div that contains a `container-1` class. This
class is defined in the pakyow-css library included with every generated
app. Explaining the library is beyond the scope of this warmup, but you
can read more <a href="http://github.com/metabahn/pakyow-css">here</a>.
<br>
<br>
There are several uses of pakyow-css throughout this warmup. Anytime
you see a class name on a node, it's safe to assume it is related to
pakyow-css and is simply to define some default styling.
</div>

## Creating the views

Let's create an index page for our app. Since we're building a Twitter
reader, this page will contain a list of recent tweets from Twitter, 
showing the user name, avatar, and contents of each tweets. Each item 
will also link to a page that will show more details about it.

Create `app/views/index.html` with the following content:

    html:
    <div class="container-2 margin-t">
      <img src="http://placehold.it/50x50" class="float-l margin-r">

      <a href="/show" class="float-r">
        View Details
      </a>

      <h4>
        User's Name
      </h4>

      <p>
        Tweet text goes here
      </p>
    </div>

Reload the browser and you'll see the code we added. Huzzah!

Clicking on the view details link takes us to a broken page, so let's
fix that. Create `app/views/show.html` with the following content:

    html:
    <a href="/">
      Back to list
    </a>

    <div class="margin-t">
      <img src="http://placehold.it/50x50" class="float-l margin-r">

      <h4>
        User's Name
      </h4>

      <p>
        Tweet text goes here
      </p>

      <p>
        Retweeted n times;
        Favorited n times;
        <a href="#">
          View on twitter
        </a>
      </p>
    </div>

Reload the browser and you'll see the new view.

The final thing this app needs is an explanation. Let's use another aspect of
view building, partials, to add this to our index view. First, define 
content for the partial by creating a `_intro.html` file in the `app/views` 
directory with the following content:

    html:
    <h1>
      Pakyow Warmup
    </h1>

    <p>
      Just a fun little warmup using <a href="http://pakyow.com">Pakyow</a>.
    </p>

Next, include the partial into the index page by adding this HTML
to the top of `index.html`:

    html:
    <!-- @include intro -->

Reload the index page in your browser and you'll see the intro has been
composed into the template. This intro could be included into any page,
such as `show.html`. Create it once, use it many times!

## Data Knowledge

At this point we have created a navigable prototype of our app, and we 
didn't write a single line of back-end code! The next step is to build 
the back-end that will populate our views with data. None of this 
back-end code will be mixed in to our view. Instead, it will be added 
as a layer that interacts with our view.

For this to work we want the view to describe the data it intends to
present. Looking at the `index.html` view it's pretty easy to identify the
data that's being represented. For example, we can see that the `div` 
represents a tweet. Since this is a *type* of data we label it as a scope:

    html:
    <div data-scope="tweet" class="container-2 margin-t">

We also know the `img` will present an avatar. Since this is an
*attribute* of a tweet, we label it as a prop:

    html:
    <img data-prop="avatar" src="http://placehold.it/50x50" class="float-l margin-r">

We continue labeling significant nodes (show link, user name, and text)
and end up with the following code:

    html:
    <!-- @include intro -->

    <div data-scope="tweet" class="container-2 margin-t">
      <img data-prop="avatar" src="http://placehold.it/50x50" class="float-l margin-r">

      <a data-prop="show" href="/show" class="float-r">
        View Details
      </a>

      <h4 data-prop="user">
        User's Name
      </h4>

      <p data-prop="text">
        Tweet text goes here
      </p>
    </div>

These attributes gives Pakyow the knowledge it needs to properly apply our
data to the view. Pakyow keeps the view completely separate from the
back-end, allowing the front-end to fully define how the data in the
application should be presented. If you haven't already, add the scopes 
and props to your `index.html` view. Let's also describe the data presented 
by `show.html`:

    html:
    <a href="/">
      Back to list
    </a>

    <div data-scope="tweet" class="margin-t">
      <img data-prop="avatar" src="http://placehold.it/50x50" class="float-l margin-r">

      <h4 data-prop="user">
        User's Name
      </h4>

      <p data-prop="text">
        Tweet text goes here
      </p>

      <p>
        Retweeted <span data-prop="retweet_count">n</span> times;
        Favorited <span data-prop="favorite_count">n</span> times;
        <a data-prop="twitter" href="#">
          View on twitter
        </a>
      </p>
    </div>

## Front-End Wrapup

At this point we've done the following:

1. Created a navigable prototype of our application
2. Made our views knowledgable of the data they will present

Click around, admire our progress, and let's move on.

# Adding the Back-End

Next we'll write the back-end code necessary to present our data. No
changes will be required to the views we've already created, leaving our
prototype intact.

<div class="callout">
  To see the prototype at any point (even once the back-end is added),
  run the application in the `prototype` environment. This can be done
  by stopping the application server (Ctrl-C) and restarting it in the
  prototype environment: pakyow server prototype
</div>

## Twitter Integration

We'll be interacting with Twitter through their developer API. They provide a
Ruby library to make this easier. There are a few steps to get
everything setup, but walking through it will show you how easy it is to work
with a Pakyow back-end.

First we need to add the Twitter gem to our `Gemfile`. The entire file should
look like this:

    ruby:
    source "http://rubygems.org"

    gem "pakyow", "0.8"

    # application server
    gem "puma"

    gem "twitter"

Stop the server (Ctrl-C) and run `bundle install` to install the gem. Then require 
it at the top of `app.rb`:

    ruby:
    require 'twitter'

Next, you'll need to register the application with Twitter. You can do that
[here](https://dev.twitter.com/apps/new). It doesn't matter what you use as the
Name, Description, and Website; Callback URL can be left blank.

Now let's add the credentials to our configuration. Open `app.rb` and add the
following code to the `global` configure block so it's available to both our
development and production environments (be sure and use the credentials
provided to you by Twitter):

    ruby:
    app.consumer_key        = "YOUR_CONSUMER_KEY"
    app.consumer_secret     = "YOUR_CONSUMER_SECRET"
    app.access_token        = "YOUR_ACCESS_TOKEN"
    app.access_token_secret = "YOUR_ACCESS_SECRET"

The entire file should look like this:

    ruby:
    require 'bundler/setup'

    require 'pakyow'
    require 'twitter'

    Pakyow::App.define do
      configure :global do
        app.consumer_key        = "YOUR_CONSUMER_KEY"
        app.consumer_secret     = "YOUR_CONSUMER_SECRET"
        app.access_token        = "YOUR_ACCESS_TOKEN"
        app.access_token_secret = "YOUR_ACCESS_SECRET"
      end

      configure :development do
        # put development config here
      end

      configure :prototype do
        # an environment for running the front-end prototype with no backend
        app.ignore_routes = true
      end

      configure :production do
        # suggested production configuration
        app.auto_reload = false
        app.errors_in_browser = false

        # put your production config here
      end
    end

Your application is ready to talk with Twitter!

## Twitter Helper

Our application needs an easy way to create a Twitter client using the
credentials we defined in our configuration. Because we'll need access to the
client throughout our back-end code, let's create a helper.

Open `app/lib/helpers.rb` and add the following code inside the `Helpers` module:

    ruby:
    def client
      @client ||= configure
    end

    protected

    def configure
      Twitter::REST::Client.new do |client|
        client.consumer_key         = config.app.consumer_key
        client.consumer_secret      = config.app.consumer_secret
        client.access_token         = config.app.access_token
        client.access_token_secret  = config.app.access_token_secret
      end
    end

When we call the `client` method from our back-end code, it will configure a new
instance of the Twitter client and return it. We'll use this object to fetch our
data from Twitter.

## Routing

Now we're ready to write the routing code. This app will have two routes, each
corresponding with one of the pages we created earlier. Because both routes are
dealing with a "tweet" object, it's best to define this using the [REST 
architecture](http://en.wikipedia.org/wiki/Representational_state_transfer). 
Pakyow makes this super easy.

Open `app/lib/routes.rb` and add the following code:

    ruby:
    restful :tweet, '/' do
    end

This defines the restful object and mounts it at the '/' path. Next, create a
route that responds to the 'list' REST method:

    ruby:
    restful :tweet, '/' do
      list do
      end
    end

The code block for the list route will be invoked when we make a GET request
to '/'. We also need a route that presents information about a particular tweet. 
This falls under the 'show' REST method:

    ruby:
    restful :tweet, '/' do
      list do
      end

      show do
      end
    end

Now let's add our logic to these empty route definitions.

## Presentation Logic

The first thing the `list` route will do is fetch the tweets that will be
displayed. We can use the `client` helper we defined earlier to search for
10 recent tweets containing #programming:

    ruby:
    tweets = client.search("#programming", result_type: "recent").take(10).to_a

Now, we can apply the data to the view. Pakyow automatically maps the request
path to a path in the views directory; here it maps '/' to the root view
directory. All that's left is to apply the data:

    ruby:
    view.scope(:tweet).apply(tweets)

This bit of code finds and applies data to the node that represents a `tweet`. 
The `apply` method alters the structure of the view to match the structure of 
the data being applied. In this case, it repeats the `tweet` node once for 
every tweet. Once the structures match, the data is easily mapped to the view.

The full list route should look like this:

    ruby:
    list do
      tweets = client.search("#programming", result_type: "recent").take(10).to_a
      view.scope(:tweet).apply(tweets)
    end

Fire up the app (if it isn't already running) and go to [localhost:3000](http://localhost:3000).
You'll see that the tweets are
pulled from Twitter and applied to the view. The only problem is some of the
data wasn't applied correctly; there's no avatar and the user name isn't being
presented properly.

We can solve this using bindings. Bindings sit between the back-end and
front-end code and help apply data to the view. Open `app/lib/bindings.rb` and
define the following binding for our `avatar` prop:

    ruby:
    scope :tweet do
      binding :avatar do
        { src: bindable[:user][:profile_image_url] }
      end
    end

This binding finds the `profile_image_url` in the tweet data being
applied and maps it to the `src` attribute. It will be invoked whenever
data is applied to the `avatar` prop of a `tweet` scope. Reload the
default page of the app in your browser and you'll see that the avatars
are now properly presented.

Let's also define a binding for the `user` prop, so the user name is
presented:

    ruby:
    binding :user do
      bindable[:user][:name]
    end

Unlike the `avatar` binding which mapped data to the `src` attribute,
this binding simply returns the user > name data as the content for 
the `user` prop. Reload the browser and you'll see the user names are 
now being presented correctly.

All of our data is now being presented. There's still one problem -- 
that is, the "View Details" link needs to go to the proper URI. Define 
the following binding for the `show` prop:

    ruby:
    binding :show do
      { href: router.group(:tweet).path(:show, tweet_id: bindable[:id]) }
    end

This binding uses the router path helper to create a URI to the restful
`show` method for the tweet. Reload the browser and click on a link. It
does take us to the right place, but we still see the prototype. Let's
add our back-end logic:

    ruby:
    tweet = client.status(params[:tweet_id])
    view.scope(:tweet).apply(tweet)

Reload your browser and you'll see the show view, with data. You'll notice
that the bindings we defined earlier are already being used here.

There are three things on the show page that weren't included in the
index page: the retweet / favorite counts, and the view on twitter
link. The data for the counts both just happen to be mapped correctly,
so there's nothing to do there. However, for the twitter link to
work we must define one last binding:

    ruby:
    binding :twitter do
      { href: "http://twitter.com/#{bindable[:user][:screen_name]}/status/#{bindable[:id]}" }
    end

Reload again and you'll see the twitter link now works properly.

## Back-End Wrapup

We just added a back-end to our application with the following steps:

1. Defined restful routes for our application
2. Added presentation logic that applies data to the views
3. Created bindings to help map data in the right place

Development is complete; let's ship it!

# Deployment

We'll be deploying our application to Heroku. The process is
summarized below, but you can read about this in more detail
[here](https://devcenter.heroku.com/articles/git).

First, our code must be in version control. Initialize a Git repository:

    console:
    git init
    Initialized empty Git repository in .git

Stage the new files:

    console:
    git add .

And commit the staged files:

    console:
    git commit -m "initial commit"
    [master (root-commit) d483d20] initial commit
     24 files changed, 1306 insertions(+)
     create mode 100644 Gemfile
     create mode 100644 Gemfile.lock
     create mode 100644 README.md
     create mode 100644 app.rb
     create mode 100644 app/lib/bindings.rb
     create mode 100644 app/lib/helpers.rb
     create mode 100644 app/lib/routes.rb
     create mode 100644 app/views/_intro.md
     create mode 100644 app/views/_templates/pakyow.html
     create mode 100644 app/views/index.html
     create mode 100644 app/views/show.html
     create mode 100644 config.ru
     create mode 100755 public/css/pakyow-css/CHANGES
     create mode 100755 public/css/pakyow-css/README.md
     create mode 100755 public/css/pakyow-css/VERSION
     create mode 100755 public/css/pakyow-css/examples/extension.css
     create mode 100755 public/css/pakyow-css/examples/structure-fluid.html
     create mode 100755 public/css/pakyow-css/examples/structure.html
     create mode 100755 public/css/pakyow-css/examples/styled.html
     create mode 100755 public/css/pakyow-css/reset.css
     create mode 100755 public/css/pakyow-css/structure.css
     create mode 100755 public/css/pakyow-css/style.css
     create mode 100755 public/css/pakyow-css/syntax.css
     create mode 100644 public/favicon.ico
     create mode 100644 rakefile

Your project is all ready to deploy! If you don't already have a Heroku
account, create one [here](https://api.heroku.com/signup/devcenter).
Then [install the toolbelt](https://toolbelt.heroku.com/).

Next, create your Heroku application (follow any prompts you receive):

    console:
    heroku create

Make a note of the outputted URL, this is how you will access your app.
Finally, push the code to Heroku:

    console:
    git push heroku master

Go to the app URL and find your app running in the cloud!

    console:
    heroku open

# Next Steps

We hope this warmup has been been enjoyable. If you have any questions, please
don't hesitate to ask them here, on the [mailing
list](http://groups.google.com/group/pakyow), or on [Twitter](http://twitter.com/pakyow)

Happy shipping!

-The Pakyow Team

<!-- @include disqus -->
