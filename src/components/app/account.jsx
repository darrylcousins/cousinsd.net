/**
 * Load and render mastodon account
 *
 * @module src/components/app/credits
 * @exports {Element} Credits
 * @author Darryl Cousins <cousinsd@proton.me>
 */
import { createElement, Fragment, Raw } from "@b9g/crank";
import {
  ClearAllIcon,
  DescriptionOutlinedIcon,
} from "../lib/icons.jsx";

/**
 * Credits component
 *
 * @returns {Element} DOM component
 * @example
 * { <Credits /> }
 */
function *Account({ json }) {

  /**
   * Hold visibility state of a status image
   *
   * @member {boolean} visible // probably an object image.src
   */
  let visible = {};

  /**
   * Infinite scrolling
   * @member {boolean} endless
   */
  const endless = {
    proceed: true,
    hasMore: true,
  };

  /**
   * Loading indicator
   * @member {boolean} loading
   */
  let loading = true;

  /**
   * Source, json statuses
   * @member {string} statuses
   */
  let statuses = [];

  /**
   * Pagination
   * @member {integer} limit
   */
  let limit = 15;

  /**
   * Pagination, unused for now
   * @member {integer} min_id
   */
  let min_id = 1;

  /**
   * Pagination, incremented to oldest of current selection
   * @member {integer} max_id
   */
  let max_id = 999999999999999999;
  //let max_id = 109547250004896640;

  /**
   * Filters
   * @member {boolean} exclude_replies
   */
  let exclude_replies = 1;

  /**
   * Filters
   * @member {boolean} exclude_reblogs
   */
  let exclude_reblogs = 1;

  /**
   * Thread sorted list of statuses
   * @member {array} final_statuses
   */
  let final_statuses = [];

  const imageEvents = () => {
    // add event listener for expanding image to all markdown content images if screen size large
    const content = document.querySelector("#page-content");
    const app = document.querySelector("#app");
    if (window.innerWidth <= 480) { // mw7 40em
      content.querySelectorAll("div.cover").forEach((el) => {
        el.removeEventListener("click", showImage);
        el.classList.remove("pointer");
      });
    } else {
      content.querySelectorAll("div.cover").forEach((el) => {
        el.addEventListener("click", showImage);
        el.classList.add("pointer");
      });
    };
  };

  window.addEventListener("resize", imageEvents);

  const showImage = (ev) => {
    console.log(ev.target.getAttribute("data-src"));
    document.querySelector("#overlayImage").setAttribute("src", ev.target.getAttribute("data-src"));
    document.querySelector("#overlayImage").setAttribute("title", "Close");
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
  const pullStatuses = () => {
    const endpoint = "statuses";
    const qs = new URLSearchParams({
      endpoint,
      limit,
      max_id,
      exclude_replies,
      exclude_reblogs,
    });;
    fetch(`./scripts/index?${ qs.toString() }`, {
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
        //console.log(res);
        return res.text();
      })
      .then((text) => {
        statuses = JSON.parse(text);
        //console.log(JSON.stringify(statuses[0], null, 2));
        max_id = statuses.at(-1).id // last popped of the list
        // unused, keeping for debugging
        let page_count = Math.ceil(json.statuses_count/limit);

        const trimStatus = (status) => {
          // just get what is required
          const copy = {};
          copy.id = status.id;
          copy.created = new Date(Date.parse(status.created_at));
          copy.media_attachments = status.media_attachments;
          copy.content = status.content;
          copy.card = status.card;
          copy.children = []; // child statuses in thread
          copy.child_ids = []; // child status id in thread
          return copy;
        };

        const findAndPushChild = (el, list) => {
          if (el.in_reply_to_id && ids.includes(el.in_reply_to_id)) {
            const parent = list.find(s => s.id === el.in_reply_to_id);
            if (parent) {
              parent.children.push(trimStatus(el));
              parent.child_ids.push(el.id);
              return true;
            };
            const child_parent = list.find(s => s.child_ids.includes(el.in_reply_to_id));
            if (child_parent) {
              child_parent.children.push(trimStatus(el));
              child_parent.child_ids.push(el.id);
              return true;
            };
          };
          return false;
        };

        // create tidy threads by collecting under the root id
        // best in the future to only reply to my initial toot #1
        const ids = statuses.map(el => el.id);
        //final_statuses = final_statuses.reverse();
        const tempList = [];
        statuses.reverse().forEach(el => {
          // when child found try already loaded statuses first
          if (findAndPushChild(el, final_statuses)) return;
          if (findAndPushChild(el, tempList)) return;
          tempList.push(trimStatus(el));
        });
        tempList.reverse();
        final_statuses = final_statuses.concat(tempList);
        //final_statuses = final_statuses.reverse();
        //console.log(JSON.stringify(final_statuses[0], null, 2));
      }).catch((e) => {
        console.log(e);
      }).finally(async () => {
        // animate this
        loading = false;
        endless.proceed = true;
        if (statuses.length < limit) endless.hasMore = false;
        await this.refresh();
        imageEvents();
      });
  };

  // load data
  const load = () => {
    if (endless.proceed && endless.hasMore) {
      endless.proceed = false;
      pullStatuses();
    };
  };

  // initialize endless loader
  const init = () => {
    document.addEventListener("scroll", (e) => {
      const lastDiv = document.querySelector("#page-content > div.status-post:last-child");
      if (lastDiv) {
        const lastDivOffset = lastDiv.offsetTop + lastDiv.clientHeight;
        const pageOffset = window.pageYOffset + window.innerHeight;
        if(pageOffset > lastDivOffset - 20) {
          load();
        };
      };
    });
    load();
  };

  init();

  const Status = ({ status, isChild }) => {
    let wrapper_class = "status-post w-100";
    let wrapper_style = "";
    let inner_class = "pr4";
    if (isChild) {
      wrapper_class = `${ wrapper_class } ml3`;
      wrapper_style = "border-right: 0;";
    } else {
      inner_class = `${ inner_class } pb4`;
    };
    // <img src={ preview_url } title={ description } />
    return (
      <Fragment>
        <div id="overlay" class="dn"></div>
        <div id="overlayContent" class="fixed dn h-100 w-100 tl">
          <img id="overlayImage" src="" alt=""
            onclick={ hideImage }
            class="ba bw1 br2 b--white b--solid pointer" />
        </div>
        <div class={ wrapper_class } style={ wrapper_style }>
          <div class="pl4 pb4 pt3">
            <div class={ inner_class }>
              <div class="pb2 fw3 f3">
                { status.created.toDateString() } { " " }
                { `${ status.created.getHours() }`.padStart(2, "0") }
                :{ `${ status.created.getMinutes() }`.padStart(2, "0") }
              </div>
              <Raw value={ status.content } />
              { status.media_attachments.length > 0 && (
                <Fragment>
                  { status.media_attachments.map(({preview_url, description}) => (
                    <div style="padding: 1px" class="w-100 w-50-ns fl">
                      <div style={`background-image: url(${
                        preview_url });background-repeat:no-repeat`} 
                        class="cover h5 br1 br3-ns"
                        data-src={preview_url}
                        title={ description }
                      />
                    </div>
                  ))}
                  <div class="cf" />
                </Fragment>
              )}
              { status.card && (
                  <a href={ status.card.url } class="status-post-card w-100 ba flex h-3 br2 link"
                    style="color:inherit;border-color:#313543"
                    target="_blank" rel="noopener noreferrer">
                    { status.card.image ? (
                      <img src={ status.card.image } />
                    ) : (
                      <div class="pa3 br" style="color:inherit;border-color:#313543">
                        <DescriptionOutlinedIcon />
                      </div>
                    )}
                    <div class="status-post-link dib v-mid w-100 center pa2">
                      { status.card.title }
                    </div>
                  </a>
              )}
            </div>
            { status.children.length > 0 && (
              <div class="horizontal-rule nl4" />
            )}
            { status.children.length > 0 && (
              status.children.map((el, idx, arr) => (
                <Fragment>
                  <div class="flex">
                    <div class="o-20 flip-horizontally">
                      <ClearAllIcon />
                    </div>
                    <Status status={ el } isChild={ true } /> 
                  </div>
                  { idx < (arr.length - 1) && <div class="horizontal-rule nl4" /> }
                </Fragment>
              ))
            )}
            { !isChild && (
              <div class="horizontal-rule nl4" />
            )}
          </div>
        </div>
      </Fragment>
    );
  }
  for ({ json } of this) {
    yield (
      <Fragment>
        <h1>{ `Darryl Cousins` } @{ `cousinsd` }</h1>
        { false && (
          <div class="b">
            <Raw value={ json.note } />
          </div>
        )}
        <div class="horizontal-rule" />
        { !loading && final_statuses.map(el => <Status status={ el } /> )}
      </Fragment>
    );
  };
};

export default Account;


