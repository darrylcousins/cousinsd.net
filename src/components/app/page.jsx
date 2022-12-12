/**
 * Load and render page from markdown source
 *
 * @module src/components/app/page
 * @exports {Element} Page
 * @author Darryl Cousins <cousinsd@proton.me>
 */
import { createElement, Fragment, Raw } from "@b9g/crank";
import { marked } from "marked";
import hljs from "highlight.js/lib/core";

import Navigation from "./navigation.jsx";
import Credits from "./credits.jsx";
import BarLoader from "../lib/bar-loader.jsx";
import { LightModeIcon, DarkModeIcon } from "../lib/icon.jsx";
import { delay, animationOptions } from "../helpers.jsx";

/**
 * Page component
 *
 * @returns {Element} DOM component
 * @example
 * { !loading && <Navigation /> }
 */
function *Page() {
  /**
   * Loading indicator
   * @member {boolean} loading
   */
  let loading = true;

  /**
   * Mode indicator - light or dark, initialize with user preference?
   * @member {boolean} mode
   */
  //let mode = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  let mode = "dark";

  /**
   * Parsed markdown content
   * @member {string} html
   */
  let html = "";

  /*
  const pull = fetch(`.${pathname}.md`, {headers: {'Accept': 'text/markdown'}})
    .then((res) => {
      if (!res.ok) {
        throw new Error(`${res.status} (${res.statusText})`);
      }
      return res.text();
    });
    */

  /**
   * Promise fetching markdown content
   * @method {Promise} pullPage
   */
  const pullPage = (pathname) => {
    fetch(`.${pathname}.md`, {headers: {'Accept': 'text/markdown'}})
      .then((res) => {
        if (!res.ok) {
          throw new Error(`${res.status} (${res.statusText})`);
        }
        return res.text();
      }).then((text) => {
        const parsed = marked.parse(text);
        const div = document.createElement('div');
        div.innerHTML = parsed.trim();
        div.querySelectorAll('pre code').forEach((el) => {
          hljs.highlightElement(el);
        });
        html = div.innerHTML;
      }).catch((err) => {
        html = `
        <h1>${err.message}</h1>
        `;
      }).finally(() => {
        // animate this
        loading = false;
        this.refresh();
      });
  };

  /**
   * Event listener - click loads new content and updates location
   */
  this.addEventListener("click", async (ev) => {
    if (typeof ev.target.dataset.page === "undefined") return; // ignore other clicks
    ev.preventDefault();

    pathname = ev.target.dataset.page;
    const pagetitle = ev.target.title;
    const state = { additionalInformation: 'Updated the URL from navigation' };
    window.history.pushState(state, pagetitle, pathname);

    loading = true;
    this.refresh();
    const markdown = document.querySelector("#page-content");
    const options = { ...animationOptions };
    let animate = markdown.animate({ opacity: 0.05 }, options);

    animate.addEventListener("finish", async () => {
      //await delay(1000); // pretend network load
      pullPage(pathname);
      options.duration = 5000;
      animate = markdown.animate({ opacity: 1 }, animationOptions);
    });

    ev.target.blur();
    
    // prevent href action on link
    return false;
  });

  let pathname = window.location.pathname === "/" ? "/index" : window.location.pathname;
  pullPage(pathname);


  const toggleMode = (value) => {
    mode = value;
    document.documentElement.classList.toggle("dark-mode", mode === "dark");
    this.refresh();
  };

  // initialized with dark-mode
  document.documentElement.classList.toggle(`${mode}-mode`, true);

  while(true) {
    yield (
      <Fragment>
        { loading ? <BarLoader /> : <div class="bar-placeholder"></div> }
        <div onclick={ (e) => toggleMode(mode === "dark" ? "light" : "dark") } class="pointer dib fl ml2">
          { mode === "dark" ? <DarkModeIcon /> : <LightModeIcon /> }
        </div>
        <Navigation pathname={ pathname } />
        <div class="cf"></div>
        <div id="page-content" class={ `markdown-body ${mode}-mode` }>
          <Raw value={ html } />
        </div>
        <Credits mode={ mode } />
      </Fragment>
    );
  };
};


export default Page;


