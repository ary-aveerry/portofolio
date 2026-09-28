const navbar = document.querySelector("nav");
const navigationLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const revealElements = document.querySelectorAll(
    "#home .intro-text, #home .intro-image, .section-title, .offer-box, .graduate-card, .hobby-card"
);

document.documentElement.classList.add("js-enabled");

const updateNavbar = () => {
    navbar?.classList.toggle("is-scrolled", window.scrollY > 40);
};

let scrollUpdateScheduled = false;
window.addEventListener(
    "scroll",
    () => {
        if (scrollUpdateScheduled) return;

        scrollUpdateScheduled = true;
        window.requestAnimationFrame(() => {
            updateNavbar();
            scrollUpdateScheduled = false;
        });
    },
    { passive: true }
);
updateNavbar();

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.15 }
    );

    revealElements.forEach((element) => {
        element.setAttribute("data-reveal", "");
        revealObserver.observe(element);
    });

    const sections = navigationLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);
    const visibleSections = new Map();

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    visibleSections.set(entry.target.id, entry.intersectionRatio);
                } else {
                    visibleSections.delete(entry.target.id);
                }
            });

            const activeSection = [...visibleSections.entries()].sort(
                (a, b) => b[1] - a[1]
            )[0]?.[0];

            navigationLinks.forEach((link) => {
                if (link.hash === `#${activeSection}`) {
                    link.setAttribute("aria-current", "location");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        },
        {
            rootMargin: "-20% 0px -60% 0px",
            threshold: [0, 0.25, 0.5, 0.75, 1],
        }
    );

    sections.forEach((section) => sectionObserver.observe(section));
} else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
}

/* -- Interactive: pointer / touch / keyboard support -- */
const interactiveSelector = '.offer-box, .hobby-card, .intro-image, .graduate-card, .social-link';
const interactiveEls = [...document.querySelectorAll(interactiveSelector)];

interactiveEls.forEach((el) => {
    // allow keyboard focus if not naturally focusable
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

    el.addEventListener('pointerenter', () => el.classList.add('is-hover'));
    el.addEventListener('pointerleave', () => el.classList.remove('is-hover'));
    el.addEventListener('focus', () => el.classList.add('is-hover'));
    el.addEventListener('blur', () => el.classList.remove('is-hover'));
});

// For touch devices: toggle hover on tap, and close when tapping elsewhere
const isTouch = ('ontouchstart' in window) || window.matchMedia('(hover: none)').matches;
if (isTouch) {
    document.addEventListener('click', (ev) => {
        const target = ev.target instanceof Element ? ev.target.closest(interactiveSelector) : null;
        if (target) {
            // if user tapped a link inside, let link behavior happen
            if (ev.target.closest('a')) return;

            // toggle only the tapped element; remove from others
            const was = target.classList.contains('is-hover');
            interactiveEls.forEach((e) => e.classList.remove('is-hover'));
            if (!was) target.classList.add('is-hover');
        } else {
            interactiveEls.forEach((e) => e.classList.remove('is-hover'));
        }
    }, { passive: true });
}
