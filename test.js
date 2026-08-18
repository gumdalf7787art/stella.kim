const fs = require('fs');
const masonryCode = fs.readFileSync('vanillaMasonry.js', 'utf8').replace('export class VanillaMasonry', 'class VanillaMasonry');
const script = `
  ${masonryCode}
  
  // Mocks
  global.window = {
    innerWidth: 1000,
    innerHeight: 800,
    gsap: {
      fromTo: (el, from, to) => { el.style.opacity = to.opacity; }
    }
  };
  global.gsap = global.window.gsap;
  
  class MockResizeObserver {
    observe(el) {
      this.cb([{ contentRect: { width: 1000 } }]);
    }
    constructor(cb) { this.cb = cb; }
  }
  global.ResizeObserver = MockResizeObserver;
  
  global.document = {
    createElement: (tag) => ({ className: '', style: {}, dataset: {}, appendChild: () => {}, addEventListener: () => {} }),
    querySelector: () => ({ style: {}, appendChild: (el) => { console.log('Appended child:', el.className); } })
  };
  
  global.Image = class {
    set src(v) { setTimeout(() => this.onload(), 10); }
  };
  
  const masonry = new VanillaMasonry('#masonry-container', { items: [{src: '1.jpg', id: '1'}] });
  
  setTimeout(() => console.log('Done test.'), 100);
`;
eval(script);
