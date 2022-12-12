/**
 * Load and render credits
 *
 * @module src/components/app/credits
 * @exports {Element} Credits
 * @author Darryl Cousins <cousinsd@proton.me>
 */
import { createElement, Fragment, Raw } from "@b9g/crank";
import { marked } from "marked";

import CollapseWrapper from "../lib/collapse-animator";
import { DoubleArrowDownIcon } from "../lib/icon.jsx";
import { DoubleArrowUpIcon } from "../lib/icon.jsx";

/**
 * Credits component
 *
 * @returns {Element} DOM component
 * @example
 * { <Credits /> }
 */
function *Credits({ mode }) {

  /**
   * Parsed markdown content
   * @member {string} html
   */
  let html = "";

  /**
   * Collapse content boolean
   * @member {string} collapsed
   */
  let collapsed = true;

  /**
   * Loading content boolean
   * @member {string} collapsed
   */
  let loading = true;

  /*
   * Control the collapse of the form
   * @function toggleCollapse
   */
  const toggleCollapse = () => {
    collapsed = !collapsed;
    this.refresh();
    /*
    if (document.getElementById("add-rule-button")) {
      animateFadeForAction("add-rule-button", async () => await this.refresh());
    } else if (document.getElementById("box-rules-add-form")) {
      animateFadeForAction("box-rules-add-form", async () => await this.refresh());
    } else {
      this.refresh();
    };
    */
  };

  const pullContent = () => {
    fetch("credits.md", {headers: {'Accept': 'text/markdown'}})
      .then((res) => {
        if (!res.ok) {
          throw new Error(`${res.status} (${res.statusText})`);
        }
        return res.text();
      }).then((text) => {
        html = marked.parse(text);
      }).catch((err) => {
        html = `
        <h1>${err.message}</h1>
        `;
      }).finally(() => {
        loading = false;
        this.refresh();
      });
  };

  pullContent();

  const Content = ({ html }) => {
    return (
      <div class={ `markdown-body pb4 ${mode}-mode` }>
        <Raw value={ html } />
      </div>
    );
  };

  const ContentWrapped = CollapseWrapper(Content);

  for ({ mode } of this) {
    yield (
      <Fragment>
        <div id="credits" class="footer mt3 mb3 ml2 pt1 bt">
          <div onclick={ (e) => toggleCollapse() } class="pointer w-100 dib mb3 pt1 flex">
            <div class="w-50 pt2 b">
              Website Credits
            </div>
            <div class="w-50 tr">
              { collapsed ? (
                <DoubleArrowDownIcon />
              ) : (
                <DoubleArrowUpIcon />
              )}
            </div>
          </div>
        </div>
        <div>
          { !loading && (
            <ContentWrapped
              id="credit-content"
              collapsed={ collapsed }
              html={ html }
            />
          )}
        </div>
      </Fragment>
    );
  };
};

export default Credits;

