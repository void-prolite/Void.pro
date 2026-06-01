// Spring Physics Variables for Scroll
let currentScroll = 0;
let targetScroll = 0;
let velocity = 0;

// Spring config for the bouncy feel
const spring = 0.04;    // Stiffness
const friction = 0.85;  // Damping (closer to 1 = more bouncy/oscillating)

// Entry Animation Variables
let entryProgress = 0;
let entryVelocity = 0;
const entrySpring = 0.008; // Lower spring for a slower, graceful pull
const entryFriction = 0.90; // Higher friction for a smooth, floating settle
let siteStarted = false; // Controls when physics kick in

// Elements
let card1, card2, card3, card4;
let nav, heroContent, heroVisuals, scrollTrack, desktopDisclaimer;

document.addEventListener('DOMContentLoaded', () => {
  card1 = document.querySelector('.card-1'); // Top card
  card2 = document.querySelector('.card-2');
  card3 = document.querySelector('.card-3');
  card4 = document.querySelector('.card-4'); // Bottom card
  nav = document.querySelector('nav');
  heroContent = document.querySelector('.hero-content');
  heroVisuals = document.querySelector('.hero-visuals');
  scrollTrack = document.querySelector('.scroll-track');
  desktopDisclaimer = document.querySelector('.desktop-disclaimer');

  // Typewriter Engine with Cursor
  function runTypewriter(element, delaySeconds) {
    if(!element) return;
    
    function processNode(node) {
      if (node.nodeType === 3 && node.textContent.trim().length > 0) {
        let text = node.textContent;
        let newHtml = '';
        let tokens = text.split(/(\s+)/); // Split by whitespace while preserving it
        for (let w of tokens) {
          if (w.trim() === '') {
            // Space token
            for (let c of w) {
              newHtml += `<span class="char">&nbsp;</span>`;
            }
          } else {
            // Word wrapper to prevent mid-word line breaking
            newHtml += `<span style="display: inline-block; white-space: nowrap;">`;
            for (let c of w) {
              newHtml += `<span class="char">${c}</span>`;
            }
            newHtml += `</span>`;
          }
        }
        let wrapper = document.createElement('span');
        wrapper.innerHTML = newHtml;
        node.replaceWith(wrapper);
      } else if (node.nodeType === 1) {
        Array.from(node.childNodes).forEach(processNode);
      }
    }
    
    Array.from(element.childNodes).forEach(processNode);
    
    // JS-based sequential reveal
    setTimeout(() => {
      let chars = element.querySelectorAll('.char');
      if(chars.length === 0) return;
      
      let cursorEl = document.createElement('span');
      cursorEl.className = 'type-cursor-inline';
      
      let i = 0;
      let interval = setInterval(() => {
        if (i >= chars.length) {
          clearInterval(interval);
          setTimeout(() => cursorEl.remove(), 1000); // Remove cursor after 1s
          return;
        }
        chars[i].classList.add('revealed');
        chars[i].after(cursorEl); // Physically move the cursor element in the DOM
        i++;
      }, 25);
    }, delaySeconds * 1000);
  }

  const h1 = document.querySelector('.hero h1');
  const p = document.querySelector('.hero p');
  
  const startBtn = document.getElementById('start-btn');
  const fake404 = document.getElementById('fake-404');

  let hasVisited = sessionStorage.getItem('visited');

  if (startBtn && fake404 && !hasVisited) {
    // Hide scrolling initially
    document.body.style.overflow = 'hidden';
    
    startBtn.addEventListener('click', () => {
      fake404.classList.add('dismissed');
      document.body.style.overflow = ''; // Restore scrolling
      siteStarted = true; // Unlock physics
      sessionStorage.setItem('visited', 'true'); // Save state to prevent re-triggering on refresh
      runTypewriter(h1, 0.2); 
      runTypewriter(p, 0.8);  
    });
  } else {
    // Already visited or fallback
    if(fake404) fake404.style.display = 'none';
    document.body.style.overflow = '';
    siteStarted = true;
    runTypewriter(h1, 0.2); 
    runTypewriter(p, 0.8);  
  }

  // Start the animation loop
  requestAnimationFrame(render);

  // Custom Cursor Logic
  const cursor = document.querySelector('.cursor');
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  
  if(cursor) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function renderCursor() {
      // Lerp for smooth trailing effect
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover logic for stack-cards
    const stackCards = document.querySelectorAll('.stack-card');
    stackCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
      });
      card.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
      });
    });
  }

  // Service Cards Highlight Effect
  const serviceCards = document.querySelectorAll('.service-tier');
  serviceCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Page Transition Logic
  const transitionLinks = document.querySelectorAll('.transition-link');
  const transitionOverlay = document.getElementById('page-transition-overlay');
  
  if (transitionOverlay && transitionLinks.length > 0) {
    transitionLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const rect = link.getBoundingClientRect();
        const clickX = e.clientX || (rect.left + rect.width / 2);
        const clickY = e.clientY || (rect.top + rect.height / 2);
        
        // Set initial position instantly without transition
        transitionOverlay.style.transition = 'none';
        transitionOverlay.style.top = `${clickY}px`;
        transitionOverlay.style.left = `${clickX}px`;
        transitionOverlay.style.transform = `translate(-50%, -50%) scale(0)`;
        
        // Force reflow
        void transitionOverlay.offsetWidth;
        
        // Restore transition and animate to full screen
        transitionOverlay.style.transition = '';
        transitionOverlay.style.transform = `translate(-50%, -50%) scale(1)`;
        transitionOverlay.classList.add('expanding');
        
        // Redirect just before animation comes to a complete halt
        setTimeout(() => {
          window.location.href = link.href;
        }, 2600);
      });
    });
  }

  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });

  // Web3Forms AJAX Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);
      
      const btn = contactForm.querySelector('.submit-btn');
      const originalText = btn.innerText;
      btn.innerText = "Sending...";
      btn.style.pointerEvents = "none";

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      })
      .then(async (response) => {
        let jsonRes = await response.json();
        if (response.status == 200) {
          btn.innerText = "Message Sent!";
          btn.style.background = "#10b981"; // success green
          contactForm.reset();
          setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = "var(--text-main)";
            btn.style.pointerEvents = "auto";
          }, 4000);
        } else {
          console.log(response);
          btn.innerText = "Error. Try again.";
          btn.style.background = "#ef4444"; // error red
          btn.style.pointerEvents = "auto";
        }
      })
      .catch(error => {
        console.log(error);
        btn.innerText = "Something went wrong!";
        btn.style.background = "#ef4444";
        btn.style.pointerEvents = "auto";
      });
    });
  }
});

// Update target scroll on wheel/touch
window.addEventListener('scroll', () => {
  targetScroll = window.scrollY;
});

// Helper for mapping ranges
function mapRange(value, inMin, inMax, outMin, outMax) {
  let mapped = ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  return Math.max(Math.min(mapped, Math.max(outMin, outMax)), Math.min(outMin, outMax));
}

function render() {
  // Spring Physics for Scroll
  let diff = targetScroll - currentScroll;
  velocity += diff * spring;
  velocity *= friction;
  currentScroll += velocity;

  if (Math.abs(velocity) < 0.01 && Math.abs(diff) < 0.01) {
    currentScroll = targetScroll;
    velocity = 0;
  }

  // Spring Physics for Entry Animation
  if (siteStarted) {
    let entryDiff = 1 - entryProgress;
    entryVelocity += entryDiff * entrySpring;
    entryVelocity *= entryFriction;
    entryProgress += entryVelocity;
    if (Math.abs(entryVelocity) < 0.001 && Math.abs(entryDiff) < 0.001) {
      entryProgress = 1;
      entryVelocity = 0;
    }
  }

  // Calculate global scroll progress relative to the scroll track
  let trackTop = 0;
  let trackHeight = 0;
  if(scrollTrack) {
    trackTop = scrollTrack.offsetTop;
    trackHeight = scrollTrack.offsetHeight - window.innerHeight; // The scrollable amount
  }
  
  let scrollProgress = 0;
  if (trackHeight > 0) {
    // 0 = top of track, 1 = bottom of track
    scrollProgress = Math.max(0, Math.min((currentScroll - trackTop) / trackHeight, 1));
  }

  // --- Sticky Sequence Animation ---
  if (card1 && card2 && card3 && card4 && heroContent) {
    
    // 1. Text Fade Out & Blur (0.0 to 0.15)
    let textOpacity = mapRange(scrollProgress, 0, 0.15, 1, 0);
    let textY = mapRange(scrollProgress, 0, 0.15, 0, -50);
    let textBlur = mapRange(scrollProgress, 0, 0.15, 0, 15);
    heroContent.style.opacity = textOpacity;
    heroContent.style.transform = `translateY(${textY}px)`;
    heroContent.style.filter = `blur(${textBlur}px)`;
    heroContent.style.pointerEvents = scrollProgress > 0.1 ? 'none' : 'auto';

    // 2. Container Move to Center (0.0 to 0.25)
    // When text fades, visual container expands to center
    let centerShift = mapRange(scrollProgress, 0, 0.25, 0, -250); // Shift left towards center
    heroVisuals.style.transform = `translateX(${centerShift}px)`;

    // 3. Initial Stack to Flat Stack (0.0 to 0.25)
    // Card 1 (Top)
    let c1R = mapRange(scrollProgress, 0, 0.25, -5, 0);
    let c1X = mapRange(scrollProgress, 0, 0.25, -20, 0);
    let c1Y = mapRange(scrollProgress, 0, 0.25, 10, 0);
    
    // Card 2
    let c2R = mapRange(scrollProgress, 0, 0.25, 8, 0);
    let c2X = mapRange(scrollProgress, 0, 0.25, 20, 0);
    let c2Y = mapRange(scrollProgress, 0, 0.25, -10, 0);
    
    // Card 3
    let c3R = mapRange(scrollProgress, 0, 0.25, -2, 0);
    
    // Card 4
    let c4R = mapRange(scrollProgress, 0, 0.25, 4, 0);

    // 4. Sequential Unstacking
    // Card 1 Fly away (0.3 to 0.5)
    let c1FlyY = mapRange(scrollProgress, 0.3, 0.5, 0, -800);
    let c1FlyR = mapRange(scrollProgress, 0.3, 0.5, 0, -20);
    let c1Opacity = mapRange(scrollProgress, 0.45, 0.5, 1, 0);
    
    // Card 2 Fly away (0.55 to 0.75)
    let c2FlyY = mapRange(scrollProgress, 0.55, 0.75, 0, -800);
    let c2FlyR = mapRange(scrollProgress, 0.55, 0.75, 0, 15);
    let c2Opacity = mapRange(scrollProgress, 0.7, 0.75, 1, 0);

    // Card 3 Fly away (0.8 to 1.0)
    let c3FlyY = mapRange(scrollProgress, 0.8, 1.0, 0, -800);
    let c3FlyR = mapRange(scrollProgress, 0.8, 1.0, 0, -10);
    let c3Opacity = mapRange(scrollProgress, 0.95, 1.0, 1, 0);

    // Final scroll targets
    let t1X = c1X; let t1Y = c1Y + c1FlyY; let t1R = c1R + c1FlyR;
    let t2X = c2X; let t2Y = c2Y + c2FlyY; let t2R = c2R + c2FlyR;
    let t3X = 0;   let t3Y = c3FlyY;       let t3R = c3R + c3FlyR;
    let t4X = 0;   let t4Y = 0;            let t4R = c4R;

    // Corner starts (relative to center)
    let w = window.innerWidth;
    let h = window.innerHeight;
    
    // Lerp from corners based on entryProgress
    let f1X = (-w) + (t1X - (-w)) * entryProgress;
    let f1Y = (-h) + (t1Y - (-h)) * entryProgress;
    let f1R = (-90) + (t1R - (-90)) * entryProgress;

    let f2X = (w) + (t2X - (w)) * entryProgress;
    let f2Y = (-h) + (t2Y - (-h)) * entryProgress;
    let f2R = (90) + (t2R - (90)) * entryProgress;

    let f3X = (-w) + (t3X - (-w)) * entryProgress;
    let f3Y = (h) + (t3Y - (h)) * entryProgress;
    let f3R = (-90) + (t3R - (-90)) * entryProgress;

    let f4X = (w) + (t4X - (w)) * entryProgress;
    let f4Y = (h) + (t4Y - (h)) * entryProgress;
    let f4R = (90) + (t4R - (90)) * entryProgress;

    // Apply combined transforms
    let entryBlur = (1 - entryProgress) * 20; // Starts at 20px blur, settles to 0px

    card1.style.transform = `translate(${f1X}px, ${f1Y}px) rotate(${f1R}deg)`;
    card1.style.opacity = c1Opacity * entryProgress; 
    card1.style.filter = `blur(${entryBlur}px)`;

    card2.style.transform = `translate(${f2X}px, ${f2Y}px) rotate(${f2R}deg)`;
    card2.style.opacity = c2Opacity * entryProgress;
    card2.style.filter = `blur(${entryBlur}px)`;

    card3.style.transform = `translate(${f3X}px, ${f3Y}px) rotate(${f3R}deg)`;
    card3.style.opacity = c3Opacity * entryProgress;
    card3.style.filter = `blur(${entryBlur}px)`;

    card4.style.transform = `translate(${f4X}px, ${f4Y}px) rotate(${f4R}deg)`;
    card4.style.opacity = entryProgress;
    card4.style.filter = `blur(${entryBlur}px)`;

    // Scale up slightly to make them feel immersive when centered
    let globalScale = mapRange(scrollProgress, 0, 0.3, 1, 1.3);
    document.querySelector('.cards-stack').style.transform = `scale(${globalScale})`;

    // Animate Desktop Disclaimer
    if (desktopDisclaimer) {
      let disclaimerOpacity = 0;
      if (scrollProgress > 0.2 && scrollProgress < 0.95) {
        disclaimerOpacity = mapRange(scrollProgress, 0.2, 0.25, 0, 1); // Fade in
      } else if (scrollProgress >= 0.95) {
        disclaimerOpacity = mapRange(scrollProgress, 0.95, 1.0, 1, 0); // Fade out at end
      }
      desktopDisclaimer.style.opacity = disclaimerOpacity;
    }
  }

  // --- Navbar Logic ---
  if (nav) {
    if (currentScroll > 50) {
      nav.style.transform = 'translateY(-10px)';
      nav.style.background = 'rgba(255, 255, 255, 0.85)';
      nav.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
    } else {
      nav.style.transform = 'translateY(0)';
      nav.style.background = 'rgba(255, 255, 255, 0.7)';
      nav.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
    }
  }

  // Loop
  requestAnimationFrame(render);
}
