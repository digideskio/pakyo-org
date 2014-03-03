Break the main page into the following sections:

  - Hook
  - Main Points
  - Walkthrough (possibly move to another page)

The hook is basically what we have now. Main points should be the key features/differences of Pakyow. Walkthrough demonstrates the main points in simple terms (it isn't a tutorial, but could have an example app at the end).

Hook:

Pakyow is an open-source framework for building performant web apps that embrace the web. Separation of view, logic, and data is maintained, encouraging a development process that is straightforward and friendly to designers and developers. It's simple.






Native Views: Views are data-driven, making them logicless. 

Composability: 

Embrace The Web: Views are rendered server-side and sent to the client in the response.

- 0.9

Embrace The Web: Application logic stays server-side, views are rendered in the response (respects request/response lifecycle), multiple pages.

No Partial Load: The data and view are always seen together. No flicker.

Embrace The Web (+): Data changes are pushed to the client as instructions that update the view. No application logic is moved to the client.
  Reword first sentence above and move some to "Live Views"

Live Views: Views update automatically as data changes.

Auto Cache: Views are automatically cached and rebuilt as data changes.

UI Control: Add hooks to your UI code and control it from the server.
