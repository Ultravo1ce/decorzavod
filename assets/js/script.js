const header = document.querySelector('.header');
const burger = document.querySelector('.burger');
const navLinks = document.querySelectorAll('.nav__link, .footer__nav a, .header__actions .btn, .logo[href="#top"]');
const form = document.querySelector('.estimate-form');
const formNote = document.querySelector('.form-note');
const faqItems = document.querySelectorAll('.faq-item');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Copy protection */
document.addEventListener('contextmenu', (event) => {
  if (!event.target.closest('input, textarea, select')) {
    event.preventDefault();
  }
});

document.addEventListener('copy', (event) => {
  if (!event.target.closest('input, textarea, select')) {
    event.preventDefault();
  }
});

document.addEventListener('dragstart', (event) => {
  if (event.target.tagName === 'IMG') {
    event.preventDefault();
  }
});

/* Mobile menu */
burger?.addEventListener('click', () => {
  const isOpen = header.classList.toggle('header--open');
  burger.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    header.classList.remove('header--open');
    burger?.setAttribute('aria-expanded', 'false');
  });
});

/* Header on scroll */
const onScroll = () => {
  header.classList.toggle('header--scrolled', window.scrollY > 40);
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* FAQ accordion — one open at a time */
faqItems.forEach((item) => {
  const trigger = item.querySelector('.faq-item__question');

  trigger?.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');

    faqItems.forEach((other) => {
      other.classList.remove('is-open');
      other.querySelector('.faq-item__question')?.setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });
});

/* Scroll reveal */
const revealElements = document.querySelectorAll('.reveal');

if (!prefersReducedMotion && revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add('is-visible'));
}

/* Animated counters */
const animateCounter = (element) => {
  const target = Number(element.dataset.count);
  const prefix = element.dataset.prefix || '';
  const suffix = element.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    const value = Math.round(target * eased);

    element.textContent = `${prefix}${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const statValues = document.querySelectorAll('[data-count]');

const setFinalCounter = (element) => {
  const prefix = element.dataset.prefix || '';
  const suffix = element.dataset.suffix || '';
  element.textContent = `${prefix}${element.dataset.count}${suffix}`;
};

if (prefersReducedMotion) {
  statValues.forEach(setFinalCounter);
} else if (statValues.length) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  statValues.forEach((el) => counterObserver.observe(el));
}

/* Form submit */
form?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  formNote.textContent = 'Спасибо! Заявка принята — менеджер «ДекорЗавод» в Москве свяжется с вами в ближайшее время.';
  form.reset();
});

/* Закрываем мобильное меню при переходе на широкий экран и по Escape */
const desktopMq = window.matchMedia('(min-width: 1241px)');
const closeMenu = () => {
  header.classList.remove('header--open');
  burger?.setAttribute('aria-expanded', 'false');
};
desktopMq.addEventListener?.('change', (e) => { if (e.matches) closeMenu(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

/* Карусель галереи: стрелки, превью, свайп, клавиатура */
document.querySelectorAll('[data-carousel]').forEach((root) => {
  const track = root.querySelector('.carousel__track');
  const slides = [...root.querySelectorAll('.carousel__slide')];
  const prev = root.querySelector('.carousel__arrow--prev');
  const next = root.querySelector('.carousel__arrow--next');
  const counter = root.querySelector('.carousel__counter');
  const thumbsBox = root.querySelector('.carousel__thumbs');
  const total = slides.length;
  let index = 0;

  const thumbs = slides.map((slide, i) => {
    const img = slide.querySelector('img');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'carousel__thumb';
    btn.setAttribute('aria-label', `Фото ${i + 1} из ${total}`);
    const t = document.createElement('img');
    t.src = img.dataset.thumb || img.getAttribute('src');
    t.alt = '';
    t.loading = 'lazy';
    t.decoding = 'async';
    btn.appendChild(t);
    btn.addEventListener('click', () => go(i));
    thumbsBox.appendChild(btn);
    return btn;
  });

  const go = (i) => {
    index = (i + total) % total;
    track.style.transform = `translateX(${-index * 100}%)`;
    slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== index)));
    thumbs.forEach((t, k) => {
      t.classList.toggle('is-active', k === index);
      t.setAttribute('aria-current', k === index ? 'true' : 'false');
    });
    if (counter) counter.textContent = `${index + 1} / ${total}`;
    const active = thumbs[index];
    if (active && thumbsBox.scrollWidth > thumbsBox.clientWidth) {
      thumbsBox.scrollTo({
        left: active.offsetLeft - (thumbsBox.clientWidth - active.offsetWidth) / 2,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
    // подгружаем соседний кадр заранее
    const nextImg = slides[(index + 1) % total].querySelector('img');
    if (nextImg.loading === 'lazy') nextImg.loading = 'eager';
  };

  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));

  root.tabIndex = 0;
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
  });

  // свайп пальцем и мышью
  const stage = root.querySelector('.carousel__stage');
  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dragging = false;
  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.carousel__arrow')) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    dx = 0;
    track.classList.add('is-dragging');
  });
  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dx = e.clientX - startX;
    if (Math.abs(dx) < Math.abs(e.clientY - startY)) return;
    track.style.transform = `translateX(calc(${-index * 100}% + ${dx}px))`;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    const limit = Math.min(80, stage.clientWidth * 0.15);
    if (dx > limit) go(index - 1);
    else if (dx < -limit) go(index + 1);
    else go(index);
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('pointerleave', end);

  go(0);
});

/* Маска телефона: +7 (999) 123-45-67
   Работает с Backspace/Delete в любом месте: если стёрт символ-разделитель
   (скобка, пробел, дефис), удаляется соседняя цифра. Курсор не прыгает в конец. */
const phoneInput = document.querySelector('input[name="phone"]');
if (phoneInput) {
  // 10 цифр номера без кода страны
  const toLocalDigits = (value) => {
    let raw = value.trim();
    if (raw.startsWith('+7')) raw = raw.slice(2);
    let d = raw.replace(/\D/g, '');
    if (d.length >= 11 && (d[0] === '8' || d[0] === '7')) d = d.slice(1);
    return d.slice(0, 10);
  };
  const format = (d) => {
    if (!d) return '+7';
    let out = '+7 (' + d.slice(0, 3);
    if (d.length >= 3) out += ')';
    if (d.length > 3) out += ' ' + d.slice(3, 6);
    if (d.length > 6) out += '-' + d.slice(6, 8);
    if (d.length > 8) out += '-' + d.slice(8, 10);
    return out;
  };
  // позиция курсора после n-й цифры номера (без «7» кода страны)
  const caretAfterDigits = (formatted, n) => {
    if (n <= 0) return Math.min(formatted.length, 4);
    let count = 0;
    for (let i = 2; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        count++;
        if (count === n) return i + 1;
      }
    }
    return formatted.length;
  };
  // сколько цифр номера стоит слева от позиции pos
  const digitsBefore = (value, pos) => {
    const left = value.slice(0, pos);
    const body = left.startsWith('+7') ? left.slice(2) : left;
    return body.replace(/\D/g, '').length;
  };

  let prevDigits = toLocalDigits(phoneInput.value);

  phoneInput.addEventListener('beforeinput', (e) => {
    if (e.inputType !== 'deleteContentBackward' && e.inputType !== 'deleteContentForward') return;
    const v = phoneInput.value;
    const start = phoneInput.selectionStart ?? v.length;
    const end = phoneInput.selectionEnd ?? v.length;
    if (start !== end) return; // выделение удаляется штатно
    const idx = e.inputType === 'deleteContentBackward' ? start - 1 : start;
    const ch = v[idx];
    if (ch === undefined || /\d/.test(ch) && idx >= 2) return; // обычная цифра — штатно
    // стирают разделитель или «+7»: удаляем ближайшую цифру номера
    e.preventDefault();
    const d = toLocalDigits(v);
    let n = digitsBefore(v, start);
    let next;
    if (e.inputType === 'deleteContentBackward') {
      if (n === 0) return;
      next = d.slice(0, n - 1) + d.slice(n);
      n -= 1;
    } else {
      if (n >= d.length) return;
      next = d.slice(0, n) + d.slice(n + 1);
    }
    const out = format(next);
    phoneInput.value = out;
    prevDigits = next;
    const pos = caretAfterDigits(out, n);
    phoneInput.setSelectionRange(pos, pos);
    phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
  });

  phoneInput.addEventListener('input', () => {
    const v = phoneInput.value;
    const caret = phoneInput.selectionStart ?? v.length;
    const n = digitsBefore(v, caret);
    const d = toLocalDigits(v);
    const out = d.length ? format(d) : (v ? '+7' : '');
    if (out !== v) {
      phoneInput.value = out;
      const pos = caretAfterDigits(out, Math.min(n, d.length));
      if (document.activeElement === phoneInput) phoneInput.setSelectionRange(pos, pos);
    }
    prevDigits = d;
    const total = d.length;
    phoneInput.setCustomValidity(total === 0 || total === 10 ? '' : 'Введите номер полностью: +7 (999) 123-45-67');
  });

  phoneInput.addEventListener('focus', () => { if (!phoneInput.value) phoneInput.value = '+7'; });
  phoneInput.addEventListener('blur', () => { if (phoneInput.value === '+7') phoneInput.value = ''; });
}

/* Документы (политика, согласие) во всплывающем окне */
const legalModal = document.querySelector('.legal-modal');
const legalBody = legalModal?.querySelector('.legal-modal__body');
const legalTitle = legalModal?.querySelector('.legal-modal__title');
const legalCache = {};

const openLegal = async (href) => {
  if (!legalModal || typeof legalModal.showModal !== 'function') {
    window.open(href, '_blank', 'noopener');
    return;
  }
  try {
    if (!legalCache[href]) {
      const res = await fetch(href);
      if (!res.ok) throw new Error(res.status);
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const article = doc.querySelector('article.legal');
      if (!article) throw new Error('no article');
      legalCache[href] = article.outerHTML;
    }
    legalBody.innerHTML = legalCache[href];
    legalTitle.textContent = legalBody.querySelector('h1')?.textContent || 'Документ';
    if (!legalModal.open) {
      legalModal.showModal();
      document.documentElement.classList.add('modal-open');
    }
    legalBody.scrollTop = 0;
    legalBody.focus({ preventScroll: true });
  } catch (err) {
    window.location.href = href;
  }
};

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-legal]');
  if (!link) return;
  e.preventDefault();
  openLegal(link.getAttribute('href'));
});

legalModal?.querySelector('.legal-modal__close')?.addEventListener('click', () => legalModal.close());
legalModal?.addEventListener('click', (e) => { if (e.target === legalModal) legalModal.close(); });
legalModal?.addEventListener('close', () => document.documentElement.classList.remove('modal-open'));

/* Видео первого экрана: запуск без звука, пауза при «уменьшении движения» */
const heroVideo = document.querySelector('.hero__video');
if (heroVideo) {
  heroVideo.muted = true;
  if (prefersReducedMotion) {
    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();
  } else {
    const p = heroVideo.play();
    if (p && p.catch) p.catch(() => {});
  }
}

/* Галерея: открытие фото во весь экран */
(() => {
  const box = document.querySelector('.lightbox');
  const carousel = document.querySelector('[data-carousel]');
  if (!box || !carousel || typeof box.showModal !== 'function') return;
  const stage = carousel.querySelector('.carousel__stage');
  const imgs = [...carousel.querySelectorAll('.carousel__slide img')];
  const thumbs = () => [...carousel.querySelectorAll('.carousel__thumb')];
  const view = box.querySelector('.lightbox__img');
  const counter = box.querySelector('.lightbox__counter');
  let i = 0;

  const show = (n) => {
    i = (n + imgs.length) % imgs.length;
    const src = imgs[i].getAttribute('src');
    view.classList.remove('is-ready');
    view.onload = () => view.classList.add('is-ready');
    view.src = src;
    view.alt = imgs[i].alt;
    if (view.complete) view.classList.add('is-ready');
    counter.textContent = `${i + 1} / ${imgs.length}`;
    // заранее грузим соседние кадры
    [i + 1, i - 1].forEach((k) => { const im = new Image(); im.src = imgs[(k + imgs.length) % imgs.length].getAttribute('src'); });
  };
  const open = () => {
    const cur = parseInt((carousel.querySelector('.carousel__counter')?.textContent || '1').split('/')[0], 10) - 1;
    show(isNaN(cur) ? 0 : cur);
    box.showModal();
    document.documentElement.classList.add('modal-open');
  };
  const close = () => box.close();

  // клик (а не перетаскивание) по фото — открыть
  let downX = 0, downY = 0;
  stage.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
  stage.addEventListener('click', (e) => {
    if (e.target.closest('.carousel__arrow')) return;
    if (Math.abs(e.clientX - downX) > 8 || Math.abs(e.clientY - downY) > 8) return;
    open();
  });
  stage.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });

  box.querySelector('.lightbox__prev, .lightbox__arrow--prev').addEventListener('click', (e) => { e.stopPropagation(); show(i - 1); });
  box.querySelector('.lightbox__arrow--next').addEventListener('click', (e) => { e.stopPropagation(); show(i + 1); });
  box.querySelector('.lightbox__close').addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box || e.target.classList.contains('lightbox__figure')) close(); });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1); }
  });
  // свайп в полноэкранном режиме
  let sx = null;
  box.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  box.addEventListener('pointerup', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 50) { show(dx > 0 ? i - 1 : i + 1); box.dataset.swiped = '1'; setTimeout(() => delete box.dataset.swiped, 50); }
  });
  box.addEventListener('click', (e) => { if (box.dataset.swiped) e.stopImmediatePropagation(); }, true);
  // при закрытии карусель встаёт на тот же кадр
  box.addEventListener('close', () => {
    document.documentElement.classList.remove('modal-open');
    thumbs()[i]?.click();
  });
})();
