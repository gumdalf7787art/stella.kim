const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export class VanillaDepthCarousel {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    this.items = options.items || [];
    this.cardWidth = options.cardWidth || 300;
    this.cardHeight = options.cardHeight || 380;
    this.radius = options.radius || 18;
    this.tint = options.tint || '#05060a';
    this.depth = options.depth || 220;
    this.spread = options.spread || 90;
    this.tilt = options.tilt || 22;
    this.tiltDirection = options.tiltDirection || 'right';
    this.perspective = options.perspective || 1400;
    this.visibleCards = options.visibleCards || 4;
    this.falloff = options.falloff || 0.2;
    this.blur = options.blur || 6;
    this.duration = options.duration || 700;
    this.ease = options.ease || 'power3.out';
    this.autoplay = options.autoplay || false;
    this.autoplayDelay = options.autoplayDelay || 3200;
    this.loop = options.loop !== false;
    this.showControls = options.showControls !== false;
    this.showIndicators = options.showIndicators !== false;
    this.onChange = options.onChange || null;
    this.initialIndex = options.initialIndex || 0;

    this.count = this.items.length;
    this.pos = this.initialIndex;
    this.focusIdx = this.initialIndex;
    this.scale = 1;
    this.cards = [];
    this.overlays = [];
    this.dots = [];
    
    this.init();
  }

  init() {
    this.container.classList.add('depth-carousel');
    this.container.style.setProperty('--dc-perspective', `${this.perspective}px`);
    this.container.tabIndex = 0;
    
    this.stage = document.createElement('div');
    this.stage.className = 'depth-carousel__stage';
    this.container.appendChild(this.stage);

    this.items.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'depth-carousel__card';
      card.style.width = `${this.cardWidth}px`;
      card.style.height = `${this.cardHeight}px`;
      card.style.borderRadius = `${this.radius}px`;
      card.addEventListener('click', () => {
        if (!this.dragMoved) this.setFocus(i, true);
      });

      const img = document.createElement('img');
      img.className = 'depth-carousel__img';
      img.onload = () => {
        const aspect = img.naturalWidth / img.naturalHeight || (this.cardWidth / this.cardHeight);
        card.style.width = `${this.cardHeight * aspect}px`;
      };
      img.src = item.src || item.image;
      img.draggable = false;

      const overlay = document.createElement('span');
      overlay.className = 'depth-carousel__tint';
      overlay.style.background = this.tint;

      card.appendChild(img);
      card.appendChild(overlay);
      this.stage.appendChild(card);
      
      this.cards.push(card);
      this.overlays.push(overlay);
    });

    if (this.showControls && this.count > 1) {
      this.prevBtn = document.createElement('button');
      this.prevBtn.className = 'depth-carousel__arrow depth-carousel__arrow--prev';
      this.prevBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>`;
      this.prevBtn.addEventListener('click', () => this.navigateBy(-1));

      this.nextBtn = document.createElement('button');
      this.nextBtn.className = 'depth-carousel__arrow depth-carousel__arrow--next';
      this.nextBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>`;
      this.nextBtn.addEventListener('click', () => this.navigateBy(1));

      this.container.appendChild(this.prevBtn);
      this.container.appendChild(this.nextBtn);
    }

    if (this.showIndicators && this.count > 1) {
      this.dotsContainer = document.createElement('div');
      this.dotsContainer.className = 'depth-carousel__dots';
      
      this.items.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = `depth-carousel__dot${i === this.focusIdx ? ' is-active' : ''}`;
        dot.addEventListener('click', () => this.setFocus(i, true));
        this.dotsContainer.appendChild(dot);
        this.dots.push(dot);
      });
      this.container.appendChild(this.dotsContainer);
    }

    this.setupEvents();
    this.handleResize();
    
    // Jump immediately to initial without animation
    this.layout(this.pos);
  }

  setupEvents() {
    window.addEventListener('resize', () => this.handleResize());
    
    // Wheel
    this.container.addEventListener('wheel', e => {
      if (this.count < 2) return;
      e.preventDefault();
      if (this.tween) this.tween.kill();
      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const delta = e.deltaMode === 1 ? raw * 24 : raw;
      const step = clamp(delta / (this.cardWidth * 0.9), -0.6, 0.6);
      this.pos += step;
      this.layout(this.pos);
      clearTimeout(this.wheelTimer);
      this.wheelTimer = setTimeout(() => this.setFocus(Math.round(this.pos), true), 130);
    }, { passive: false });

    // Pointer events
    this.container.addEventListener('pointerdown', e => this.onPointerDown(e));
    this.container.addEventListener('pointermove', e => this.onPointerMove(e));
    window.addEventListener('pointerup', e => this.onPointerEnd(e));
    window.addEventListener('pointercancel', e => this.onPointerEnd(e));

    // Keyboard
    this.container.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.navigateBy(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); this.navigateBy(1); }
    });
  }

  handleResize() {
    const w = this.container.getBoundingClientRect().width;
    // Assume max width for landscape images is cardHeight * 1.5 (e.g., 570px) to ensure they fit on mobile
    const assumedMaxWidth = this.cardHeight * 1.5;
    const needed = assumedMaxWidth + Math.abs(this.spread) * 2 + 120;
    this.scale = clamp(w / needed, 0.4, 1);
    this.layout(this.pos);
  }

  onPointerDown(e) {
    if (this.count < 2) return;
    if (this.tween) this.tween.kill();
    this.drag = {
      x: e.clientX,
      startPos: this.pos,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      id: e.pointerId
    };
    this.dragMoved = false;
  }

  onPointerMove(e) {
    if (!this.drag) return;
    const stepPx = Math.max(this.cardWidth * 0.55 * this.scale, 40);
    const dx = e.clientX - this.drag.x;
    if (!this.dragMoved && Math.abs(dx) > 4) {
      this.dragMoved = true;
      this.container.setPointerCapture(this.drag.id);
    }
    if (!this.dragMoved) return;
    
    const now = performance.now();
    const dt = Math.max(now - this.drag.lastT, 1);
    this.drag.v = (e.clientX - this.drag.lastX) / dt;
    this.drag.lastX = e.clientX;
    this.drag.lastT = now;
    
    this.pos = this.drag.startPos - dx / stepPx;
    this.layout(this.pos);
  }

  onPointerEnd(e) {
    if (!this.drag) return;
    const drag = this.drag;
    this.drag = null;
    if (!this.dragMoved) return;
    
    const stepPx = Math.max(this.cardWidth * 0.55 * this.scale, 40);
    const projected = this.pos - (drag.v * 180) / stepPx;
    this.setFocus(Math.round(projected), true);
    
    // reset click prevention after a slight delay
    setTimeout(() => { this.dragMoved = false; }, 50);
  }

  navigateBy(step) {
    this.setFocus(this.focusIdx + step, true);
  }

  setFocus(rawIndex, animate = true) {
    const n = this.count;
    if (!n) return;
    const idx = this.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1);
    let delta = idx - this.pos;
    if (this.loop && n > 1) {
      delta = ((delta % n) + n) % n;
      if (delta > n / 2) delta -= n;
    }
    
    this.tweenTo(this.pos + delta, animate);
    
    if (idx !== this.focusIdx) {
      this.focusIdx = idx;
      if (this.onChange) this.onChange(idx);
      
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === idx);
      });
    }
  }

  tweenTo(target, animate) {
    if (this.tween) this.tween.kill();
    const proxy = { p: this.pos };
    const dur = animate ? this.duration / 1000 : 0;
    
    this.tween = gsap.to(proxy, {
      p: target,
      duration: dur,
      ease: this.ease,
      onUpdate: () => {
        this.pos = proxy.p;
        this.layout(proxy.p);
      },
      onComplete: () => {
        const n = this.count;
        if (n > 0) this.pos = ((this.pos % n) + n) % n;
        this.layout(this.pos);
      }
    });
  }

  layout(pos) {
    const n = this.count;
    if (!n) return;
    const dir = this.tiltDirection === 'left' ? -1 : 1;

    for (let i = 0; i < n; i++) {
      const el = this.cards[i];
      if (!el) continue;

      let d = i - pos;
      if (this.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }

      const back = Math.max(0, d);
      const az = Math.abs(d);
      const shown = az <= this.visibleCards + 0.5;

      const tz = -this.depth * d;
      const tx = dir * this.spread * d;
      const ry = dir * this.tilt * clamp(d, 0, 1);

      let opacity = d < 0 ? Math.max(0, 1 + d) : 1;
      if (!shown) opacity = 0;

      const brightness = Math.max(0.15, 1 - back * this.falloff);
      const blurPx = this.blur > 0 ? Math.min(this.blur, (back / Math.max(1, this.visibleCards)) * this.blur) : 0;
      const zi = Math.round(2000 - d * 20);

      el.style.transform = `translate(-50%, -50%) scale(${this.scale}) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
      el.style.zIndex = zi;
      el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';

      const ov = this.overlays[i];
      if (ov) ov.style.opacity = clamp(back * this.falloff * 1.25, 0, 0.86).toFixed(3);
    }
  }

  destroy() {
    // Cleanup if needed
    if (this.tween) this.tween.kill();
    this.container.innerHTML = '';
  }
}
