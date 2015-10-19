class ManifestParser
  def initialize(category_slug)
    @category_slug = category_slug
  end

  def order(topic_slug)
    topic_order.index(topic_slug)
  end

  private

  def topic_order
    @topic_order ||= YAML.load(File.read(manifest_path))
  end

  def manifest_path
    @manifest_path ||= File.join($docs_path, category_slug, '_order.yaml')
  end

  attr_reader :category_slug
end
