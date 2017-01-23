Squarespace Controller
------------------------------

Controller is a lightweight control assigner for DOM elements. Controller binds functions to elements, and does the management work of making sure they are relevant, handling lifecycle after asynchronous content load.

*NOTICE: This code is licensed to you pursuant to Squarespace’s Developer Terms of Use. See license section below.*

## Basic Usage:

A controller function is associated with a string through the method `register`. The string can then be set as the `data-controller` attribute of an element in the DOM, in order to bind the controller to the element.

Inside the controller function, the DOM element is passed in as an argument.

**HTML**

```html
<div data-controller="MyController"></div>
```

**JavaScript**

```js
import controller from '@squarespace/controller';

function MyController(element) {
  const handleClick = () => {
    element.toggleClass('clicked');
  };
  element.addEventListener('click', handleClick);
}

controller.register('MyController', MyController);
```

## Advanced Usage

### Ajax

Controller also exports a method `refresh`. If you use Ajax loading on your site, `refresh` should be called whenever an asynchronous load occurs.

Controller functions can return an object with `sync` and `destroy` methods. When `refresh` is called, the Controller manager will take stock of DOM elements, run `destroy` on any elements that no longer exist on the page, run `sync` on elements that remain on the page, and run the controller function for elements that are newly added to the page.

#### Ajax Example

**HTML**

```html
<div data-controller="MyController"></div>
```

**JavaScript**

```js
const controller = require('@squarespace/controller');

function MyController(element) {
  const handleClick = () => {
    element.toggleClass('clicked');
  };
  element.addEventListener('click', handleClick);
  return {
    sync: () => {
      element.removeClass('clicked');
    },
    destroy: () => {
      element.removeEventListener('click', handleClick);
    }
  };
}

controller.register('MyController', MyController);

// Assuming this event is dispatched on ajax load
window.addEventListener('ajax:load', controller.refresh);
```

### Using ES6

If you prefer to handle transpiling and polyfilling on your own, you can import ES6 from Controller:

```js
import controller from '@squarespace/controller/src';
```

Alternately, Controller specifies a `module` property in `package.json` that points to the uncompiled `src/index.js`, so you may be able to simply import `@squarespace/controller` if you're using one of the following bundlers:
* [Webpack 2](https://webpack.js.org/configuration/resolve/#resolve-mainfields)
* [Rollup](https://github.com/rollup/rollup-plugin-node-resolve#rollup-plugin-node-resolve)


## Reference

### register(name, controller)
Register a function to a given name string, so that setting `data-controller` attribute to that string will bind that element to the controller function.

**Params**
* name `string`
* controller `function`

### refresh()
Refresh all controllers. To be called after the DOM has been mutated.

## License

Portions Copyright © 2016 Squarespace, Inc. This code is licensed to you pursuant to Squarespace’s Developer Terms of Use, available at http://developers.squarespace.com/developer-terms-of-use (the “Developer Terms”). You may only use this code on websites hosted by Squarespace, and in compliance with the Developer Terms. TO THE FULLEST EXTENT PERMITTED BY LAW, SQUARESPACE PROVIDES ITS CODE TO YOU ON AN “AS IS” BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.