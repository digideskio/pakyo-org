//TODO consider adding support for fns, hooks, etc
//TODO handle updating data vs adding new
//  Scenarios:
//    single thing: bind the new data
//    many things: bind the new data (for existing), create for new
//  Perhaps an `update` method is necessary here. It would first search the view for nodes with a
//  matching `data-id`. Then it calls `apply`. When applying existing data, the existing view is 
//  used and the new data is bound to it. This *should* use the same node so events and components
//  are still registered to it.
//TODO handle destructed views
//  Cases:
//    no view exists (e.g. the first comment problem)
//    the view was modified in some way
//  All cases can be handled in a consistent way. That is, ask the backend for the view. A special
//  route is needed here that accepts three arguments: find_by, query, and path.
//    find_by: scope, prop, container, etc
//    query: the value for above methods
//    path: the path to the found thing (from document root)
//  One difference though is the first case should be handled automatically and the second is an
//  instruction from the back-end. For example:
//    view.refresh.bind(...)
//  When a refresh is needed the action is applied to the response and inserted into the view. One
//  thought: could we send the view down with the data in the refresh case?
//TODO make sure sources can be updated with pre-rendered views
//TODO add applyr/bindr
//TODO add support for nice attributes (boolean, multiple, single)
//TODO predefined components for ajax links/forms
//TODO handle data sources for previous history
//TODO trigger events on component when data bound in
//TODO separate instruction application to other methods, for use by anyone

var pui;
(function() {
  pui = {};


  // establishes websocket connection
  pui.ws_connect = function(host, port) {
    if(typeof host === 'undefined') host = window.location.hostname;
    if(typeof port === 'undefined') port = 8080;

    pui.ws = new WebSocket("ws://" + host + ":" + port + "/");
    
    pui.ws.onopen    = pui.ws_open;
    pui.ws.onclose   = pui.ws_close;
    pui.ws.onmessage = pui.ws_message;
  };

  //TODO think about best way to handle this
  pui.subscribed_collections = [];

  // handle new ws connection
  pui.ws_open = function() {
    pui.subscribe(pui.doc, 'default');

    var os = pui.doc.by_attr('data-channel');
    for(var i = 0; i < os.length; i++) {
      var o = os[i];
      var channel = o.doc.getAttribute('data-channel');

      var collection = o.doc.getAttribute('data-collection');
      if(collection) {
        if(pui.subscribed_collections.indexOf(collection) != -1) continue;
        pui.subscribed_collections.push(collection);

        var collection = pui.doc.by_attr('data-channel', channel);
        pui.subscribe(collection, channel);
      } else {
        pui.subscribe(o, channel);
      }
    }
  };

  // handle lost ws connection
  pui.ws_close = function() {
    pui.ws_retry();
  };

  // tries to reconnect to ws server
  //TODO limit the number of retries, then unsubscribe and notify user
  var retrying = false;
  pui.ws_retry = function() {
    if(retrying) return;
    retrying = true;

    var retryInterval = setInterval(function() {
      if(pui.ws.readyState === 1) {
        retrying = false;
        clearInterval(retryInterval);
      } else {
        pui.ws_connect();
      }
    }, 1000);
  };

  // receives message via ws
  pui.ws_message = function(e) {
    var packet = JSON.parse(e.data);

    // console.log('!message');
    // console.log(packet);

    var subscriptions = pui.subscriptions[packet.channel];
    for(var i = 0; i < subscriptions.length; i++) {
      var v = subscriptions[i];

      if(v instanceof Array) {
        // view collection

        //TODO make this a helper?
        var vs = new pui_ViewCollection();
        for(var j = 0; j < v.length; j++) {
          vs.add(new pui_View(v[j]));
        }
      } else {
        // single view (still add to collection so things work right)
        vs = new pui_ViewCollection();
        vs.add(new pui_View(v))
      }

      pui.instructContext(vs, packet.instructions, packet.channel);
    }
  };

  pui.instructContext = function(context, instructions, channel) {
    for(var i = 0; i < instructions.length; i++) {
      var instruction = instructions[i];
      
      if(context instanceof pui_ComponentCollection) {
        // we know this is a ComponentCollection, so use handle to call on each component
        context.handle(instruction[0], instruction[1]);
      } else {
        // handle without components
        var ret = context[instruction[0]].call(context, instruction[1]);
      
        if(instruction[2] instanceof Array) { // we have instructions to invoke on the new context
          pui.instructContext(ret, instruction[2]);
        } else if(ret) { // no instructions, but we do have a return value; set it as the new context 
                         // since the result is the current context w/transformations applied
          context = ret;
        } 
      }
    }

    // called only the first call to instructContext; updates the doc references to subscribed views
    if(context && channel) {
      // update doc refs
      var docs = [];
      for(var j = 0; j < context.length(); j++) {
        var doc = context.views[j].doc;
        // console.log(doc.doc)
        docs.push(doc);
      }
      pui.subscriptions[channel] = [docs];  
    }
  };

  pui.subscriptions = {};

  // subscribes to a channel
  pui.subscribe = function(doc, id) {
    if(!pui.subscriptions[id]) { // create subscription
      pui.subscriptions[id] = [];
      pui.ws.send(JSON.stringify({type: 'subscriber', id: id}));
    }

    // register the doc
    pui.subscriptions[id].push(doc);
  };

  // unsubscribes from subscribed channels
  pui.unsubscribe = function() {
    //TODO
  };


  // DOM

  pui_Doc = function(doc) {
    this.doc = doc;
  };

  pui_Doc.prototype.all = function() {
    var arr = [];

    if(document !== this.doc) arr.push(this.doc);

    var os = this.doc.getElementsByTagName('*');
    for(var i = 0; i < os.length; i++) {
      arr.push(os[i]);
    }

    return arr;
  };

  pui_Doc.prototype.by_attr = function(attr, compare_value) {
    var arr = [];
    var os = this.all();
    for(var i = 0; i < os.length; i++) {
      var o = os[i];
      var value = o.getAttribute(attr);

      if(value !== null && (typeof compare_value === 'undefined' || value === compare_value)) {
        arr.push(new pui_Doc(o));
      }
    }

    return arr;
  };

  pui_Doc.prototype.dup = function() {
    return new pui_Doc(this.doc.cloneNode(true));
  };

  pui_Doc.prototype.before = function(doc) {
    this.doc.parentNode.insertBefore(doc.doc, this.doc);
  };

  pui_Doc.prototype.after = function(doc) {
    this.doc.parentNode.insertBefore(doc.doc, this.doc.nextSibling);
  };

  pui_Doc.prototype.remove = function() {
    this.doc.parentNode.removeChild(this.doc);
  };

  pui_Doc.prototype.breadth_first = function(fn) {
    var queue = [this.doc];
    while(queue.length > 0) {
      var node = queue.shift();
      if(typeof node == "object" && "nodeType" in node && node.nodeType === 1 && node.cloneNode) {
        fn.call(new pui_Doc(node));
      }

      var children = node.childNodes;
      for(var i = 0; i < children.length; i++) {
        queue.push(children[i]);
      }
    }
  };

  pui_Doc.prototype.tag_without_value = function() {
    var arr = ['SELECT'];
    return arr.indexOf(this.doc.tagName) != -1 ? true : false;
  };

  pui_Doc.prototype.self_closing_tag = function() {
    var arr = ['AREA', 'BASE', 'BASEFONT', 'BR', 'HR', 'INPUT', 'IMG', 'LINK', 'META'];
    return arr.indexOf(this.doc.tagName) != -1 ? true : false;
  };


  // VIEW

  // view constructor
  pui.view = function(doc){
    var view = new pui_View(doc);
    return view;
  };

  var pui_View = function(doc) {
    this.doc = doc;
  };

  pui_View.prototype.scope = function(name) {
    var collection = new pui_ViewCollection();

    var os = this.doc.by_attr('data-scope', name);
    for(var i = 0; i < os.length; i++) {
      collection.add(new pui_View(os[i]));
    }

    return collection;
  };

  pui_View.prototype.prop = function(name) {
    var collection = new pui_ViewCollection();

    var os = this.doc.by_attr('data-prop', name);
    for(var i = 0; i < os.length; i++) {
      collection.add(new pui_View(os[i]));
    }

    return collection;
  };

  pui_View.prototype.container = function(name) {
    var collection = new pui_ViewCollection();

    var os = this.doc.by_attr('data-container', name);
    for(var i = 0; i < os.length; i++) {
      collection.add(new pui_View(os[i]));
    }

    return collection;
  };

  pui_View.prototype.remove = function() {
    this.doc.remove();
  };

  // creates a context in which view manipulations can occur
  pui_View.prototype.with = function(fn) {
    fn.call(this);
  };

  pui_View.prototype.for = function(data, fn) {
    if(!(data instanceof Array)) data = [data];
    fn.call(this, data[0]);
  };

  pui_View.prototype.match = function(data) {
    if(!(data instanceof Array)) data = [data];

    var collection = new pui_ViewCollection();
    for(var i = 0; i < data.length; i++) {
      var dup = this.doc.dup();
      this.doc.before(dup);

      collection.add(new pui_View(dup));
    }

    this.remove();
    return collection;
  };

  pui_View.prototype.repeat = function(data, fn) {
    this.match(data).for(data, fn);
  };

  pui_View.prototype.bind = function(data, fn) {
    var bindings = this.find_bindings();
    var scope = bindings[0];

    if(data.id) this.doc.doc.setAttribute('data-id', data.id);

    this.bind_data_to_scope(data, scope);
    if(!(typeof fn === 'undefined')) fn.call(this, data);
  };

  pui_View.prototype.apply = function(data, fn) {
    this.match(data).bind(data, fn);
  };

  // works for binding a single datum
  //TODO handle collections
  pui_View.prototype.update = function(data) {
    // when updating a single datum, it finds the view with a matching id and binds
    // the data to it. for a collection of data, it binds data to existing views,
    // removes views with data that don't exist, and adds views for new data

    // letting update handle the single datum case keeps us from having an `id`
    // function used to limit an operation to an id. let the data decide!

    var datum = data;
    var found = this.doc.by_attr('data-id', datum.id.toString())[0];

    if(!(typeof found === 'undefined')) {
      var v = new pui_View(found);
      v.bind(datum)
    }

    // OLD
    // if(!(data instanceof Array)) data = [data];

    // console.log('update with: ');
    // console.log(data);

    // console.log(this.doc.doc)

    // var existing_ids = [];
    // var existing_docs = {};
    // for(var i = 0; i < data.length; i++) {
    //   var datum = data[i];
    //   var found = this.doc.by_attr('data-id', datum.id.toString())[0];
    //   if(!(typeof found === 'undefined')) {
    //     existing_ids.push(datum.id);
    //     existing_docs[datum.id] = found.doc;
    //   }
    // }

    // console.log('existing ids:');
    // console.log(existing_ids);

    // //NEW MATCH FN
    // var collection = new pui_ViewCollection();
    // for(var i = 0; i < data.length; i++) {
    //   var datum = data[i];
    //   var doc;

    //   if(existing_ids.indexOf(datum.id) != -1) {
    //     doc = new pui_Doc(existing_docs[datum.id]);
    //   } else {
    //     doc = this.doc.dup();

    //     // must append instead of inserting before since existing docs
    //     //   aren't replaced
    //     this.doc.doc.parentNode.appendChild(doc.doc);
    //   }
      
    //   collection.add(new pui_View(doc));
    // }

    // collection.bind(data);

    // //TODO fix removal
  };

  pui_View.prototype.component = function(name) {
    if(typeof name === 'undefined') {
      //find component for view
      for(var i = 0; i < pui.registered_components.length; i++) {
        var c = pui.registered_components[i];
        if(c.doc.doc === this.doc.doc) return c;
      }
    } else {
      //find components by name; return views
      var collection = new pui_ViewCollection();
      for(var i = 0; i < pui.registered_components.length; i++) {
        var c = pui.registered_components[i];
        if(c.name === name) collection.add(new pui_View(c.doc));
      }
      return collection;
    }
  };

  // currently storing doc references, since bindings are refound
  // each time; ultimately need to store paths and not refind
  pui_View.prototype.find_bindings = function() {
    var bindings = [];
    this.doc.breadth_first(function() {
      var o = this;
      var scope = o.doc.getAttribute('data-scope');
      if(!scope) return;

      var props = [];
      o.breadth_first(function() {
        var so = this;
        
        // don't go into deeper scopes
        if(o.doc != so.doc && so.doc.getAttribute('data-scope')) return;

        var prop = so.doc.getAttribute('data-prop');
        if(!prop) return;
        props.push({prop:prop, doc:so});
      });

      bindings.push({scope: scope, doc: o, props: props});
    });

    return bindings;
  };

  pui_View.prototype.bind_data_to_scope = function(data, scope) {
    if(!data) return;

    for(var i = 0; i < scope['props'].length; i++) {
      var p = scope['props'][i];

      k = p['prop'];
      v = data[k];

      //TODO handle form field binding

      if(typeof v === 'object') {
        this.bind_attributes_to_doc(v, p['doc']);
      } else {
        this.bind_value_to_doc(v, p['doc']);
      }
    }
  };

  pui_View.prototype.bind_value_to_doc = function(value, doc) {
    if(!value) return;
    if(doc.tag_without_value()) return;
    doc.self_closing_tag() ? doc.doc.value = value : doc.doc.innerHTML = value;
  };

  pui_View.prototype.bind_attributes_to_doc = function(attrs, doc) {
    for(var attr in attrs) {
      var v = attrs[attr];
      if(attr === 'content') {
        this.bind_value_to_doc(v, doc);
        continue;
      }

      if(isFunction(v)) v = v.call(doc.doc.getAttribute(attr));
      !v ? doc.doc.removeAttribute(attr) : doc.doc.setAttribute(attr, v);
    }
  };

  pui_View.prototype.content = function(data) {
    this.doc.doc.innerHTML = data;
  };

  pui_View.prototype.append = function(data) {
    var dup = this.doc.dup();
    var view = new pui_View(dup);
    view.bind(data);

    this.doc.after(view.doc);
    return view;
  };

  pui_View.prototype.prepend = function(data) {
    var dup = this.doc.dup();
    var view = new pui_View(dup);
    view.bind(data);

    this.doc.before(view.doc);
    return view;
  };


  var pui_ViewCollection = function() {
    this.views = [];
  };

  pui_ViewCollection.prototype.length = function() {
    return this.views.length;
  };

  pui_ViewCollection.prototype.get = function(i) {
    return this.views[i];
  };

  pui_ViewCollection.prototype.add = function(view) {
    this.views.push(view);
  };

  pui_ViewCollection.prototype.last = function() {
    return this.views[this.length() - 1];
  }

  pui_ViewCollection.prototype.concat = function(collection) {
    for(var i = 0; i < collection.length(); i++) {
      this.add(collection.get(i));
    }
  };

  pui_ViewCollection.prototype.remove = function() {
    for(var i = 0; i < this.length(); i++) {
      this.get(i).remove();
    }
  };

  pui_ViewCollection.prototype.scope = function(name) {
    var collection = new pui_ViewCollection();

    for(var i = 0; i < this.views.length; i++) {
      collection.concat(this.views[i].scope(name));
    }

    return collection;
  };

  pui_ViewCollection.prototype.collection = function(name) {
    var collection = new pui_ViewCollection();

    //TODO find children where data-collection == name

    return collection;
  };

  pui_ViewCollection.prototype.prop = function(name) {
    var collection = new pui_ViewCollection();

    for(var i = 0; i < this.views.length; i++) {
      collection.concat(this.views[i].prop(name));
    }

    return collection;
  };

  pui_ViewCollection.prototype.container = function(name) {
    var collection = new pui_ViewCollection();

    for(var i = 0; i < this.views.length; i++) {
      collection.concat(this.views[i].container(name));
    }

    return collection;
  };

  pui_ViewCollection.prototype.with = function(fn) {
    fn.call(this);
  };

  pui_ViewCollection.prototype.for = function(data, fn) {
    if(!(data instanceof Array)) data = [data];
    for(var i = 0; i < this.length(); i++) {
      fn.call(this.get(i), data[i]);
    }
  };

  pui_ViewCollection.prototype.match = function(data) {
    if(!(data instanceof Array)) data = [data];

    var collection = new pui_ViewCollection();
    for(var i = 0; i < data.length; i++) {
      var view = this.get(i);

      // out of views, use the last one
      if(!view) {
        view = this.last();
      }

      var dup = view.doc.dup();
      view.doc.before(dup);

      collection.add(new pui_View(dup));
    }

    this.remove();
    return collection;
  };

  pui_ViewCollection.prototype.repeat = function(data, fn) {
    this.match(data).for(data, fn);
  };

  pui_ViewCollection.prototype.bind = function(data, fn) {
    this.for(data, function(datum) {
      this.bind(datum);
      if(!(typeof fn === 'undefined')) fn.call(this, datum);
    });
  };

  pui_ViewCollection.prototype.apply = function(data, fn) {
    var new_collection = this.match(data);
    new_collection.bind(data, fn);
    return new_collection;
  };

  //TODO make this fully work once View#update is working
  pui_ViewCollection.prototype.update = function(data) {
    for(var i = 0; i < this.length(); i++) {
      this.views[i].update(data[i]);
    }
  };

  pui_ViewCollection.prototype.component = function(f) {
    var collection = new pui_ComponentCollection();
    for(var i = 0; i < this.length(); i++) {
      var view = this.get(i);
      var c = view.component();

      if(c) collection.add(c);
    }

    return collection;
  };

  pui_ViewCollection.prototype.content = function(data) {
    for(var i = 0; i < this.length(); i++) {
      this.views[i].content(data);
    }
  };

  pui_ViewCollection.prototype.append = function(data) {
    var last = this.views[this.length() - 1];
    this.add(last.append(data));
    return this;
  };

  pui_ViewCollection.prototype.prepend = function(data) {
    var last = this.views[0];
    this.add(last.prepend(data));
    return this;
  };


  // UI COMPONENTS

  pui.components = [];
  pui.registered_components = [];
  pui.listening_components = {};

  var pui_Component = function(cfn, doc, name, conf) {
    // Mix the config values from the component into the component function
    cfn.prototype.config = pui.buildConfigObject(conf);

    // Functions for announcing/listening
    cfn.prototype.announce = function(to, data) {
      var cbfns = pui.listening_components[to] || [];
      for(var i = 0; i < cbfns.length; i++) {
        cbfns[i](data);
      }
    };

    cfn.prototype.react = function(to, cbfn) {
      if(typeof pui.listening_components[to] === 'undefined') {
        pui.listening_components[to] = [];
      }

      pui.listening_components[to].push(cbfn);
    };

    // Function for loading dependencies
    cfn.prototype.dependencies = [];
    cfn.prototype.dependency = function(opts) {
      try {
        //prevent a dependency from being loaded twice
        if(this.dependencies.indexOf(opts.script) > -1) return;

        this.dependencies.push(opts.script);

        var oHead = document.getElementsByTagName('head')[0];
        var oScript = document.createElement('script');
        oScript.type = 'text/javascript';
        oScript.src = opts.script;

        // most browsers
        if(opts.loaded === undefined) {
          oScript.onload = cfn.instance;
          // IE 6 & 7
          oScript.onreadystatechange = function() {
            if (this.readyState == 'complete') {
              cfn.instance();
            }
          }
        } else if(opts.loaded !== null) {
          opts.loaded();
        }

        oHead.appendChild(oScript);
      } catch(e) {
        console.log('Error loading dependency');
        console.log(e);
        console.log(e.message);
      }
    }

    cfn.instance = function(check_dependencies) {
      var instance = new cfn(doc.doc);
      instance.doc = doc;
      instance.name = name;

      if(check_dependencies !== true || instance.dependencies.length === 0) {
        try {
          instance.init();
        } catch(e) {
          console.log('Error initializing component \'' + name + '\'');
          console.log(e);
          console.log(e.message);
        }

        pui.registered_components.push(instance);
        return instance;
      }
    }

    cfn.instance(true);

    //TODO not sure we want to do this anymore
    // mix in view methods
    // var view = new pui_View(doc);
    // i.remove = function() {
    //   view.remove();
    // };

    // i.match = function(data) {
    //   view.match(data);
    // };

    // i.bind = function(data) {
    //   view.bind(data);
    // };

    // i.apply = function(data) {
    //   view.apply(data);
    // };

    // i.update = function(data) {
    //   view.update(data);
    // };
  };

  var pui_ComponentCollection = function() {
    this.components = [];
  };

  pui_ComponentCollection.prototype.length = function() {
    return this.components.length;
  };

  pui_ComponentCollection.prototype.get = function(i) {
    return this.components[i];
  };

  pui_ComponentCollection.prototype.add = function(component) {
    this.components.push(component);
  };

  pui_ComponentCollection.prototype.handle = function(fn_name, data) {
    for(var i = 0; i < this.length(); i++) {
      var c = this.get(i);
      c[fn_name].call(c, data);
    }
  };

  pui.buildConfigObject = function(confString) {
    var confObj = {};

    if (confString != null) {
      pairs = confString.split(",");
      for(var i = 0; i < pairs.length; i++) {
        var kv = pairs[i].trim().split(":");
        confObj[kv[0].trim()] = kv[1].trim();
      }
    }
    return confObj;
  };

  pui.component = function(name, fn) {
    if(typeof fn === 'undefined') {
      //TODO fetch the named component instances
    } else {
      // register component
      pui.components[name] = fn;
    }
  };

  pui.componentize = function(name) {
    var os = pui.doc.by_attr('data-ui');
    for(var i = 0; i < os.length; i++) {
      var o = os[i];
      var attrv = o.doc.getAttribute('data-ui');
      var configv = o.doc.getAttribute("data-config");
      if(typeof name === 'undefined' || (name && attrv === name)) {
        var cfn = pui.components[attrv];

        if(cfn) {
          new pui_Component(cfn, o, attrv, configv);
        } else {
          //TODO handle no registered component found
          console.log('component not found: ' + attrv);
        }
      }
    };
  };

  pui.componentForDoc = function(doc) {
    for(var i=0; i < pui.registered_components.length; i++) {
      var c = pui.registered_components[i];
      if(doc === c.doc.doc) {
        return c;
      }
    }
  }

  pui.executeCallback = function(name) {
    for(var i=0; i < pui.registered_components.length(); i++) {
      if (name == pui.registered_components[i].name) {
        pui.registered_components[i].init();
      }
    }
  };

  pui.init = function() {
    pui.doc   = new pui_Doc(document);
    pui.view  = new pui_View(pui.doc);

    // connect
    pui.ws_connect();

    // componentize
    pui.componentize();
  };

  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      pui.init();
      clearInterval(readyStateCheckInterval);
    }
  }, 10);

  function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
  }
})();


// ext
if(!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(needle) {
    for(var i = 0; i < this.length; i++) {
      if(this[i] === needle) {
          return i;
      }
    }
    return -1;
  };
}
