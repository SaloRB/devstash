import { describe, it, expect } from 'vitest'
import { appendTag, formatBytes } from './utils'

describe('appendTag', () => {
  it('appends tag to empty input', () => {
    expect(appendTag('', 'react')).toBe('react')
  })

  it('appends tag to existing tags', () => {
    expect(appendTag('react', 'typescript')).toBe('react, typescript')
  })

  it('appends tag to multiple existing tags', () => {
    expect(appendTag('react, typescript', 'nextjs')).toBe('react, typescript, nextjs')
  })

  it('does not duplicate an existing tag', () => {
    expect(appendTag('react, typescript', 'react')).toBe('react, typescript')
  })

  it('does not duplicate when input has extra whitespace', () => {
    expect(appendTag('react ,  typescript ', 'react')).toBe('react ,  typescript ')
  })

  it('handles whitespace-only input as empty', () => {
    expect(appendTag('  ', 'react')).toBe('react')
  })
})

describe('formatBytes', () => {
  it('returns em-dash for null', () => {
    expect(formatBytes(null)).toBe('—')
  })

  it('returns em-dash for undefined', () => {
    expect(formatBytes(undefined)).toBe('—')
  })

  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  it('formats megabytes', () => {
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.0 MB')
  })
})
