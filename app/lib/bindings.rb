Pakyow::App.bindings do
  scope :post do
    binding :header do
      if bindable.outgoing
        { :class => 'outgoing' }
      else
        {}
      end
    end

    binding :show_link do
      { :content => bindable.title, :href => bindable.outgoing ? bindable.outgoing_link : bindable.permalink }
    end

    binding :permalink do
      { :href => bindable.permalink }
    end

    binding :published_at do
      bindable.published_at.strftime('%B %d, %Y')
    end

    binding :body do
      bindable.html
    end
  end
end
