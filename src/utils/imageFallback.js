// A tiny inline SVG placeholder (a plate/fork glyph) shown when a recipe
// photo fails to load — no extra asset file, no network request of its
// own, and it can never itself 404.
const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23262b23'/%3E%3Ccircle cx='100' cy='95' r='38' fill='none' stroke='%235a6350' stroke-width='4'/%3E%3Cpath d='M70 60v35M78 60v35M78 78h-8M126 60v70' stroke='%235a6350' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E";

// Usage: <img src={meal.imageUrl} onError={onImageError} ... />
// Guards against an infinite loop if the fallback itself were ever to
// error by only swapping the src once.
export function onImageError(e) {
  if (e.currentTarget.src === FALLBACK_IMAGE) return;
  e.currentTarget.src = FALLBACK_IMAGE;
}
