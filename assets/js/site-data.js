/* ============================================================================
   Cas Corp / Anime Verse — Site data renderer
   Fetches JSON data from /_data/ and renders dynamic sections of the page.
   Powered by Decap CMS (admin at /admin/).
   ========================================================================== */
(function () {
  "use strict";

  // ---------- Helpers ----------
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Fetch JSON with cache-busting so admins see their changes immediately
  function fetchJSON(url) {
    var bust = "?t=" + Date.now();
    return fetch(url + bust, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("Failed to load " + url + " (status " + r.status + ")");
      return r.json();
    });
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // ============================================================
  // TEAM RENDERING
  // ============================================================
  function renderTeam(data) {
    var section = $('[data-admin="team-section"]');
    if (!section) return;

    var members = (data && data.members) ? data.members.slice() : [];
    if (!members.length) {
      section.innerHTML = '<div style="text-align:center; padding:60px 20px; color:var(--muted)">No team members yet.</div>';
      return;
    }

    // Sort by order, then group
    members.sort(function (a, b) { return (a.order || 999) - (b.order || 999); });

    // Group members
    var groups = { "Founder": [], "Board of Directors": [], "Development Team": [] };
    members.forEach(function (m) {
      var g = m.group || "Development Team";
      if (!groups[g]) groups[g] = [];
      groups[g].push(m);
    });

    var groupOrder = ["Founder", "Board of Directors", "Development Team"];
    var html = "";
    groupOrder.forEach(function (g) {
      if (!groups[g] || !groups[g].length) return;
      var size = groups[g].length;
      var sizePadded = size < 10 ? "0" + size : "" + size;
      html += '<div class="team-group" data-size="' + size + '">';
      html += '<div class="team-group-head">';
      html += '<span class="team-group-title">' + escapeHtml(g) + '</span>';
      html += '<span class="team-group-count">' + sizePadded + '</span>';
      html += '</div>';
      html += '<div class="team-grid">';
      groups[g].forEach(function (m) {
        html += '<div class="member reveal in">';
        // Avatar — use image if provided, otherwise letter+color
        if (m.avatar) {
          html += '<div class="avatar" style="background-image:url(' + escapeHtml(m.avatar) + '); background-size:cover; background-position:center">';
        } else {
          html += '<div class="avatar ' + escapeHtml(m.color || "r") + '">';
          html += '<div class="avatar-initials">' + escapeHtml(m.initial || (m.name || "?").charAt(0)) + '</div>';
        }
        // Social icons (only show if URL is set)
        var hasSocials = m.twitter || m.roblox;
        if (hasSocials) {
          html += '<div class="avatar-social">';
          if (m.twitter) {
            html += '<a href="' + escapeHtml(m.twitter) + '" target="_blank" rel="noopener" aria-label="Twitter/X">';
            html += '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 3h3l-7 8 8 10h-6l-5-6-5 6H3l7-9-8-9h6l5 5z"/></svg>';
            html += '</a>';
          }
          if (m.roblox) {
            html += '<a href="' + escapeHtml(m.roblox) + '" target="_blank" rel="noopener" aria-label="Roblox">';
            html += '<img class="invert" src="assets/roblox-icon.png" alt="">';
            html += '</a>';
          }
          html += '</div>';
        }
        html += '</div>'; // end avatar
        html += '<div class="member-name">' + escapeHtml(m.name || "") + '</div>';
        if (m.role) html += '<div class="member-role">' + escapeHtml(m.role) + '</div>';
        if (m.handle) html += '<div class="member-handle">' + escapeHtml(m.handle) + '</div>';
        html += '</div>'; // end member
      });
      html += '</div></div>'; // end team-grid + team-group
    });
    section.innerHTML = html;
  }

  // ============================================================
  // CODES RENDERING (Anime Verse codes page)
  // ============================================================
  function renderCodes(data) {
    var holder = $('[data-admin="codes"]');
    if (!holder) return;

    var codes = (data && data.codes) ? data.codes.slice() : [];

    // Split by status
    var active = codes.filter(function (c) { return c.status === "active"; });
    var upcoming = codes.filter(function (c) { return c.status === "upcoming"; });
    var expired = codes.filter(function (c) { return c.status === "expired"; });

    [active, upcoming, expired].forEach(function (group) {
      group.sort(function (a, b) { return (a.order || 999) - (b.order || 999); });
    });

    function renderGroup(label, list, statusClass) {
      if (!list.length) return "";
      var html = '<h2 class="codes-section-title">' + escapeHtml(label) + ' <span class="codes-count">(' + list.length + ')</span></h2>';
      html += '<div class="codes-grid">';
      list.forEach(function (c) {
        html += '<div class="code-card ' + statusClass + '">';
        html += '<div class="code-status">' + escapeHtml((c.status || "").toUpperCase()) + '</div>';
        html += '<div class="code-value" data-code="' + escapeHtml(c.code || "") + '">' + escapeHtml(c.code || "") + '</div>';
        if (c.reward) html += '<div class="code-reward">' + escapeHtml(c.reward) + '</div>';
        if (c.expires) html += '<div class="code-expires">Expires: ' + escapeHtml(c.expires) + '</div>';
        if (statusClass !== "expired") {
          html += '<button class="code-copy" type="button">Copy</button>';
        }
        html += '</div>';
      });
      html += '</div>';
      return html;
    }

    var html = "";
    html += renderGroup("Active", active, "active");
    html += renderGroup("Upcoming", upcoming, "upcoming");
    html += renderGroup("Expired", expired, "expired");

    if (!html) {
      html = '<div class="codes-empty"><div class="em-title">No codes right now.</div><div>Check back when new codes drop!</div></div>';
    }

    holder.innerHTML = html;

    // Attach copy handlers
    $$(".code-copy", holder).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".code-card");
        if (!card) return;
        var code = card.querySelector(".code-value").getAttribute("data-code");
        try {
          navigator.clipboard.writeText(code);
          btn.textContent = "Copied!";
          setTimeout(function () { btn.textContent = "Copy"; }, 1400);
        } catch (e) {
          window.prompt("Copy this code:", code);
        }
      });
    });
  }

  // ============================================================
  // JOBS RENDERING (careers page)
  // ============================================================
  function renderJobs(data) {
    var holder = $('[data-admin="roles"]');
    if (!holder) return;

    var jobs = (data && data.jobs) ? data.jobs.slice() : [];
    jobs.sort(function (a, b) { return (a.order || 999) - (b.order || 999); });

    if (!jobs.length) {
      holder.innerHTML = '<div style="grid-column:1/-1; padding:60px 20px; text-align:center; color:var(--muted)">No roles right now. Check back soon.</div>';
    } else {
      var html = "";
      jobs.forEach(function (j) {
        html += '<div class="role">';
        html += '<div class="role-head">';
        html += '<div>';
        html += '<div class="role-title">' + escapeHtml(j.title || "Untitled");
        if (j.open) {
          html += ' <span class="role-tag-open">OPEN</span>';
        }
        html += '</div>';
        html += '<div class="role-meta">' + escapeHtml(j.meta || "") + '</div>';
        html += '</div>';
        html += '<div class="role-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg></div>';
        html += '</div>';
        html += '<div class="role-panel"><div class="role-panel-inner"><div class="role-panel-body">';

        // Description / status message
        if (j.description) {
          html += '<div class="role-msg">' + escapeHtml(j.description).replace(/\n/g, "<br>") + '</div>';
        } else if (j.open) {
          html += '<div class="role-msg"><b>This role is currently open!</b><br>Apply through the form below — we review applications on a rolling basis.</div>';
        } else {
          html += '<div class="role-msg"><b>This role isn\'t actively open right now.</b><br>We take applications for future openings on a rolling basis — submit yours below.</div>';
        }
        if (j.skills) html += '<div class="role-skills"><b>Skills:</b> ' + escapeHtml(j.skills) + '</div>';
        if (j.pay) html += '<div class="role-pay"><b>Compensation:</b> ' + escapeHtml(j.pay) + '</div>';

        html += '<a class="role-apply" href="#" data-link-key="apply" target="_blank" rel="noopener">' + (j.open ? "Apply Now" : "Apply for Future Roles") + ' <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg></a>';
        html += '</div></div></div></div>';
      });
      holder.innerHTML = html;

      // Attach click-to-expand handlers
      $$(".role-head", holder).forEach(function (head) {
        head.addEventListener("click", function () {
          head.parentNode.classList.toggle("open");
        });
      });
    }

    // Update homepage Available Roles count if present
    var countEl = $('[data-admin="roles-count"]');
    if (countEl) countEl.textContent = jobs.length;
  }

  // ============================================================
  // SITE LINKS RENDERING (replaces hrefs based on data-link-key)
  // ============================================================
  function renderLinks(data) {
    if (!data) return;
    $$('[data-link-key]').forEach(function (a) {
      var k = a.getAttribute("data-link-key");
      if (data[k]) a.setAttribute("href", data[k]);
    });
  }

  // ============================================================
  // INIT — fetch all data and render
  // ============================================================
  function init() {
    // Always try to update links (every page has them)
    fetchJSON("/_data/settings/links.json").then(renderLinks).catch(function (e) {
      console.warn("[site-data] links failed:", e.message);
    });

    // Team — only on homepage
    if ($('[data-admin="team-section"]')) {
      fetchJSON("/_data/team.json").then(renderTeam).catch(function (e) {
        console.warn("[site-data] team failed:", e.message);
      });
    }

    // Codes — only on codes page
    if ($('[data-admin="codes"]')) {
      fetchJSON("/_data/codes.json").then(renderCodes).catch(function (e) {
        console.warn("[site-data] codes failed:", e.message);
      });
    }

    // Jobs — careers page OR homepage (for roles count)
    if ($('[data-admin="roles"]') || $('[data-admin="roles-count"]')) {
      fetchJSON("/_data/jobs.json").then(renderJobs).catch(function (e) {
        console.warn("[site-data] jobs failed:", e.message);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
