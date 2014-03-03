class Formatter
  def self.format(text)
    doc = Nokogiri::HTML.fragment(RDiscount.new(text).to_html)

    # syntax highlighting
    doc.css('pre').each do |pre|
      code = pre.css('code').first

      begin
        lexer_name = code.text.split("\n")[0].gsub(':', '')
        code.inner_html = Pygments.highlight(code.inner_html.split("\n")[1..-1].join("\n").strip.gsub(/&lt;|&gt;/) {|s| {'&lt;' => '<','&gt;' => '>'}[s]}, :lexer => lexer_name)
        code.set_attribute('class', lexer_name)
        pre.replace(code)
      rescue
      end

    end

    doc.to_html
  end
end
