require 'rubygems'
require 'bundler/setup'

require 'pakyow'
require 'rdiscount'
require 'pygments'
require 'builder'

require 'sass/plugin/rack'
Sass::Plugin.options[:template_location] = './resources/sass'
Sass::Plugin.options[:css_location] = './public/css'

Pakyow::App.define do
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
  end

  processor :md do |content|
    Formatter.format(content)
  end

  middleware do |builder|
    builder.use Sass::Plugin::Rack
  end
end
