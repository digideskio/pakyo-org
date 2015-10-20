require 'pathname'

class Category
  class << self
    attr_reader :all

    def load(slugs)
      @all = slugs.map { |category_slug|
        category = Category.new(category_slug)
        category.parse_topics!
        category
      }
    end

    def find(slug)
      all.find { |category| category.slug == slug }
    end
  end

  attr_reader :slug, :topics, :name, :overview, :description

  def initialize(slug)
    @slug = slug
    @topics = []
  end

  def parse_topics!
    category_heading = CategoryHeadingParser.new(heading_path_name)
    self.name = category_heading.name
    self.overview = category_heading.overview
    self.description = category_heading.description
    @guide = category_heading.guide?

    self.topics = topics_path_names.map { |topic_path_name|
      TopicParser.new(topic_path_name, slug, manifest.order(topic_slug(topic_path_name))).topic
    }.sort_by(&:order)
  end

  def uri
    slug.gsub('_', '-')
  end

  def guide?
    @guide == true
  end

  private

  def heading_path_name
    topics_file_path_names.select { |pn| category_heading?(topic_slug(pn)) }.first
  end

  def topics_path_names
    topics_file_path_names.select { |pn| !category_heading?(topic_slug(pn)) }
  end

  def manifest
    @manifest ||= ManifestParser.new(slug)
  end

  def topic_slug(pathname)
    pathname.basename(".*").to_s
  end

  def category_heading?(topic_slug)
    topic_slug == "_overview"
  end

  def topics_file_path_names
    topics_file_names.map {|filename| Pathname.new(filename) }
  end

  def topics_file_names
    Dir.glob(File.join($docs_path, slug, '*.md'))
  end

  attr_writer :name, :overview, :topics, :description
end
