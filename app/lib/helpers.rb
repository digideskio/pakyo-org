module Pakyow::Helpers
  def set_active_nav(item)
    view.scope(:nav).prop(:"item-#{item}").attrs.class.ensure(:active)
  end
end
