Pakyow::App.routes do
  get 'blog' do
    posts = BlogPost.all
    partial(:post).scope(:post).bind(posts[0])
    partial(:archive).scope(:post).apply(posts[1..-1])
  end

  get /blog\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/[a-z0-9-]*/ do
    post = BlogPost.find(request.path_parts)

    if post.found
      presenter.path = 'blog/show'
      view.title = "pakyow | #{post.title}"

      partial(:post).scope(:post).with do
        bind(post)
        prop(:permalink).remove
        prop(:show_link).attributes.href = nil
      end
    else
      handle 404
    end
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
  end

  get 'blog/feed' do
    posts = BlogPost.all

    builder = Builder::XmlMarkup.new(:indent => 2)

    rfc882 = "%a, %d %b %Y %H:%M:%S %Z"

    xml = builder.rss(:version => 2.0, 'xmlns:atom' => 'http://www.w3.org/2005/Atom') do |rss|
      rss.channel do |channel|
        channel.title "Pakyow Development Blog"
        channel.description "The development blog for Pakyow, an open-source framework for building web apps in Ruby."
        channel.link "http://pakyow.com/blog/"
        channel.language "en"
        channel.copyright "#{Time.now.year} Metabahn, LLC"
        channel.pubDate posts.first.published_at.strftime(rfc882) unless posts.empty?
        channel.lastBuildDate posts.first.published_at.strftime(rfc882) unless posts.empty?

        posts.each do |post|
          channel.item do |item|
            item.title post.title
            item.description RDiscount.new(post.body).to_html
            item.link File.join("http://pakyow.com/blog/", post.permalink)
            item.guid File.join("http://pakyow.com/blog/", post.permalink), :isPermaLink => true
            item.pubDate post.published_at.strftime(rfc882)
            item.source "http://pakyow.com/blog/"
          end
        end
      end
    end

    send(xml.to_s + "\r\n", 'application/rss+xml')
  end
end
