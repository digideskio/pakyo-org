require 'httparty'

class Contributor
  def self.all
    return @cache if valid?

    @cache = JSON.parse(HTTParty.get('https://api.github.com/repos/pakyow/pakyow/contributors').body)
    @cached_at = Time.now

    return @cache
  end

  def self.valid?
    @cache && @cached_at > Time.now - 60 * 60 * 4
  end
end
