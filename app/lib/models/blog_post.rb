class BlogPost
  @@matcher = /^(---\s*\n.*?\n?)^(---\s*$\n?)/m

  class << self
    # returns the loaded posts
    def all
      @posts || []
    end

    # loads the blog posts
    def load
      @posts = []

      Dir.glob('posts/*.md').each do |path|
        post = BlogPost.new(path)
        next if post.published_at > Time.now
        @posts << post
      end

      @posts.sort! {|x,y| y.published_at <=> x.published_at }
    end

    # finds a post by url
    def find(url)
      @posts.find { |post| post.permalink == "/blog/#{url[1]}/#{url[2]}/#{url[3]}/#{url[4]}" }
    end
  end

  attr_accessor :id, :published_at, :title, :body, :outgoing_link, :nice_title, :draft, :found, :lesser, :noprev

  def initialize(path = nil)
    @path = path
    parse_file
  end

  # hashify
  def [](k)
    self.send(k)
  end

  #tmp
  def header
  end
  def show_link
  end

  # defined as: yyyy-mm-dd-nice-title.{txt || draft}
  def filename
    "#{self.published_at.strftime('%Y-%m-%d')}-#{self.nice_title}.#{self.extension}"
  end

  # defined as: /yyyy/mm/nice_title
  def permalink
    "/blog/#{self.published_at.strftime('%Y/%m/%d')}/#{self.nice_title}"
  end

  def outgoing
    true if self.outgoing_link
  end

  def html(body = self.body)
    Formatter.format(body)
  end

  protected

  def parse_file
    return unless @path
    return unless File.exists?(@path)
    @found = true

    # set nice title from path
    self.nice_title = @path.split('/')[1].split('-')[3..-1].join('-').gsub('.md', '')

    # is this a draft?
    self.draft = true if @path.split('.')[-1] == 'draft'

    raw = File.read(@path)#.split("\n")

    options = YAML.load(raw.match(@@matcher).to_s)
    self.title = options['title']
    self.outgoing_link  = options['link']
    time = options['time']
    self.lesser = options['lesser']
    self.noprev = options['noprev']

    # set publish date from path and time
    date = @path.split('/')[1].split('-')[0..2].join('-')
    # time = raw.split("\n")[1].strip.split('@time=')[1]
    self.published_at = Time.parse("#{date} #{time}")

    # get outgoing link
    # if self.outgoing_link = self.title.split("\":")[1]
      # self.title = self.title.split("\":")[0]
    # end

    self.title = self.title.gsub("\"", '').strip

    # get body
    self.body = raw.gsub(@@matcher, '')
  end

  def extension
    self.draft ? '.draft' : '.md'
  end
end
