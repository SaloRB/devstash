'use client'

import { useState } from 'react'

export function useControlledDialog(
  controlledOpen?: boolean,
  controlledOnOpenChange?: (open: boolean) => void,
) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled
    ? (v: boolean) => controlledOnOpenChange?.(v)
    : setInternalOpen
  return { isControlled, open, setOpen }
}
