module Pakyow::Helpers
  def set_active_nav(item)
    view.scope(:nav).prop(:"item-#{item}").attrs.class.ensure(:active)
  end

  def set_next_up(category, topic = :overview)
    if topic == :overview
      index = 0
    else
      index = category.topics.map(&:slug).index(topic.slug) + 1
    end

    if next_topic = category.topics[index]
      view.scope(:next).prop(:link).with do |view|
        view.attrs.href = router.group(:docs).path(:doc, { category_slug: next_topic.uri })
        view.text = "Next Up: #{next_topic.name} &#8250;"
      end
    else
      index = Category.all.map(&:slug).index(category.slug) + 1

      if next_category = Category.all[index]
        view.scope(:next).prop(:link).with do |view|
          view.attrs.href = router.group(:docs).path(:doc, { category_slug: next_category.uri })
          view.text = "Next Up: #{next_category.name} &#8250;"
        end
      else
        view.scope(:next).remove
      end
    end
  end

  def set_contrib(category, topic = :_overview)
    repo = 'https://github.com/pakyow/docs'

    unless topic == :_overview
      topic = topic.slug
    end

    view.scope(:contribute).prop(:link).attrs.href = File.join(repo, 'tree/master', category.slug, topic.to_s + '.md')
  end

  def render_nav(view, categories)
    view.apply(categories) do |category|
      attrs.class.ensure('expanded') if category.uri == req.path_parts[1]

      scope(:topic).apply(category.topics) do |topic|
        attrs.class.ensure('active') if topic.uri == req.path_parts[1..2].join('/')
      end
    end
  end
end
