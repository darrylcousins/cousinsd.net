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
import markdown from "highlight.js/lib/languages/markdown";
import json from "highlight.js/lib/languages/json";

import "./style.scss";

import Page from "./components/app/page.jsx";

document.addEventListener("DOMContentLoaded", async () => {
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('markdown', markdown);
  hljs.registerLanguage('json', json);
  await renderer.render(
    <Fragment>
      <Page />
    </Fragment>
  , document.querySelector("#app"));
});
