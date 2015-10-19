class CategoryHeadingParser
  MATCHER = /^(---\s*\n.*?\n?)^(---\s*$\n?)/m unless defined? MATCHER

  def initialize(pn)
    @pn = pn
  end

  def name
    YAML.load(raw.match(MATCHER).to_s)['name']
  end

  def description
    YAML.load(raw.match(MATCHER).to_s)['desc']
  end

  def guide?
    YAML.load(raw.match(MATCHER).to_s)['guide']
  end

  def overview
    raw.gsub(MATCHER, '')
  end

  private

  def raw
    @raw ||= pn.read
  end

  attr_reader :pn
end
