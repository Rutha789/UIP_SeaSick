# UIP-Drunken-Sailor

Running this requires you to host a server (e.g. with MAMP) with the folder this readme
is located in as document root.
Access `localhost/index.html` to access the welcome screen.

## Completion:
* Welcome and user selection screens are implemented
* Customer page is fully implemented with the exception of the Food fatabase
    You can log in using the user button at top-right. Any username from DBLoaded.js
    (such as `jorass`) is accepted.
    Items from the menu can be dragged-and-dropped into the order bar at the bottom.
    Right button on the bar takes you to the payment screen. Left button clears the bar.
* Management page is fully implemented with the exception of the Food database
    Main functionality is to edit item's physical stock using the info pop-ups,
    and mark items to be refilled by drag-and-dropping into the bar at the bottom.
* Staff page has a very basic implementation:
    Orders made by customers are displayed in the sidebar and can be focused.
    Focused orders can be "completed" or "cancelled", which affects the stock.
    No staff accounts nor manipulation of orders.
    The html/css is not as polished as with the customer and management pages.
   
## Particular issues
* Language selection not available on welcome, selection, or staff screens.
* Some localized strings for other languages than swedish and english are missing
* When the info pop-up of an item is displayed, the attribute keys are not
    translated.
* Staff page does not support undo/redo, nor any translation
* There only scenario where you can return to the welcome screen without
    typing the URL/using back button is when you have made an order as a customer.
