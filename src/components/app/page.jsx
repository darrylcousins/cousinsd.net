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

import Account from "./account.jsx";
import Navigation from "./navigation.jsx";
import Credits from "./credits.jsx";
import BarLoader from "../lib/bar-loader.jsx";
import {
  LightModeIcon,
  DarkModeIcon,
  PreviewIcon,
} from "../lib/icons.jsx";
import {
  delay,
  animationOptions,
  animateFadeForAction,
} from "../helpers.jsx";

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
   * Text indicator - parsed html or plain markdown text?
   * @member {boolean} parsed
   */
  let parsed = true;

  /**
   * Source content either markdown or json strings
   * @member {string} source
   */
  let source = "";

  /**
   * Markdown content presented as <pre><code> block
   * Initialize as empty, populate on showSource, then retained
   * @member {string} source_html
   */
  let source_html = "";

  /**
   * Parsed markdown content
   * @member {string} html
   */
  let html = "";

  /**
   * Initialize pathname from location
   * @member {string} pathname
   */
  let pathname = window.location.pathname === "/" ? "/index" : window.location.pathname;

  /**
   * Page type: one of "markdown" or "json"
   * @member {string} pagetype
   */
  let pagetype = pathname === "/index" ? "json" : "markdown";

  /**
   * Promise fetching json mastodon account content
   * @method {Promise} pullAccount
   */
  const pullAccount = () => {
    fetch(`/scripts/index`, { // from ../../mastodon (scripts are nginx rewrite to folder)
      headers: {
        "Accept": "text/plain",
        "Cache-Control": "no-cache",
      },
      //mode: "no-cors",
    })
      .then((res) => {
        if (!res.ok) {
          console.log(`${res.status} (${res.statusText})`);
        };
        return res.text();
      })
      .then((text) => {
        source = JSON.parse(text);
      }).catch((e) => {
        console.warn(e);
      }).finally(async () => {
        // animate this
        loading = false;
        await this.refresh();
      });
  };

  /**
   * Promise fetching markdown content
   * @method {Promise} pullPage
   */
  const pullPage = (pathname) => {
    fetch(`${pathname}.md`, {
      headers: {
        "Accept": "text/markdown",
        "Cache-Control": "no-cache",
      }})
      .then((res) => {
        if (!res.ok) {
          throw new Error(`${res.status} (${res.statusText})`);
        }
        return res.text();
      }).then((text) => {
        const div = document.createElement("div");
        div.innerHTML = marked.parse(text).trim();
        // highlight code syntax - see also registerLanguage in main.jsx
        div.querySelectorAll("pre code").forEach((el) => {
          hljs.highlightElement(el);
        });
        html = div.innerHTML;
        // place 4 spaces at start of each line for nested code block
        source = text.split("\n").map(line => `    ${line}`).join("\n");
        parsed = true; // always start with parsed html
      }).catch((err) => {
        html = `
        <h1>${err.name} ${err.message}</h1>
        `;
      }).finally(async () => {
        // animate this
        loading = false;
        await this.refresh();
      });
  };

  /**
   * Replace parsed source with markdown text
   * @method {Promise} showSource
   *
   */
  const showSource = async () => {
    if (parsed) {
      //const t = hljs.highlightAuto(`${source}`).value
      const fence = "```";
      let title;
      let content_source = source;
      if (pagetype === "markdown") {
        title = "Markdown";
      } else {
        title = "JSON";
        content_source = JSON.stringify(source, null, 2);
      };
      const t = `
<h3>Showing ${title} Source For ${pathname}</h3>

${ `${ fence }${ title.toLowerCase() }` }
${ `${ content_source }` }
${ `${ fence }` }
  `;
      if (pagetype === "markdown") { // markdown highlighting uninspired
        source_html = marked.parse(t).trim();
      } else {
        const div = document.createElement("div");
        div.innerHTML = marked.parse(t).trim();
        // highlight code syntax - see also registerLanguage in main.jsx
        div.querySelectorAll("pre code").forEach((el) => {
          hljs.highlightElement(el);
        });
        source_html = div.innerHTML;
      };
    };
    parsed = !parsed;
    animateFadeForAction("page-content", () => this.refresh());
  };

  /**
   * Event listener - click loads new content and updates location
   * The ev.target is in Navigation
   */
  this.addEventListener("click", async (ev) => {
    if (typeof ev.target.dataset.page === "undefined") return; // ignore other clicks
    ev.preventDefault();

    pathname = ev.target.dataset.page;
    const pagetitle = ev.target.title;

    history.pushState("", "", pathname)

    // hide pushmenu
    document.querySelector("#menu-switch").checked = false;
    loading = true;
    await this.refresh();
    const content = document.querySelector("#page-content");
    const options = { ...animationOptions };
    let animate = content.animate({ opacity: 0.05 }, options);

    animate.addEventListener("finish", async () => {
      await delay(1000); // pretend network load
      if (pathname === "/index") {
        pagetype = "json";
        pullAccount();
      } else {
        pagetype = "markdown";
        pullPage(pathname);
      };
      options.duration = 5000;
      animate = content.animate({ opacity: 1 }, animationOptions);
    });

    ev.target.blur();
    
    // prevent href action on link
    return false;
  });

  const toggleMode = (value) => {
    mode = value;
    document.documentElement.classList.toggle("dark-mode", mode === "dark");
    const logo = document.querySelector("#boxes-logo");
    if (logo) {
      logo.classList.add(mode);
      logo.classList.remove(mode === "dark" ? "light" : "dark");
    };
    this.refresh();
  };

  // initialized with dark-mode
  document.documentElement.classList.toggle(`${mode}-mode`, true);

  if (pagetype === "markdown") {
    pullPage(pathname);
  } else {
    pullAccount();
  };

  while(true) {
    yield (
      <Fragment>
        <div class="cf w-100 db">
          <div onclick={ (e) => toggleMode(mode === "dark" ? "light" : "dark") }
            title={ `Switch to ${mode === "dark" ? "light" : "dark"} mode` }
            class="pointer dib fl">
            { mode === "dark" ? <LightModeIcon /> : <DarkModeIcon /> }
          </div>
          <div onclick={ (e) => showSource() }
            title={ `${parsed ? "Show" : "Hide" } content source` }
            class="pointer dib fl ml2">
            <PreviewIcon />
          </div>
          <div class="pointer dib mt2 mh2 fr">
            <a rel="me"
              href="https://mastodon.nz/@cousinsd"
              target="_blank" class="link outline-0 dim">
            <img src="/mastodon.png"
                title="https://mastodon.nz@cousinsd"
                class="outline-0"
                alt="Mastodon logo" />
            </a>
          </div>
          <Navigation pathname={ pathname } />
        </div>

        <div class="cf w-100 db">
          <div class="w-10 fl pa0 ma0"
            style="height: 25px;overflow: hidden">
            <a
              href="https://responsibleaidisclosure.com/"
              title="RAID: Responsible Ai Disclosure">
            <img src="/no-ai.png"
              class="outline-0"
              style="height: 25px;"
              height="25px"
              alt="RAID: Responsible Ai Disclosure" />
            </a>
          </div>
          <div class="w-90 fl pa0 ma0 tr"
            style="height: 25px;overflow: hidden">
            <a
              href="https://showyourstripes.info"
              title="ShowYourStripes">
            <img src="/stripes-global-trimmed.png"
              title="ShowYourStripes"
              class="outline-0"
              style="overflow: none"
              alt="ShowYourStripes" />
            </a>
          </div>
        </div>

        <div class="cf"></div>
        { loading ? <BarLoader /> : <div class="bar-placeholder"></div> }
        <div id="page-content" role="main" class={ `markdown-body ${mode}-mode` }>
          { parsed ? (
            pagetype === "markdown" ? (
              <Raw value={ html } />
            ) : (
              <Account json={ source } />
            )
          ) : (
            <Raw value={ source_html } />
          )}
        </div>
        <footer class="footer pb2 pt3 mt3 tr bt">
          Darryl Cousins
          <span class="ml1">&lt;
            <a class="link dim"
              href="mailto:cousinsd@cousinsd.net"
              title="cousinsd@cousinsd.net">
              cousinsd@cousinsd.net
            </a>&gt;
          </span>
        </footer>
        <Credits mode={ mode } />
      </Fragment>
    );
  };
};

export default Page;
