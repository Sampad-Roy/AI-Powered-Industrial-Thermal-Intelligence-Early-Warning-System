import { useEffect, useRef } from 'react'

/**
 * useScrollReveal — attaches an IntersectionObserver to the returned `ref`.
 * All direct/descendant elements with the `.reveal` class will have
 * `.reveal-visible` toggled when they enter the viewport.
 *
 * Fully respects `prefers-reduced-motion`: when the user has that preference
 * set, the observer is never attached and elements render immediately visible.
 *
 * @param {object} options
 * @param {number} options.threshold  – 0–1, default 0.15
 * @param {string} options.rootMargin – e.g. "0px 0px -60px 0px"
 */
export function useScrollReveal({
  threshold = 0.02,
  rootMargin = '0px 0px 80px 0px',
} = {}) {
  const ref = useRef(null)

  useEffect(() => {
    // Immediately make all reveal elements visible if reduced motion is preferred
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      const container = ref.current
      if (!container) return
      container.querySelectorAll('.reveal, .reveal-scale, .pipeline-line').forEach((el) => el.classList.add('reveal-visible'))
      return
    }

    const container = ref.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            // Unobserve once visible — animation only plays once
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )

    const targets = container.querySelectorAll('.reveal, .reveal-scale, .pipeline-line')
    targets.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return ref
}
