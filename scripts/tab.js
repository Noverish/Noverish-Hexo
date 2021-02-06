hexo.extend.injector.register(
  "body_end",
  () => `
  <script>
  (() => {
    function switchTab() {
      const defaultTab = document.querySelector('.tabs li a').getAttribute('href').slice(1);
      const activeTab = (location.hash) ? location.hash.slice(1) : defaultTab;

      document.querySelectorAll('.tab-content').forEach(v => v.classList.add('is-hidden'));
      document.querySelectorAll('.tabs li').forEach(v => v.classList.remove('is-active'));

      document.querySelectorAll('.' + activeTab).forEach(v => v.classList.remove('is-hidden'));
      document.querySelectorAll(\`a[href="#\${activeTab}"]\`).forEach(v => v.parentElement.classList.add('is-active'));
    }
    switchTab();
    window.addEventListener('hashchange', switchTab, false);
  })();
  </script>
  `,
  "post"
);