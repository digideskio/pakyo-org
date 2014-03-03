require "bundler/capistrano"

set :application, "metabahn_v6"
set :repository,  "git@github.com:metabahn/metabahn_v6.git"

set :runner, "root"
set :user, "root"

set :ssh_options, {:forward_agent => true}

set :scm, :git
set :git_enable_submodules, true
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`

set :deploy_to, "/var/apps/pakyow/metabahn_v6-beta"
set :normalize_asset_timestamps, false

role :web, "50.116.35.172"                          # Your HTTP server, Apache/etc
role :app, "50.116.35.172"                          # This may be the same as your `Web` server
role :db,  "50.116.35.172", :primary => true # This is where Rails migrations will run

# if you want to clean up old releases on each deploy uncomment this:
after "deploy:restart", "deploy:cleanup"

# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

# If you are using Passenger mod_rails uncomment this:
namespace :deploy do
  task :start do ; end
  task :stop do ; end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end
end
