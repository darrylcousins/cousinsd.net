Inbox checks
------------

Some more ideas here: https://blog.joinmastodon.org/2018/07/how-to-make-friends-and-verify-requests/ e.g. check date and digest

Child process
-------------

https://www.freecodecamp.org/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/

If the unref function is called on the detached process, the parent process can exit independently of the child.

My thinking is to use this so I can return 200 OK on receipt into inbox and
then do the security checks and POST response from child process.

Status Header
-------------

This is C++ but shows how to return a status header from cgi script:

    cout << "Status: 404\r\n"
         << "Content-type: text/html\r\n"
         << "\r\n"
         << "<html><body>Not Found</body></html>\n";

Console.log vs process.stdout
-----------------------------

A newline is required between headers and content. I was struggling for a while
when I switched to piping a stream to stdout because console.log was adding
this newline but I needed to manually ensure it was there. Duh.

Running test mode
-----------------

Request uri at the very least required:

```
REQUEST_URI='somedomain/test' node index.js
```

VM
--

For running in a sandbox?

Blocklists
----------

Take a look at blocklists for filtering posts and replies. E.g. (which also
includes links to other blocklists):

https://github.com/gardenfence/blocklist/tree/main
