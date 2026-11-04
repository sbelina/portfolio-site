import { useEffect, useRef, useState } from 'react'

/** Shared compact-header measurements for current and retained home experiences. */
export function usePublicHeader() {
  const header = useRef<HTMLElement>(null)
  const [compactHeader, setCompactHeader] = useState(false)
  const [headerMeasured, setHeaderMeasured] = useState(false)
  const [oversizedHeader, setOversizedHeader] = useState(false)

  useEffect(() => {
    // Hysteresis prevents the change in header height from toggling its own state.
    const update = () => {
      const index = document.getElementById('index')
      const distance = window.scrollY - (index?.offsetTop ?? 0)
      setCompactHeader(current => current ? distance > 48 : distance > 120)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    const element = header.current
    if (!element) return
    const measure = () => {
      const height = element.getBoundingClientRect().height
      const oversized = height > window.innerHeight * .45
      document.documentElement.style.setProperty('--site-header-height', `${oversized ? 0 : height}px`)
      setOversizedHeader(oversized)
      setHeaderMeasured(true)
    }
    measure()
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null
    observer?.observe(element)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      document.documentElement.style.removeProperty('--site-header-height')
    }
  }, [])

  return { header, compactHeader, headerMeasured, oversizedHeader }
}
