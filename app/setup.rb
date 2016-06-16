require 'bundler/setup'
require 'pakyow'

Pakyow::App.define do
  configure :global do
    Bundler.require(:default, Pakyow::Config.env)

    if defined?(Dotenv)
      env_path = ".env.#{Pakyow::Config.env}"
      Dotenv.load env_path if File.exist?(env_path)
      Dotenv.load
    end

    realtime.enabled = false
    session.enabled = false

    app.uri = 'https://www.pakyow.org'
  end

  configure :development do
    $docs_path = ENV['DOCS_PATH']
  end

  configure :production do
    app.auto_reload = false
    app.static = true
    app.errors_in_browser = false

    Encoding.default_external = Encoding::UTF_8
    Encoding.default_internal = Encoding::UTF_8

    $docs_path = 'docs/pakyow'

    realtime.redis[:url] = ENV['REDIS_URL']

    Bugsnag.configure do |config|
      config.api_key = ENV['BUGSNAG_API_KEY']
      config.project_root = Pakyow::Config.app.root
    end

    assets.compile_on_startup = false
    assets.prefix = '//s.pakyow.org'

    logger.stdout = true
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

Pakyow::App.after :configure do
  Pakyow::App.processor :html do |content|
    content = Pakyow::Assets.mixin_fingerprints(content) if Pakyow::Config.env == :production
    content
  end
end
