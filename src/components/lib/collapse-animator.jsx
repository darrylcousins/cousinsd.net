/**
 * Wrap a component to response to signal to animate collapse
 *
 * @module app/components/collapse-animator
 * @exports CollapseAnimator
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@b9g/crank";
import { collapseElement, transitionElementHeight, sleepUntil } from "../helpers";

/**
 * Wrap a crank Component and animate collapse
 *
 * @function AnimateCollapseWrapper
 * @returns {Function} Return the wrapped component
 * @param {object} Component The component to be wrapped
 * @param {object} options Options for form and modal
 */
function CollapseWrapper(Component) {

  /**
   * Wrap a crank Component and provide animation functionality
   *
   * @function Wrapper
   * @yields {Element} Return the wrapped component
   * @param {object} props Property object
   */
  return async function* ({id, collapsed, ...props}) {

    const fixCollapse = () => {
      const el= document.querySelector(`#${id}`);
      transitionElementHeight(el);
    };

    window.addEventListener('resize', fixCollapse);

    // send this event to resize wrapper (e.g. box-rules-form.js)
    this.addEventListener('collapse.wrapper.resize', fixCollapse);

    for await (const {id, collapsed: newCollapsed, ...props} of this) {

      const startCollapsed = (collapsed === newCollapsed) && collapsed;
      const el = yield (
        <div
          id={id}
          class={`collapsible ${startCollapsed ? "collapsed" : ""}`}
        >
          <Component
            id={ id }
            {...props}
          />
        </div>
      );

      // wait until the element has rendered, note that this fails if component
      // is async generator and I don't know how to fix it
      // XXX NB beware id's that begin with an integer!!
      //await sleepUntil(() => document.querySelector(`#${el.id}`), 1000);
      await sleepUntil(() => document.querySelector(`#${id}`), 1000);

      const element = document.querySelector(`#${id}`);
      if (element) {
        if (newCollapsed) {
          collapseElement(element);
        } else {
          transitionElementHeight(element);
        }
        //element.scrollIntoView({ behavior: "smooth" });
      }

      collapsed = newCollapsed;

    }
  };
}

export default CollapseWrapper;
