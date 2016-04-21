Pakyow::App.routes do
  handler 404 do
    presenter.path = 'errors/404'
  end

  handler 500 do
    unless Pakyow::Config.env == :development
      subject = 'pakyow-web fail'

      body = []
      body << request.path
      body << ""
      body << request.error.message
      body << ""
      body.concat(request.error.backtrace)

      mail = Mail.new do
        from    'fail@pakyow.com'
        to      ENV['FAIL_MAIL']
        subject subject
        body    body.join("\n")
      end

      mail.delivery_method :sendmail
      mail.deliver
    end

    presenter.path = 'errors/500'
  end

  get 'manual' do
    redirect '/docs', 301
  end

  get 'feed' do
    redirect '/blog/feed', 301
  end

  get 'posts' do
    redirect '/blog', 301
  end

  get /posts\/(.*)/ do
    parts = request.path_parts
    parts[0] = 'blog'

    redirect '/' + parts.join('/'), 301
  end

  get 'blog' do
    posts = BlogPost.all
    partial(:list).scope(:post).apply(posts[0..5])
    set_active_nav(:blog)
  end

  get /blog\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/[a-z0-9-]*/ do
    post = BlogPost.find(request.path_parts)

    if post
      presenter.path = 'blog/show'
      view.title = "Pakyow &#8250; #{post.title}"

      partial(:post).scope(:post).with do
        bind(post)
        prop(:permalink).remove
        prop(:show_link).attrs.href = nil
      end

      set_active_nav(:blog)
    else
      handle 404
    end
  end

  get 'community' do
    redirect '/get-involved', 301
  end

  get 'blog/archive' do
    months = {
      '1' => 'January',
      '2' => 'February',
      '3' => 'March',
      '4' => 'April',
      '5' => 'May',
      '6' => 'June',
      '7' => 'July',
      '8' => 'August',
      '9' => 'September',
      '10' => 'October',
      '11' => 'November',
      '12' => 'December'
    }

    groups = BlogPost.all.group_by{|p| "#{p.published_at.year}-#{p.published_at.month}"}.to_a.sort{|a,b| b[0] <=> a[0]}
    view.scope(:group).repeat(groups) {|group|
      y,m = group[0].split('-')
      prop(:title).html = "#{months[m]} #{y}"
      scope(:post).apply(group[1])
    }

    set_active_nav(:blog)
  end

  get 'blog/feed' do
    posts = BlogPost.all

    builder = Builder::XmlMarkup.new(:indent => 2)

    rfc882 = "%a, %d %b %Y %H:%M:%S %Z"

    processor = Pakyow.app.presenter.processor_store[:md]


    xml = builder.rss(:version => 2.0, 'xmlns:atom' => 'http://www.w3.org/2005/Atom') do |rss|
      rss.channel do |channel|
        channel.title "Pakyow Development Blog"
        channel.description "The development blog for Pakyow, an open-source framework for building web apps in Ruby."
        channel.link "http://pakyow.org/blog/"
        channel.language "en"
        channel.copyright "#{Time.now.year} Metabahn, LLC"
        channel.pubDate posts.first.published_at.strftime(rfc882) unless posts.empty?
        channel.lastBuildDate posts.first.published_at.strftime(rfc882) unless posts.empty?

        posts.each do |post|
          channel.item do |item|
            item.title post.title
            item.description processor.call(post.body) #RDiscount.new(post.body).to_html
            item.link File.join("http://pakyow.org", post.permalink)
            item.guid File.join("http://pakyow.org", post.permalink), :isPermaLink => true
            item.pubDate post.published_at.strftime(rfc882)
            item.source "http://pakyow.org/blog/"
          end
        end
      end
    end

    send(xml.to_s + "\r\n", 'text/xml')
  end

  get 'warmup' do
    redirect '/docs/warmup', 301
  end

  get 'get-involved' do
    set_active_nav(:community)

    view.scope(:contributor).apply(Contributor.all)
  end

  # to fix google crawl errors

  get '/2012/02/16/announcing_zero_eight' do
    redirect '/blog/2012/02/16/announcing_zero_eight', 301
  end

  get '/2011/11/21/zero_seven' do
    redirect '/blog/2011/11/21/zero_seven', 301
  end

  get '/2013/02/14/zero_eight_rc1_release' do
    redirect '/blog/2013/02/14/zero_eight_rc1_release', 301
  end

  namespace :docs, '/docs', after: [:navigation, :canonical] do
    fn :navigation do
      render_nav(partial(:toc).scope(:category), Category.all)
    end

    fn :canonical do
      view.scope(:head).prop(:canonical).attrs.href = req.path.gsub('_', '-')
    end

    default do
      reroute('/docs/overview')
    end

    # rewrites to handle doc renaming
    get '/getting-started' do
      redirect '/docs/start', 301
    end

    get '/getting-started/installation' do
      redirect '/docs/start/installing', 301
    end

    get '/getting-started/installing' do
      redirect '/docs/start/installing', 301
    end

    get '/getting-started/generation' do
      redirect '/docs/start/creating', 301
    end

    get '/getting-started/running' do
      redirect '/docs/start/running', 301
    end

    get '/getting-started/contributing' do
      redirect '/docs/start/contributing', 301
    end

    get '/getting-started/license' do
      redirect '/docs/start/license', 301
    end

    get '/view-composition' do
      redirect '/docs/presenting', 301
    end

    get '/view-composition/processors' do
      redirect '/docs/presenting/processors', 301
    end

    get '/view-management' do
      redirect '/docs/view-logic/api', 301
    end

    get '/view-management/:redir_slug' do
      redirect '/docs/view-logic/' + params[:redir_slug], 301
    end

    get '/view-logic/traversing' do
      redirect '/docs/view-logic/api', 301
    end

    get '/data-binding' do
      redirect '/docs/view-logic', 301
    end

    get '/data-binding/binding-api' do
      redirect '/docs/view-logic/api', 301
    end

    get '/data-binding/data-sets' do
      redirect '/docs/view-logic/data-sets', 301
    end

    get '/data-binding/nested' do
      redirect '/docs/view-logic/nested', 301
    end

    get '/bindings' do
      redirect '/docs/view-logic/bindings', 301
    end

    get '/bindings/modifying-values' do
      redirect '/docs/view-logic/bindings', 301
    end

    get '/bindings/view-access' do
      redirect '/docs/view-logic/bindings', 301
    end

    get '/bindings/binding-sets' do
      redirect '/docs/view-logic/bindings', 301
    end

    get '/configuration' do
      redirect '/docs/config', 301
    end

    get '/working-with-forms' do
      redirect '/docs/forms', 301
    end

    get '/handling-failure' do
      redirect '/docs/failure', 301
    end

    get '/handling-failure/email' do
      redirect '/docs/failure/email', 301
    end
    # /rewrites

    get :doc, '/:category_slug' do
      if slug = params[:category_slug]
        slug.gsub!('-', '_')
        presenter.path = 'docs/doc'

        if slug == 'warmup'
          set_active_nav(:warmup)
        else
          set_active_nav(:docs)
        end

        if category = Category.find(params[:category_slug])
          view.title = "Pakyow &#8250; Docs &#8250; #{category.name}"
          view.scope(:head).prop(:description).attrs[:content] = category.description

          container(:default).scope(:category).with do
            bind(category)
          end

          set_next_up(category)
          set_contrib(category)
        else
          app.handle 404
        end
      else
        presenter.path = 'docs'
      end
    end

    get :topic, '/:category_slug/:topic_slug' do
      c_slug = params[:category_slug]
      t_slug = params[:topic_slug]

      if c_slug && t_slug
        c_slug.gsub!('-', '_')
        t_slug.gsub!('-', '_')

        presenter.path = 'docs/topic'

        if c_slug == 'warmup'
          set_active_nav(:warmup)
        else
          set_active_nav(:docs)
        end

        if category = Category.find(params[:category_slug])
          if topic = category.topics.find { |t| t.slug == t_slug }
            view.title = "Pakyow &#8250; Docs &#8250; #{category.name} &#8250; #{topic.name}"
            view.scope(:head).prop(:description).attrs[:content] = topic.description

            container(:default).scope(:topic).bind(topic)

            set_next_up(category, topic)
            set_contrib(category, topic)
          else
            handle 404
          end
        else
          handle 404
        end
      else
        presenter.path = 'docs'
      end
    end
  end
end
