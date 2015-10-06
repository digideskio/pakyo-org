require 'rubygems'
require 'bundler/setup'

require 'pakyow-support'
require 'pakyow-core'
require 'pakyow-presenter'
require 'pakyow-slim'

require 'rdiscount'
require 'pygments'
require 'builder'

require 'sass/plugin/rack'
Sass::Plugin.options[:template_location] = './resources/sass'
Sass::Plugin.options[:css_location] = './public/css'

Pakyow::App.define do
  after :load do
    BlogPost.load
  end

  config.app.default_environment = :development

  configure(:development) do
    require 'pp'
    $stdout.sync = true
  end

  configure(:prototype) do
    app.ignore_routes = true
  end

  configure(:production) do
    app.auto_reload = false
    app.static = false
    app.errors_in_browser = false

    logger.path = '../../shared/log'

    Encoding.default_external = Encoding::UTF_8
    Encoding.default_internal = Encoding::UTF_8
  end

  processor :md do |content|
    Formatter.format(content)
  end

  middleware do |builder|
    builder.use Sass::Plugin::Rack
  end
end
