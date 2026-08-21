import "./styles.css";

const solutionsRoot = document.querySelector("[data-solutions]");
const agentToast = document.querySelector("[data-agent-toast]");

function solutionCard(solution, index) {
  const article = document.createElement("article");
  article.className = "solution-card reveal";
  article.style.setProperty("--card-index", String(index + 1).padStart(2, "0"));

  article.innerHTML = `
    <div class="solution-card__image">
      <span>${solution.category}</span>
      <img src="${solution.image}" alt="${solution.name}" loading="lazy" width="1000" height="992" />
    </div>
    <div class="solution-card__body">
      <p>${solution.range}</p>
      <h3>${solution.name}</h3>
      <p>${solution.description}</p>
      <div class="solution-card__actions">
        <button type="button">Consultar <span aria-hidden="true">→</span></button>
        <a href="${solution.url}" target="_blank" rel="noreferrer" aria-label="Ver ${solution.name} en la web oficial">
          Ficha oficial <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  `;

  const promptButton = article.querySelector("button");
  promptButton.addEventListener("click", () => openAgent(solution.prompt));

  return article;
}

async function loadSolutions() {
  try {
    const response = await fetch("/data/solutions.json");

    if (!response.ok) {
      throw new Error(`No se pudo cargar el catálogo (${response.status})`);
    }

    const solutions = await response.json();
    const fragment = document.createDocumentFragment();
    solutions.forEach((solution, index) => {
      fragment.append(solutionCard(solution, index));
    });
    solutionsRoot.append(fragment);
    observeReveals();
  } catch (error) {
    solutionsRoot.innerHTML = `
      <p class="load-error">
        El catálogo no está disponible en este momento.
        <a href="https://tejwheels.com/productos/" target="_blank" rel="noreferrer">Abrir la web oficial</a>.
      </p>
    `;
    console.error(error);
  }
}

function showAgentToast(message) {
  if (!agentToast) return;

  agentToast.textContent = message;
  agentToast.classList.add("is-visible");
  window.setTimeout(() => agentToast.classList.remove("is-visible"), 2400);
}

function findWidgetButton() {
  return document.querySelector(
    ".beyond-sherpa-widget-btn, .af-widget-btn, [data-af-widget-button], button[aria-label*='chat' i], button[aria-label*='asesor' i]",
  );
}

function getWidgetApi() {
  return (
    window.beyondSherpaWidget ||
    window.beAgentWidget ||
    window.AgentForgeWidget
  );
}

async function openAgent(prompt) {
  showAgentToast("Abriendo el Asesor TEJ Wheels…");

  const timeoutAt = Date.now() + 7000;

  while (Date.now() < timeoutAt) {
    const widgetButton = findWidgetButton();
    const widgetApi = getWidgetApi();

    if (widgetButton || widgetApi) {
      try {
        if (typeof widgetApi?.prefill === "function") {
          await widgetApi.prefill(prompt);
        }

        if (typeof widgetApi?.open === "function") {
          widgetApi.open();
        } else {
          widgetButton?.click();
        }

        return;
      } catch (error) {
        console.warn("El widget todavía no está listo", error);
      }
    }

    await new Promise((resolve) => window.setTimeout(resolve, 140));
  }

  showAgentToast("El asesor está tardando en cargar. Inténtalo de nuevo en unos segundos.");
}

document.querySelectorAll("[data-agent-prompt]").forEach((button) => {
  button.addEventListener("click", () => openAgent(button.dataset.agentPrompt));
});

const header = document.querySelector("[data-header]");
const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 36);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

let revealObserver;

function observeReveals() {
  const elements = document.querySelectorAll(".reveal:not([data-reveal-ready])");

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px" },
    );
  }

  elements.forEach((element) => {
    element.dataset.revealReady = "true";
    revealObserver.observe(element);
  });
}

document.querySelectorAll(".faq details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;

    document.querySelectorAll(".faq details[open]").forEach((other) => {
      if (other !== item) other.removeAttribute("open");
    });
  });
});

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelector(".hero__video")?.pause();
}

observeReveals();
loadSolutions();
