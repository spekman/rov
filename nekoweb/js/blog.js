/**
 * Minimal blog for NeoCities Bento
 * - Homepage: fills #blog-list from blog/posts.json
 * - post.html?p=file.md: fetches and renders markdown
 * No libraries. Edit posts.json when you add a post.
 */
(function () {
  "use strict";

  var SITE_ORIGIN = "https://rov.nekoweb.org";
  var AUTHOR = "rov";

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(iso) {
    if (!iso) return "";
    var parts = String(iso).split("-");
    if (parts.length !== 3) return escapeHtml(iso);
    var months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    var m = months[parseInt(parts[1], 10) - 1] || parts[1];
    return m + " " + parseInt(parts[2], 10) + ", " + parts[0];
  }

  function inlineMd(text) {
    var s = escapeHtml(text);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    s = s.replace(
      /\[([^\]]+)\]\(([^)\s]+|mailto:[^)\s]+|\/[^)\s]*)\)/g,
      '<a href="$2">$1</a>'
    );
    return s;
  }

  /**
   * Tiny markdown subset → HTML
   * Supports: # ## ###, paragraphs, ul/ol, fenced code, hr, blockquote, inline
   */
  function markdownToHtml(src) {
    var lines = String(src).replace(/\r\n/g, "\n").split("\n");
    var html = [];
    var i = 0;
    var inCode = false;
    var codeBuf = [];
    var inUl = false;
    var inOl = false;
    var para = [];

    function closeLists() {
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
    }

    function flushPara() {
      if (!para.length) return;
      html.push("<p>" + inlineMd(para.join(" ")) + "</p>");
      para = [];
    }

    while (i < lines.length) {
      var line = lines[i];

      if (inCode) {
        if (/^```/.test(line)) {
          html.push("<pre><code>" + escapeHtml(codeBuf.join("\n")) + "</code></pre>");
          codeBuf = [];
          inCode = false;
        } else {
          codeBuf.push(line);
        }
        i += 1;
        continue;
      }

      if (/^```/.test(line)) {
        flushPara();
        closeLists();
        inCode = true;
        i += 1;
        continue;
      }

      if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
        flushPara();
        closeLists();
        html.push("<hr>");
        i += 1;
        continue;
      }

      var heading = /^(#{1,3})\s+(.+)$/.exec(line);
      if (heading) {
        flushPara();
        closeLists();
        var level = heading[1].length;
        html.push("<h" + level + ">" + inlineMd(heading[2]) + "</h" + level + ">");
        i += 1;
        continue;
      }

      if (/^>\s?/.test(line)) {
        flushPara();
        closeLists();
        html.push("<blockquote><p>" + inlineMd(line.replace(/^>\s?/, "")) + "</p></blockquote>");
        i += 1;
        continue;
      }

      var ul = /^[-*]\s+(.+)$/.exec(line);
      if (ul) {
        flushPara();
        if (inOl) {
          html.push("</ol>");
          inOl = false;
        }
        if (!inUl) {
          html.push("<ul>");
          inUl = true;
        }
        html.push("<li>" + inlineMd(ul[1]) + "</li>");
        i += 1;
        continue;
      }

      var ol = /^\d+\.\s+(.+)$/.exec(line);
      if (ol) {
        flushPara();
        if (inUl) {
          html.push("</ul>");
          inUl = false;
        }
        if (!inOl) {
          html.push("<ol>");
          inOl = true;
        }
        html.push("<li>" + inlineMd(ol[1]) + "</li>");
        i += 1;
        continue;
      }

      if (line.trim() === "") {
        flushPara();
        closeLists();
        i += 1;
        continue;
      }

      closeLists();
      para.push(line.trim());
      i += 1;
    }

    flushPara();
    closeLists();
    if (inCode) {
      html.push("<pre><code>" + escapeHtml(codeBuf.join("\n")) + "</code></pre>");
    }

    return html.join("\n");
  }

  function safePostFile(name) {
    if (!name) return null;
    name = String(name).replace(/^.*[\\/]/, "");
    if (!/^[a-zA-Z0-9._-]+\.md$/.test(name)) return null;
    return name;
  }

  function loadPostsJson() {
    return fetch("blog/posts.json", { credentials: "same-origin" }).then(function (res) {
      if (!res.ok) throw new Error("Could not load posts.json");
      return res.json();
    });
  }

  function renderHomeList() {
    var list = $("blog-list");
    if (!list) return;

    loadPostsJson()
      .then(function (posts) {
        if (!Array.isArray(posts) || !posts.length) {
          list.innerHTML =
            '<li class="muted">No posts yet. Add a .md file and list it in <a href="blog/posts.json">posts.json</a>.</li>';
          return;
        }

        var items = posts.map(function (post) {
          var file = safePostFile(post.file);
          if (!file) return "";
          var title = escapeHtml(post.title || file);
          var date = formatDate(post.date);
          var href = "post.html?p=" + encodeURIComponent(file);
          return (
            "<li>" +
            (date ? '<span class="blog-date">' + date + "</span> " : "") +
            '<a href="' + href + '">' + title + "</a>" +
            "</li>"
          );
        });

        list.innerHTML = items.join("") ||
          '<li class="muted">Posts listed, but filenames looked unsafe. Use letters, numbers, dashes, underscores.</li>';
      })
      .catch(function () {
        list.innerHTML =
          '<li class="muted">Couldn’t load the post list. Check <a href="blog/posts.json">posts.json</a> or browse <a href="blog/">/blog</a>.</li>';
      });
  }


  function stripFirstH1(md) {
    return String(md).replace(/^#\s+.+\n+/, "");
  }

  function renderPostPage() {
    var titleEl = $("post-title");
    var metaEl = $("post-meta");
    var bodyEl = $("post-body");
    if (!titleEl || !bodyEl) return;

    var params = new URLSearchParams(window.location.search);
    var file = safePostFile(params.get("p"));

    if (!file) {
      titleEl.textContent = "Post not found";
      if (metaEl) metaEl.textContent = "";
      bodyEl.innerHTML =
        '<p>Missing or invalid <code>?p=</code> parameter. Pick a post from the <a href="index.html">homepage</a>.</p>';
      return;
    }

    loadPostsJson()
      .catch(function () {
        return [];
      })
      .then(function (posts) {
        var meta = null;
        if (Array.isArray(posts)) {
          for (var i = 0; i < posts.length; i += 1) {
            if (posts[i].file === file) {
              meta = posts[i];
              break;
            }
          }
        }

        return fetch("blog/" + file, { credentials: "same-origin" }).then(function (res) {
          if (!res.ok) throw new Error("missing");
          return res.text().then(function (md) {
            return { md: md, meta: meta };
          });
        });
      })
      .then(function (result) {
        var meta = result.meta || { file: file, title: file.replace(/\.md$/, "") };
        var title = meta.title || file;
        titleEl.textContent = title;
        if (metaEl) {
          metaEl.textContent = meta.date
            ? formatDate(meta.date)
            : "from /blog/" + file;
        }
        bodyEl.innerHTML = markdownToHtml(stripFirstH1(result.md));
      })
      .catch(function () {
        titleEl.textContent = "Couldn't load post";
        if (metaEl) metaEl.textContent = file;
        bodyEl.innerHTML =
          '<p>Tried to fetch <code>blog/' +
          escapeHtml(file) +
          "</code> and failed. Is the file uploaded? You can still open the raw markdown if it exists.</p>" +
          '<p><a href="blog/' +
          encodeURIComponent(file) +
          '">Raw file</a> · <a href="index.html">Home</a></p>';
      });
  }

  if ($("blog-list")) renderHomeList();
  if ($("post-body")) renderPostPage();
})();
