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

  scope :contributor do
    binding :avatar do
      {:src => "#{bindable['avatar_url']}&s=178"}
    end

    binding :login do
      {
        :href => "#{bindable['html_url']}",
        :content => "#{bindable['login']}"
      }
    end

    binding :count do
      {:content => "#{bindable['contributions']}"}
    end

    binding :grammatical_num do
      {:content => bindable['contributions'] > 1 ? 'contributions' : 'contribution'}
    end
  end
end
