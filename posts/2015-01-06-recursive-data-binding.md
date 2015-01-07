---
title: "Recursive data binding with pakyow-bindr"
time: 9:45pm CST
---

A tiny library was just released that adds recursive data binding to Pakyow. It's called pakyow-bindr, and it adds two new methods to `Presenter::View` and `Presenter::ViewCollection`. These recursive binding methods are useful when you have a view with nested scopes and you want to apply data to it all at once.

For example, given this view:

    html:
    <div data-scope="post">
      <p data-prop="body"></p>
  
      <div data-scopes="comment">
        <p data-prop="body"></p>
      </div>
    </div>

You can apply data that contains values for both posts and their comments:

    ruby:
    data = [
      {
        body: 'this is post 1',
    
        comment: [
          {
            body: 'this is comment 1 for post 1'
          }
        ]
      },
  
      {
        body: 'this is post 2',
    
        comment: [
          {
            body: 'this is comment 1 for post 2'
          },
          {
            body: 'this is comment 2 for post 2'
          }
        ]
      }
    ]

    view.scope(:post).applyr(data)
    
Resulting in the following rendered view:

    html:
    <div data-scope="post">
      <p data-prop="body">
        this is post 1
      </p>
  
      <div data-scopes="comment">
        <p data-prop="body">
          this is comment 1 for post 1
        </p>
      </div>
    </div>

    <div data-scope="post">
      <p data-prop="body">
        this is post 2
      </p>
  
      <div data-scopes="comment">
        <p data-prop="body">
          this is comment 1 for post 2
        </p>
      </div>
  
      <div data-scopes="comment">
        <p data-prop="body">
          this is comment 2 for post 2
        </p>
      </div>
    </div>

As usual, the code is available on [GitHub](https://github.com/pakyow/pakyow-bindr). Have fun!

[bryanp](http://twitter.com/bryanp)
