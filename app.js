(() => {
  'use strict';
  document.documentElement.classList.remove('no-js');
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const menu = $('.menu-toggle'), nav = $('.nav-links');
  function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menu +'; }
  menu.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? 'Fechar −' : 'Menu +';
  });
  $$('a', nav).forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
  nav.addEventListener('focusout', e => { if (!nav.contains(e.relatedTarget) && e.relatedTarget !== menu) closeMenu(); });
  const cards = $$('.product-card'), application = $('#application-filter'), access = $('#access-filter');
  function filterProducts() {
    let count = 0;
    cards.forEach(card => {
      const matches = (!application.value || card.dataset.app.split(' ').includes(application.value)) &&
        (!access.value || card.dataset.access.split(' ').includes(access.value));
      card.hidden = !matches; if (matches) count++;
    });
    $('#result-count').textContent = `${count} ${count === 1 ? 'solução' : 'soluções'}`;
    $('#empty-state').hidden = count > 0;
    $('.other-solutions').hidden = !cards.some(card => card.classList.contains('editorial-card') && !card.hidden);
  }
  [application, access].forEach(select => select.addEventListener('change', filterProducts));
  $('#reset-filters').addEventListener('click', () => { application.value = ''; access.value = ''; filterProducts(); application.focus(); });
  const dialog = $('#product-dialog'), zoom = $('#zoom-dialog');
  let trigger;
  $$('.product-card summary').forEach(summary => summary.addEventListener('click', e => {
    if (typeof dialog.showModal !== 'function') return;
    e.preventDefault(); trigger = summary;
    const card = summary.closest('.product-card'), img = $('img', card), body = $('#dialog-body');
    body.replaceChildren(); body.classList.toggle('no-photo', !img);
    if (img) {
      const photo = document.createElement('div'); photo.className = 'dialog-photo';
      const clone = img.cloneNode(); clone.removeAttribute('loading'); clone.removeAttribute('srcset'); clone.removeAttribute('sizes');
      photo.append(clone);
      const expand = document.createElement('button'); expand.type = 'button'; expand.textContent = 'Ampliar imagem ↗';
      expand.addEventListener('click', () => {
        const full = clone.cloneNode(); $('#zoom-image').replaceChildren(full);
        $('#zoom-title').textContent = $('h3', card).textContent; zoom.showModal();
      }); photo.append(expand); body.append(photo);
    }
    const heading = document.createElement('div'), title = document.createElement('h2');
    heading.className = 'dialog-heading';
    title.id = 'dialog-title'; title.textContent = $('h3', card).textContent; heading.append(title);
    const tags = $('.access-tags', card); if (tags) heading.append(tags.cloneNode(true));
    body.prepend(heading);
    const content = $('.product-detail', card).cloneNode(true);
    content.classList.add('dialog-copy');
    const consultation = $('.text-link', content);
    $('#dialog-footer').replaceChildren(consultation);
    body.append(content);
    document.body.classList.add('modal-open'); dialog.showModal();
    $('.close-dialog', dialog).focus();
  }));
  $$('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  [dialog, zoom].forEach(modal => modal.addEventListener('click', e => {
    if (e.target !== modal) return;
    const r = modal.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) modal.close();
  }));
  dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); if (trigger) trigger.focus({ preventScroll: true }); });
  const quotes = window.WS_QUOTES;
  let quoteIndex = 0;
  function showQuote(direction) {
    quoteIndex = (quoteIndex + direction + quotes.length) % quotes.length;
    $('#quote-text').textContent = quotes[quoteIndex]; $('#quote-count').textContent = `0${quoteIndex + 1} / 0${quotes.length}`;
  }
  $('#quote-prev').addEventListener('click', () => showQuote(-1));
  $('#quote-next').addEventListener('click', () => showQuote(1));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('seen'); observer.unobserve(entry.target); }
    }), { threshold: .1 });
    $$('.reveal').forEach(el => observer.observe(el));
  }
  // Short, native-scroll product sequence; the text stays available without animation.
  if (!reduced.matches && matchMedia('(min-width: 1100px)').matches) {
    let ticking = false;
    const hero = $('.hero'), picture = $('.hero-picture');
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (!reduced.matches && scrollY < hero.offsetHeight) picture.style.transform = `translateY(${Math.min(scrollY * .08, 65)}px)`;
        ticking = false;
      });
    }, { passive: true });
  }
})();
