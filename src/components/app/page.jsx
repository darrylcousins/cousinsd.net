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
} from "../lib/icon.jsx";
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

  const imageEvents = () => {
    // add event listener for expanding image to all markdown content images if screen size large
    const content = document.querySelector("#page-content");
    const app = document.querySelector("#app");
    if (window.innerWidth <= 480) { // mw7 40em
      content.querySelectorAll("img").forEach((el) => {
        el.removeEventListener("click", showImage);
        el.classList.remove("pointer");
      });
    } else {
      content.querySelectorAll("img").forEach((el) => {
        el.addEventListener("click", showImage);
        el.classList.add("pointer");
      });
    };
  };

  window.addEventListener("resize", imageEvents);

  const showImage = (ev) => {
    document.querySelector("#overlayImage").setAttribute("src", ev.target.src);
    document.querySelector("#overlay").classList.remove("dn");
    document.querySelector("#overlay").classList.add("aspect-ratio--object", "db", "fixed");
    document.querySelector("#overlayContent").classList.remove("dn");
    document.querySelector("#overlayContent").classList.add("db");
  };

  const hideImage = (ev) => {
    document.querySelector("#overlayImage").setAttribute("src", "");
    document.querySelector("#overlay").classList.add("dn");
    document.querySelector("#overlay").classList.remove("aspect-ratio--object", "db");
    document.querySelector("#overlayContent").classList.remove("db");
    document.querySelector("#overlayContent").classList.add("dn");
  };

  document.documentElement.addEventListener("keyup", (ev) => {
    if (ev.key === "Escape") { // escape key maps to keycode `27`
      hideImage();
    }
  });

  /**
   * Promise fetching json mastodon account content
   * @method {Promise} pullAccount
   */
  const pullAccount = () => {
    fetch(`./mastodon/index`, {
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
        console.log(e);
      }).finally(async () => {
        // animate this
        loading = false;
        await this.refresh();
        //imageEvents();
      });
  };

  /**
   * Promise fetching markdown content
   * @method {Promise} pullPage
   */
  const pullPage = (pathname) => {
    fetch(`.${pathname}.md`, {
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
        <h1>${err.message}</h1>
        `;
      }).finally(async () => {
        // animate this
        loading = false;
        await this.refresh();
        imageEvents();
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
        <div id="overlay" class="dn"></div>
        <div id="overlayContent" class="fixed dn h-100 w-100 tl">
          <img id="overlayImage" src="" alt=""
            onclick={ hideImage }
            class="ba bw1 br2 b--white b--solid pointer" />
        </div>
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
            <img src="mastodon.png"
              title="https://mastodon.nz@cousinsd.net"
              class="outline-0"
              alt="Mastodon logo" />
          </a>
        </div>
        <Navigation pathname={ pathname } />
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
              href="mailto:cousinsd@proton.me"
              title="cousinsd@proton.me">
              cousinsd@proton.me
            </a>&gt;
          </span>
        </footer>
        <Credits mode={ mode } />
      </Fragment>
    );
  };
};

export default Page;
