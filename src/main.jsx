/**
 * Entry point
 *
 * @module src/main.jsx
 * @exports {Element} Home
 * @author Darryl Cousins <cousinsd@proton.me>
 */
import { createElement, Fragment } from "@b9g/crank";
import { renderer } from "@b9g/crank/dom";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";

import "./style.scss";

import Page from "./components/app/page.jsx";
import { CopyrightIcon } from "./components/lib/icon.jsx";

document.addEventListener("DOMContentLoaded", async () => {
  hljs.registerLanguage('javascript', javascript);
  await renderer.render(
    <Fragment>
      <Page />
      <footer class="footer ml2 mb3 pt3 tr bt">
        <CopyrightIcon /> <span>Darryl Cousins
        </span>
      </footer>
    </Fragment>
  , document.querySelector("#app"));
});
