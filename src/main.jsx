/**
 * Entry point
 *
 * @module src/main.jsx
 * @exports {Element} Home
 * @author Darryl Cousins <cousinsd@proton.me>
 */
import { createElement, Fragment, Raw } from "@b9g/crank";
import { renderer } from "@b9g/crank/dom";
import { marked } from "marked";

import "./style.scss";

import BarLoader from "./components/bar-loader.jsx";

function *Home() {
  /**
   * Loading indicator
   * @member {boolean} loading
   */
  let loading = true;

  /**
   * Parsed markdown content
   * @member {string} html
   */
  let html = "";

  const pull = fetch("./index.md", {headers: {'Accept': 'text/markdown'}})
    .then((res) => {
      if (!res.ok) throw new Error(`${res.statusText} (${res.status})`);
      return res.text();
    });
  /*
  pull.then((text) => set(marked(text)))
    .catch((err) => set(`<code class="error">Failed to load ${FILENAME}: ${err.message}</code>`))
  */

  pull.then((text) => {
    html = marked.parse(text);
    // animate this
    loading = false;
    this.refresh();
  }).catch((err) => console.log(err.message));

  while(true) {
    yield (
      <Fragment>
        { loading && <BarLoader /> }
        <Raw value={ html } />
      </Fragment>
    );
  };
};

renderer.render(
  <Home />
, document.querySelector("#app"));
