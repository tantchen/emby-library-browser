# Emby Library Browser

This project collects all video items from your emby-server API and shows it in a table.
Here you can filter and sort the elements according to various properties 
e.g. (resolution, codecs, age, release-date, ...) and select them to delete.
In addition, the tool loads all views of all Emby users and calculates a percentage of the view status. 
When you click an item, a pop-up appears with more details.

Why:
* Sometimes it is difficult to decide which content can be deleted.
* The emby-webinterface is not designed to filter and delete items.
* You can ask users what they are looking at, but it is better and easier to see.

### Features
* Sort and filter items by: Type, Resolution, Language, Last Played, Ratings, Age, Release Year, Size, Audio and Video Codec
* Show/Hide columns
* Show duplicate items
* Bulk delete selected items

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/tantchen/emby-library-browser.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Build and start
   ```sh
   npm start

### Built With

* [Angular 10](https://angular.io)
* [Bootstrap](https://getbootstrap.com)
* [Ngx-Bootstrap](https://valor-software.com/ngx-bootstrap/#/)


## License

Distributed under the MIT License. See `LICENSE` for more information.

![Login](screens/login.png?raw=true)
![Filters](screens/filters.png?raw=true)
![Delete](screens/filters.png?raw=true)
