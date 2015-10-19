require 'bundler/setup'
require 'pakyow'

require 'sass/plugin/rack'
Sass::Plugin.options[:template_location] = './resources/sass'
Sass::Plugin.options[:css_location] = './public/css'

Pakyow::App.define do
  configure :global do
    Bundler.require(:default, Pakyow::Config.env)

    realtime.enabled = false
  end

  configure :development do
    # TODO: set this to the same thing as production
    $docs_path = '/Users/bryanp/code/pakyow/docs'
  end

  configure :prototype do
    app.ignore_routes = true
  end

  configure :production do
    app.auto_reload = false
    app.static = false
    app.errors_in_browser = false

    logger.path = '../../shared/log'

    Encoding.default_external = Encoding::UTF_8
    Encoding.default_internal = Encoding::UTF_8

    $docs_path = 'docs'
  end

  middleware do |builder|
    builder.use Sass::Plugin::Rack
  end

  after :load do
    BlogPost.load
    Category.load(YAML.load(File.read(File.join($docs_path, '_order.yaml'))))
  end
end
