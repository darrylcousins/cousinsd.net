/**
 * Loading indicator component
 *
 * @module src/components/bar-loader
 * @exports {Element} BarLoader
 * @author Darryl Cousins <cousinsd@proton.me>
 */
import { createElement } from "@b9g/crank";

/**
 * Loader component
 *
 * @returns {Element} DOM component
 * @example
 * { loading && <BarLoader /> }
 */
const BarLoader = () => (
  <div class="progress-bar mt2">
    <span class="bar">
      <span class="progress" />
    </span>
  </div>
);

export default BarLoader;
