document.addEventListener('DOMContentLoaded', function () {
  // Revelado en scroll — un único patrón, sin animar cada elemento suelto
  var reveals = document.querySelectorAll('.reveal, .reveal-stagger, .reveal-brand');
  if (reveals.length && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { obs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('active'); });
  }

  // Tarjetas flotantes del hero: aparecen con una leve secuencia al cargar
  var floats = document.querySelectorAll('.float-card');
  floats.forEach(function (el, i) {
    setTimeout(function () { el.classList.add('active'); }, 500 + i * 350);
  });

  // Posiciona el conector de pasos exactamente entre el primer y último ícono
  function layoutStepConnectors() {
    document.querySelectorAll('.step-flow').forEach(function (flow) {
      var connector = flow.querySelector('.step-connector');
      if (!connector) return;
      var steps = flow.querySelectorAll('.step');
      if (steps.length < 2) return;
      var firstMark = steps[0].querySelector('.ico') || steps[0].querySelector('.num-tag') || steps[0];
      var lastMark = steps[steps.length - 1].querySelector('.ico') || steps[steps.length - 1].querySelector('.num-tag') || steps[steps.length - 1];
      var flowRect = flow.getBoundingClientRect();
      var firstRect = firstMark.getBoundingClientRect();
      var lastRect = lastMark.getBoundingClientRect();
      var firstCenter = (firstRect.left - flowRect.left) + firstRect.width / 2;
      var lastCenter = (lastRect.left - flowRect.left) + lastRect.width / 2;
      connector.style.left = firstCenter + 'px';
      connector.style.width = (lastCenter - firstCenter) + 'px';
    });
  }
  layoutStepConnectors();
  setTimeout(layoutStepConnectors, 500);
  window.addEventListener('resize', function () {
    clearTimeout(window._stepResizeT);
    window._stepResizeT = setTimeout(layoutStepConnectors, 150);
  });

  // step-flow: activa la línea conectora cuando entra en pantalla
  var steps = document.querySelectorAll('.step-flow');
  if (steps.length && 'IntersectionObserver' in window) {
    var stepObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          stepObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    steps.forEach(function (el) { stepObs.observe(el); });
  }

  // data-rows: rellena la barra según data-pct al entrar en pantalla
  var rows = document.querySelectorAll('.data-row');
  if (rows.length && 'IntersectionObserver' in window) {
    var rowObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var fill = entry.target.querySelector('.bar-fill');
          var pct = entry.target.getAttribute('data-pct') || '100';
          if (fill) fill.style.width = pct + '%';
          rowObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    rows.forEach(function (el) { rowObs.observe(el); });
  }
  // Video de fondo del hero: refuerzo de autoplay en móvil
  var heroVideo = document.querySelector('.hero-bg video');
  if (heroVideo) {
    var tryPlay = function () {
      var p = heroVideo.play();
      if (p !== undefined) { p.catch(function () {}); }
    };
    tryPlay();
    document.addEventListener('visibilitychange', function () { if (!document.hidden) tryPlay(); });
    document.addEventListener('touchstart', tryPlay, { once: true, passive: true });
  }

  // Slider de testimonios: autoplay + dots
  var testiSlider = document.querySelector('.testi-slider');
  if (testiSlider) {
    var track = testiSlider.querySelector('.testi-track');
    var slides = testiSlider.querySelectorAll('.testi');
    var dots = document.querySelectorAll('.testi-dots button');
    var current = 0;
    var autoplayMs = 6000;
    var timer;
    function goTo(i) {
      current = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (d, idx) { d.classList.toggle('active', idx === current); });
    }
    function startAutoplay() {
      stopAutoplay();
      timer = setInterval(function () { goTo(current + 1); }, autoplayMs);
    }
    function stopAutoplay() { if (timer) clearInterval(timer); }
    dots.forEach(function (d, idx) {
      d.addEventListener('click', function () { goTo(idx); startAutoplay(); });
    });
    testiSlider.addEventListener('mouseenter', stopAutoplay);
    testiSlider.addEventListener('mouseleave', startAutoplay);
    startAutoplay();
  }

  // Wizard de cotización: navegación por pasos
  document.querySelectorAll('.wizard').forEach(function (wizard) {
    var steps = wizard.querySelectorAll('.wizard-step');
    var dots = wizard.querySelectorAll('.wizard-progress .dot');
    var lines = wizard.querySelectorAll('.wizard-progress .line .fill');
    var total = steps.length;
    var idx = 0;

    function render() {
      steps.forEach(function (s, i) { s.classList.toggle('active', i === idx); });
      dots.forEach(function (d, i) {
        d.classList.toggle('current', i === idx);
        d.classList.toggle('done', i < idx);
      });
      lines.forEach(function (l, i) { l.style.width = (i < idx ? '100' : '0') + '%'; });
      var backBtn = wizard.querySelector('.wizard-back');
      var nextBtn = wizard.querySelector('.wizard-next');
      if (backBtn) backBtn.style.visibility = idx === 0 ? 'hidden' : 'visible';
      if (nextBtn) nextBtn.textContent = idx === total - 1 ? 'Enviar cotización' : 'Siguiente';
    }

    wizard.querySelectorAll('.wizard-next').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (idx < total - 1) {
          e.preventDefault();
          idx++;
          render();
        }
        // en el último paso, el botón es type="submit" y envía el formulario normalmente
      });
    });
    wizard.querySelectorAll('.wizard-back').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (idx > 0) { idx--; render(); }
      });
    });
    render();
  });

  document.querySelectorAll('.year-now').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Respeta reduced-motion: desactiva animaciones de hojas/reciclaje
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.leaf, .recycle-mark, .fx-leaf, .fx-dot, .ambient-global .blob, .loop-rotate, .partner-track').forEach(function (el) {
      el.style.animation = 'none';
    });
    document.querySelectorAll('.hub-panel svg').forEach(function (svg) {
      if (svg.pauseAnimations) svg.pauseAnimations();
    });
  }
});
