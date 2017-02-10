/**
 * Cached object containing controller functions indexed by registered name string.
 *
 * @name CONTROLLERS_BY_NAME
 * @type {Object}
 */
const CONTROLLERS_BY_NAME = {};


/**
 * Cached array of live controllers.
 *
 * @name _liveControllers
 * @type {Array}
 */
let _liveControllers = [];

/**
 * Given a controller object, run its function with its element as the context
 * and first parameter, and return whatever the result of the function call is
 * (lifecycle methods).
 *
 * @method process
 * @param {Object} controller   Controller object to process, incl. fn and element
 * @return {*}                  Result of function call
 */
function process(controller) {
  if (!controller.fn || !controller.element) {
    return null;
  }
  return controller.fn(controller.element);
}

/**
 * Compare two controller objects and returns whether they are equal.
 *
 * @method isEqualController
 */
function isEqualController(a, b) {
  if (!a.element || !b.element || !a.fn || !b.fn) {
    return false;
  }
  return a.element === b.element && a.fn === b.fn;
}

/**
 * Registers a controller with a given name and function body.
 *
 * @method register
 * @param {String} name           String to register controller fn to
 * @param {Function} controller   Controller fn to register
 */
export function register(name, controller) {
  CONTROLLERS_BY_NAME[name] = controller;
}

/**
 * Sychronize all controllers. Process new controllers, destroy controllers
 * whose elements are no longer on the DOM, and sync others.
 *
 * @method refresh
 */
export function refresh() {

  // Get all nodes with controllers and convert to array
  const nodesWithControllers = Array.from(document.querySelectorAll('[data-controller]'));

  // Create array to house new controller objects
  let newControllers = [];

  // Convert found nodes to controller objects
  // so we can do comparisons later
  nodesWithControllers.forEach((node) => {

    // Get controller names on node
    const controllerNames = node.getAttribute('data-controller').split(',');

    // Loop
    controllerNames.forEach((controllerName) => {

      controllerName = controllerName.trim();

      const controller = CONTROLLERS_BY_NAME[controllerName];

      if (!controller) {
        return;
      }

      // Add to new controller array
      newControllers.push({
        namespace: controllerName,
        element: node,
        fn: controller
      });

    });

  });

  // Loop through live controllers and find ones that need to be destroyed
  // or synced
  _liveControllers = _liveControllers.filter((liveController) => {

    // Boolean to indicate whether one of new controllers matches current
    // live controller.
    const isControllerActive = newControllers.some((newController) => {
      return isEqualController(liveController, newController);
    });

    if (isControllerActive) {

      // Controller element is still in the DOM, run sync method of controller.
      if (liveController.methods && liveController.methods.sync) {
        liveController.methods.sync.apply(liveController.element, null);
      }

      // Remove existing controllers from new controllers array, so they are not
      // reinitialized.
      newControllers = newControllers.filter((newController) => {
        return !isEqualController(liveController, newController);
      });

    } else {

      // Controller element is no longer in the DOM, call destructor method of
      // controller.
      if (liveController.methods && liveController.methods.destroy) {
        liveController.methods.destroy.apply(liveController.element, null);
      }

    }
    return isControllerActive;
  });


  // Process new controllers for the first time
  newControllers.forEach((controller) => {

    controller.methods = process(controller);
    _liveControllers.push(controller);

    // Add controller bound info
    let boundControllersName = [];
    if (controller.element.hasAttribute('data-controllers-bound')) {
      const existingControllers = controller.element.getAttribute('data-controllers-bound').split(', ');
      boundControllersName = boundControllersName.concat(existingControllers);
    }

    boundControllersName.push(controller.namespace);

    controller.element.setAttribute('data-controllers-bound', boundControllersName.join(', '));

  });

}

if (['interactive', 'complete'].includes(document.readyState)) {
  refresh();
} else {
  document.addEventListener('DOMContentLoaded', refresh);
}

export default {
  register,
  refresh
};