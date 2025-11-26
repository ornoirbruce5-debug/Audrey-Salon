/* main.js
  - Dark mode toggle
  - Render products with animation
  - Daily Joke spinner (Kirundi), non-repeating via localStorage
  - Service Worker registration + Install prompt banner
  - Progressive enhancements, no backend
*/

(function(){
  // Dark Mode
  const themeToggle = document.getElementById('themeToggle');
  const THEME_KEY = 'audrey_theme';
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'dark') document.body.classList.add('dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem(THEME_KEY, document.body.classList.contains('dark') ? 'dark' : 'light');
    });
  }

  // Render Products
  const productGrid = document.getElementById('productGrid');

  function stockClass(stock) {
    if (stock <= 0) return 'stock-out';
    if (stock <= 3) return 'stock-low';
    return 'stock-ok';
  }

  function renderProducts(items = window.PRODUCTS || []) {
    if (!productGrid) return;
    productGrid.innerHTML = '';
    items.forEach((p, idx) => {
      const el = document.createElement('article');
      el.className = 'card';
      el.style.animationDelay = `${idx * 80}ms`;
      el.innerHTML = `
        <img class="card__img" src="${p.image}" alt="${p.name}" />
        <div class="card__body">
          <h3 class="card__title">${p.name}</h3>
          <div class="card__meta">
            <span class="price">${p.price}</span>
            <span class="${stockClass(p.stock)}">Stock: ${p.stock}</span>
            <span>Category: ${p.category}</span>
          </div>
          <p>${p.description}</p>
        </div>
      `;
      productGrid.appendChild(el);
    });
  }

  // Jokes non-repeating
  const JOKES_KEY = 'broskie_jokes_used';
  const jokeText = document.getElementById('jokeText');
  const newJokeBtn = document.getElementById('newJokeBtn');
  const resetJokesBtn = document.getElementById('resetJokesBtn');

  function getUsedSet() {
    try {
      const arr = JSON.parse(localStorage.getItem(JOKES_KEY) || '[]');
      return new Set(arr);
    } catch { return new Set(); }
  }
  function saveUsedSet(set) {
    localStorage.setItem(JOKES_KEY, JSON.stringify(Array.from(set)));
  }
  function getNextJoke() {
    const all = window.JOKES_KIR || [];
    const used = getUsedSet();
    const remaining = all.filter((_, idx) => !used.has(idx));
    if (remaining.length === 0) {
      if (jokeText) jokeText.textContent = "Ibinobe vyose birangiye! Kanda 'Subira ku ntangiriro' kugira utangure bushasha.";
      return null;
    }
    const choiceIndex = Math.floor(Math.random() * remaining.length);
    const joke = remaining[choiceIndex];
    const originalIndex = all.indexOf(joke);
    used.add(originalIndex);
    saveUsedSet(used);
    return joke;
  }

  if (newJokeBtn) {
    newJokeBtn.addEventListener('click', () => {
      const joke = getNextJoke();
      if (joke && jokeText) jokeText.textContent = joke;
    });
  }

  if (resetJokesBtn) {
    resetJokesBtn.addEventListener('click', () => {
      localStorage.removeItem(JOKES_KEY);
      if (jokeText) jokeText.textContent = "Subiriye ku ntangiriro. Fyonda 'Hindura' kugira ubone ikinobe gishasha.";
    });
  }

  // Init
  renderProducts();

  // Service Worker Registration
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js")
        .then(reg => console.log("✅ SW registered:", reg.scope))
        .catch(err => console.error("❌ SW failed:", err));
    });
  }

  // Install Prompt Banner
  let deferredPrompt;
  const installBanner = document.getElementById("installBanner");
  const installBtn = document.getElementById("installBtn");

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBanner) installBanner.classList.remove("hidden");
  });

  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      console.log("User choice:", choiceResult.outcome);
      deferredPrompt = null;
      if (installBanner) installBanner.classList.add("hidden");
    });
  }
})();
