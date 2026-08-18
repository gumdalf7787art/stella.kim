export class VanillaMasonry {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    this.items = options.items || [];
    this.ease = options.ease || 'power3.out';
    this.duration = options.duration || 0.6;
    this.stagger = options.stagger || 0.05;
    this.animateFrom = options.animateFrom || 'bottom';
    this.scaleOnHover = options.scaleOnHover !== false;
    this.hoverScale = options.hoverScale || 0.95;
    this.blurToFocus = options.blurToFocus !== false;
    this.colorShiftOnHover = options.colorShiftOnHover || false;
    this.onClick = options.onClick || null;
    
    this.columns = 1;
    this.width = 0;
    this.imagesReady = false;
    this.grid = [];
    
    this.init();
  }

  init() {
    this.setupResizeObserver();
    // We don't need to block on image loading. Let the browser handle background-image loading natively.
    this.imagesReady = true;
    if (this.width > 0) {
      this.calculateGrid();
      this.render();
    }
  }

  setupResizeObserver() {
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      if (this.width !== width) {
        this.width = width;
        this.updateColumns();
        if (this.imagesReady) {
          this.calculateGrid();
          this.render();
        }
      }
    });
    ro.observe(this.container);
  }

  updateColumns() {
    const w = window.innerWidth;
    if (w >= 1500) this.columns = 5;
    else if (w >= 1000) this.columns = 4;
    else if (w >= 600) this.columns = 3;
    else if (w >= 400) this.columns = 2;
    else this.columns = 1;
  }

  async preloadImages() {
    const promises = this.items.map(item => {
      return new Promise(resolve => {
        const img = new Image();
        img.src = item.src;
        img.onload = img.onerror = () => resolve();
      });
    });
    await Promise.all(promises);
  }

  calculateGrid() {
    if (!this.width) return;

    const colHeights = new Array(this.columns).fill(0);
    const columnWidth = this.width / this.columns;

    this.grid = this.items.map(item => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      // In vanilla masonry we can use a fixed aspect ratio or pre-calculated height.
      // Let's assign random heights for a true masonry feel, or base it on data.
      // For images without explicit heights, let's just make them somewhat random between 200 and 400.
      const height = item.height || (250 + Math.random() * 200); 
      const y = colHeights[col];

      colHeights[col] += height;

      return { ...item, x, y, w: columnWidth, h: height };
    });
    
    this.container.style.height = `${Math.max(...colHeights)}px`;
  }

  getInitialPosition(item) {
    const rect = this.container.getBoundingClientRect();
    let direction = this.animateFrom;

    if (direction === 'random') {
      const dirs = ['top', 'bottom', 'left', 'right'];
      direction = dirs[Math.floor(Math.random() * dirs.length)];
    }

    switch (direction) {
      case 'top': return { x: item.x, y: -200 };
      case 'bottom': return { x: item.x, y: window.innerHeight + 200 };
      case 'left': return { x: -200, y: item.y };
      case 'right': return { x: window.innerWidth + 200, y: item.y };
      case 'center': return {
        x: rect.width / 2 - item.w / 2,
        y: rect.height / 2 - item.h / 2
      };
      default: return { x: item.x, y: item.y + 100 };
    }
  }

  render() {
    if (!this.imagesReady || !this.width || !window.gsap) return;
    
    // Clear container
    this.container.innerHTML = '';
    
    this.grid.forEach((item, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'masonry-item-wrapper';
      wrapper.dataset.key = item.id;
      
      const imgDiv = document.createElement('div');
      imgDiv.className = 'masonry-item-img';
      imgDiv.style.backgroundImage = `url("${item.src}")`;
      
      wrapper.appendChild(imgDiv);
      this.container.appendChild(wrapper);

      // Event listeners
      wrapper.addEventListener('click', () => {
        if (this.onClick) this.onClick(index);
      });

      wrapper.addEventListener('mouseenter', () => {
        if (this.scaleOnHover) {
          gsap.to(wrapper, { scale: this.hoverScale, duration: 0.3, ease: 'power2.out' });
        }
      });

      wrapper.addEventListener('mouseleave', () => {
        if (this.scaleOnHover) {
          gsap.to(wrapper, { scale: 1, duration: 0.3, ease: 'power2.out' });
        }
      });

      // Animate
      const initialPos = this.getInitialPosition(item);
      const initialState = {
        opacity: 0,
        x: initialPos.x,
        y: initialPos.y,
        width: item.w,
        height: item.h,
        filter: this.blurToFocus ? 'blur(10px)' : 'none'
      };

      gsap.fromTo(wrapper, initialState, {
        opacity: 1,
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h,
        filter: this.blurToFocus ? 'blur(0px)' : 'none',
        duration: 0.8,
        ease: this.ease,
        delay: index * this.stagger
      });
    });
  }
}
