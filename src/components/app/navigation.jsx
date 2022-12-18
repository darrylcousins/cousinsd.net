/**
 * Load and render navigation
 *
 * @module src/components/app/navigation
 * @exports {Element} Navigation
 * @author Darryl Cousins <cousinsd@proton.me>
 */
import { createElement, Fragment } from "@b9g/crank";

import { MenuIcon } from "../lib/icon.jsx";

/**
 * Navigation component
 *
 * @returns {Element} DOM component
 * @example
 * { !loading && <Navigation /> }
 */
function *Navigation({ pathname }) {
  /**
   * Loading indicator
   * @member {boolean} loading
   */
  let loading = true;

  /**
   * Navigation json definition
   * @member {string} json
   */
  let navigation = [];

  /**
   * Promise fetching navigation json definition
   * @member {Promise} pull
   */
  const pull = fetch(`./navigation.json`, {headers: {'Accept': 'application/json'}})
    .then((res) => {
      if (!res.ok) {
        throw new Error(`${res.status} (${res.statusText})`);
      }
      return res.json();
    });

  pull.then((json) => {
    navigation = json.navigation;
  }).catch((err) => {
    console.log(err.message);
  }).finally(() => {
    // animate this
    loading = false;
    this.refresh();
  });

  for ({ pathname } of this) {
    yield (
      <Fragment>
        { !loading && navigation.length > 0 && (
          <Fragment>
            <input id="menu-switch" type="checkbox" />
            <nav id="pushmenu" role="navigation">
              <ul class="list">
                { navigation.map(el => (
                  <li class="mb2">
                    <a class="link dim"
                      style={ `color: ${pathname === el.link ? "orange" : "inherit"}` }
                      href={ el.link }
                      data-page={ el.link }
                      title={ el.description }>{ el.title }</a>
                  </li>
                ))}
              </ul>
            </nav>
            <div id="navigation">
              <label for="menu-switch" id="menu-toggle"><MenuIcon /></label>
              <nav id="menu" role="navigation">
                <ul>
                  { navigation.map(el => (
                    el.subnav ? (
                      <li class="dropdown">
                        <a class="dropbtn link dim dib tc ph2 pv2 pointer">{ el.title }</a>
                        <div class="dropdown-content mt2">
                          { el.subnav.map(sub => (
                            <a class="link dim" href={ el.link }
                              data-page={ sub.link } title={ sub.description }>
                              { sub.title }
                            </a>
                          ))}
                        </div>
                      </li>
                    ) : (
                      <li>
                        <a class="link dim dib tc ph2 pv2"
                          style={ `color: ${pathname === el.link ? "orange" : "inherit"}` }
                          href={ el.link }
                          data-page={ el.link }
                          title={ el.description }>{ el.title }</a>
                      </li>
                    )
                  ))}
                </ul>
              </nav>
            </div>
          </Fragment>
        )}
      </Fragment>
    );
  };
};

export default Navigation;
