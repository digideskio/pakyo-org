class Topic
  attr_reader :name, :body, :slug, :category_slug, :order, :description

  def initialize(attributes = {})
    @name = attributes[:name]
    @body = attributes[:body]
    @slug = attributes[:slug]
    @order = attributes[:order]
    @category_slug = attributes[:category_slug]
    @description = attributes[:description]
  end

  def uri
    "#{category_slug}/#{slug}".gsub('_', '-')
  end
end
