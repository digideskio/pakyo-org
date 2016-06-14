namespace :assets do
  task compile: [:'pakyow:stage'] do
    Pakyow.logger.debug 'Precompiling assets...'
    Pakyow::Assets.precompile
    Pakyow.logger.debug 'Finished precompiling!'
  end
end
