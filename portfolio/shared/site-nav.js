/* Shared site nav — single source for the nav bar used on every page.
   Renders the same links as the landing page and marks the active item
   based on the current URL. Drop-in: add
     <link rel="stylesheet" href="./shared/site-nav.css">
     <nav class="site-nav" data-site-nav aria-label="Primary"></nav>
     <script src="./shared/site-nav.js"></script>

   Some pages (the .dc.html canvas pages) re-render their DOM after load via
   the Design Combine runtime, which wipes JS-injected children. A
   MutationObserver re-fills any empty nav mount so the links survive. */
(function () {
  var LINKS = [
    {
      label: 'Home',
      href: '#hero',
      dataNav: '#hero',
      dataTarget: '#hero',
      match: function (p) {
        return p === '/' ||
          p.endsWith('/portfolio/') ||
          p.endsWith('/portfolio/index.html') ||
          (p.endsWith('/index.html') &&
            p.indexOf('/work/') === -1 &&
            p.indexOf('/service/') === -1 &&
            p.indexOf('/services/') === -1);
      }
    },
    {
      label: 'Work',
      href: 'work/work2.dc.html',
      dataNav: '#work',
      match: function (p) { return p.indexOf('/work/') !== -1; }
    },
    {
      label: 'Services',
      href: 'service/Service.dc.html',
      dataNav: '#services',
      match: function (p) { return p.indexOf('/service/') !== -1 || p.indexOf('/services/') !== -1; }
    },
    {
      label: 'About',
      href: '#philosophy',
      dataNav: '#philosophy',
      dataTarget: '#philosophy'
    },
    {
      label: 'Contact',
      href: '#contact',
      dataNav: '#contact',
      dataTarget: '#contact'
    }
  ];

  function measureScrollbarWidth() {
    var probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll;';
    document.body.appendChild(probe);
    var width = probe.offsetWidth - probe.clientWidth;
    probe.parentNode.removeChild(probe);
    return width;
  }

  function updateScrollbarCompensation() {
    var root = document.documentElement;
    var hasViewportScrollbar = root.clientWidth < window.innerWidth;
    var needsCompensation = !hasViewportScrollbar && root.scrollHeight <= root.clientHeight + 1;
    root.style.setProperty(
      '--site-nav-scrollbar-compensation',
      needsCompensation ? measureScrollbarWidth() + 'px' : '0px'
    );
  }

  function render(nav) {
    if (nav.children.length) return;            // already filled
    var path = location.pathname;
    var isNested = path.indexOf('/work/') !== -1 || path.indexOf('/service/') !== -1 || path.indexOf('/services/') !== -1;
    var rootPrefix = isNested ? '../' : './';
    var frag = document.createDocumentFragment();
    LINKS.forEach(function (link) {
      var a = document.createElement('a');
      a.href = rootPrefix + link.href;
      a.textContent = link.label;
      if (link.dataNav) a.setAttribute('data-nav', link.dataNav);
      if (!isNested && link.dataTarget) a.setAttribute('data-target', link.dataTarget);
      if (link.match && link.match(path)) a.className = 'active';
      frag.appendChild(a);
    });
    nav.appendChild(frag);
  }

  function fillAll() {
    var mounts = document.querySelectorAll('[data-site-nav]');
    for (var i = 0; i < mounts.length; i++) render(mounts[i]);
  }

  function start() {
    updateScrollbarCompensation();
    fillAll();
    // survive late/re-renders from the page runtime
    var mo = new MutationObserver(fillAll);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    // a few early retries in case the mount appears after first paint
    var tries = 0;
    var t = setInterval(function () {
      updateScrollbarCompensation();
      fillAll();
      if (++tries > 20) clearInterval(t);
    }, 100);
    window.addEventListener('resize', updateScrollbarCompensation);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
