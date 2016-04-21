require 'bundler/setup'
require 'pakyow'

require_relative 'lib/middleware/non-www_enforcer'

Pakyow::App.define do
  configure :global do
    Bundler.require(:default, Pakyow::Config.env)

    realtime.enabled = false
    session.enabled = false
  end

  configure :development do
    # TODO: set this to the same thing as production
    $docs_path = '/Users/bryanp/code/pakyow/docs'
  end

  configure :production do
    app.auto_reload = false
    app.static = true
    app.errors_in_browser = false

    Encoding.default_external = Encoding::UTF_8
    Encoding.default_internal = Encoding::UTF_8

    $docs_path = 'docs'
  end

  middleware do |builder|
    if Pakyow::Config.env == :production
      builder.use Rack::SslEnforcer
      builder.use Pakyow::Middleware::NonWwwEnforcer
    end
  end

  # TODO: fix this once 164 is resolved
  unless @after_load
    after :load do
      BlogPost.load
      Category.load(YAML.load(File.read(File.join($docs_path, '_order.yaml'))))
      @after_load = true
    end
  end
end
