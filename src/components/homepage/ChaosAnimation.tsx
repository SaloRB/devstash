'use client'

import { useEffect, useRef } from 'react'

const ICON_SIZE = 96
const REPEL_RADIUS = 120
const REPEL_FORCE = 2.5
const MAX_SPEED = 1.0

interface Particle {
  el: HTMLElement
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  rotSpeed: number
  scale: number
  scaleT: number
}

const ICONS = [
  `<svg width="56" height="56" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#191919"/><path d="M5 5h14v2H5V5zm0 4h10v2H5V9zm0 4h12v2H5v-2zm0 4h8v2H5v-2z" fill="#fff" opacity=".9"/></svg>`,
  `<svg width="56" height="56" viewBox="0 0 24 24" fill="#e2e2f0"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>`,
  `<svg width="52" height="52" viewBox="0 0 24 24" fill="#007ACC"><path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"/></svg>`,
  `<svg width="56" height="56" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#1a1a2e"/><path d="M6 9l4 3-4 3" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 15h6" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  `<svg width="56" height="56" viewBox="0 0 24 24" fill="#94a3b8"><rect x="2" y="4" width="20" height="16" rx="2" stroke="#94a3b8" stroke-width="1.5" fill="none"/><path d="M2 8h20" stroke="#94a3b8" stroke-width="1.5"/><circle cx="5.5" cy="6" r="1" fill="#94a3b8"/><circle cx="8.5" cy="6" r="1" fill="#94a3b8"/></svg>`,
  `<svg width="56" height="56" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#94a3b8" stroke-width="1.5" fill="none"/><path d="M14 2v6h6" stroke="#94a3b8" stroke-width="1.5"/><path d="M8 13h8M8 17h5" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  `<svg width="56" height="56" viewBox="0 0 24 24" fill="none"><path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z" stroke="#f59e0b" stroke-width="1.5" fill="none"/></svg>`,
]

export function ChaosAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const iconEls = Array.from(container.querySelectorAll<HTMLElement>('.chaos-icon'))
    const w = () => container.offsetWidth
    const h = () => container.offsetHeight

    const particles: Particle[] = iconEls.map((el) => {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.2 + Math.random() * 0.35
      return {
        el,
        x: Math.random() * (w() - ICON_SIZE),
        y: Math.random() * (h() - ICON_SIZE),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        scale: 1,
        scaleT: Math.random() * Math.PI * 2,
      }
    })

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave)

    const tick = (ts: number) => {
      const dt = Math.min((ts - lastRef.current) / 16.67, 3)
      lastRef.current = ts
      const cw = w()
      const ch = h()
      const { x: mx, y: my } = mouseRef.current

      for (const p of particles) {
        const dx = p.x + ICON_SIZE / 2 - mx
        const dy = p.y + ICON_SIZE / 2 - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE
          p.vx += (dx / dist) * force * dt
          p.vy += (dy / dist) * force * dt
        }

        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (spd > MAX_SPEED) {
          p.vx = (p.vx / spd) * MAX_SPEED
          p.vy = (p.vy / spd) * MAX_SPEED
        }

        p.x += p.vx * dt
        p.y += p.vy * dt

        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) }
        if (p.x > cw - ICON_SIZE) { p.x = cw - ICON_SIZE; p.vx = -Math.abs(p.vx) }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) }
        if (p.y > ch - ICON_SIZE) { p.y = ch - ICON_SIZE; p.vy = -Math.abs(p.vy) }

        p.rot += p.rotSpeed * dt
        p.scaleT += 0.02 * dt
        p.scale = 0.92 + 0.1 * Math.sin(p.scaleT)

        p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg) scale(${p.scale})`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className='relative w-full h-full overflow-hidden rounded-xl border border-border/40 bg-muted/10'
    >
      {ICONS.map((svg, i) => (
        <div
          key={i}
          className='chaos-icon absolute w-24 h-24 flex items-center justify-center'
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ))}
    </div>
  )
}
