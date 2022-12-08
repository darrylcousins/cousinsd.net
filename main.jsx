import { createElement, Fragment } from "@b9g/crank";
import { renderer } from "@b9g/crank/dom";

import "./style.css";

renderer.render(
  <Fragment>
    <div id="hello">Hello world</div>
    <div>
      <a href="mailto:cousinsd@proton.me">cousinsd@proton.me</a>
    </div>
  </Fragment>
, document.querySelector("#app"));
