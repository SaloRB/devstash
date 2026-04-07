---
name: scan_components
description: Scan results for src/components/ (2026-04-07)
type: project
---

Scanned all 80 files across components/auth, collections, dashboard, favorites, homepage, items, layout, settings, shared, ui, upgrade.

## Key Findings

### Duplicate Logic
1. **Controlled dialog open/close pattern** — identical boilerplate in CreateItemDialog and CreateCollectionDialog (isControlled, internalOpen, setOpen logic). Both files lines 53-59 / 30-35.
2. **Collection edit form** — duplicated verbatim across CollectionActionsDropdown (lines 128-157) and CollectionDetailActions (lines 110-142): same Label/Input/Textarea/DialogFooter shape.
3. **handleToggleFavorite for collections** — near-identical in CollectionActionsDropdown (59-67) and CollectionDetailActions (67-77). Both call toggleFavoriteCollection, setFavorited, router.refresh, toast.error with same error shape.
4. **handleSave for collections** — near-identical in CollectionActionsDropdown (69-80) and CollectionDetailActions (54-65). Same updateCollection call, setSaving, toast, setEditOpen, router.refresh.
5. **handleDelete for collections** — near-identical in CollectionActionsDropdown (82-93) and CollectionDetailActions (79-89). Same deleteCollection call, setDeleting, toast pattern.
6. **SuggestTagsButton onAcceptTag logic** — exact same tag dedup/append pattern in CreateItemDialog (247-251) and ItemDrawer EditMode (531-535).
7. **freeFeatures / proFeatures arrays** — defined identically in PricingCards.tsx and UpgradePricingCards.tsx.
8. **Auth form page shell** — `div.flex.min-h-screen.items-center.justify-center.bg-background.px-4 > div.w-full.max-w-sm > Card` repeated in SignInForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm (all 4 auth forms).
9. **ItemsList section pattern** — PinnedItems and RecentItems are structurally identical: auth(), fetch items, EmptyState or map ItemCard. Only icon, query fn, and heading text differ.
10. **error display pattern** — `{error && <p className="text-sm text-destructive">{error}</p>}` appears in all 4 auth forms + ChangePasswordForm + DeleteAccountButton.
11. **ItemIcon inline lookup** — `ICON_MAP[icon] ?? ICON_MAP['Code']` resolved in ItemCard (line 47), FavoriteItems (line 10-11), ItemDrawer (line 610), CreateItemDialog (lines 117, 134), ItemTypeIcon. Consolidated in ItemTypeIcon but not used everywhere.
12. **Colored icon container** — `div.flex.size-N.items-center.justify-center.rounded-md` with `backgroundColor: color+'15'` appears in ItemCard, ItemDrawer header, StatsCards (15%), CollectionCard typeIcons (20%), ItemTypeIcon (25%). Slightly different sizes/opacities — same pattern.

### Near-Duplicate Patterns
1. **FavoriteItems / FavoriteCollections** — same section shell (font-mono, uppercase header with count, divide-y list, button row with icon + title + badge + relativeDate). Could be a generic FavoriteList component.
2. **dashboard section header** — `div.mb-4.flex.items-center.{gap-2 or justify-between} > h2.text-lg.font-semibold` used in PinnedItems, RecentItems, RecentCollections. Could be a SectionHeader component.
3. **UpgradePricingCards vs PricingCards** — nearly identical card markup; UpgradePricingCards embeds the yearly toggle and Stripe checkout call while PricingCards receives isYearly as a prop and uses Link CTAs. freeFeatures/proFeatures arrays are verbatim duplicates.
4. **handleUpgrade fetch pattern** — BillingSection (handleUpgrade fn) and UpgradePricingCards (handleUpgrade fn) both POST to /api/stripe/checkout and redirect on data.url.
5. **toast.error error coercion** — `typeof result.error === 'string' ? result.error : 'Fallback'` repeated in CollectionActionsDropdown (3×), CollectionDetailActions (3×). Already extracted in actions/ as toastError but not used in components.
6. **Language Select** — identical Select markup for CODE_LANGUAGES in CreateItemDialog (195-214) and ItemDrawer EditMode (473-494). Same value/onValueChange/label lookup logic.

### Extraction Candidates
1. **`useControlledDialog` hook** — the isControlled/internalOpen/setOpen pattern in CreateItemDialog + CreateCollectionDialog → `hooks/use-controlled-dialog.ts`
2. **`AuthPageShell` component** — the centering wrapper (`flex min-h-screen items-center justify-center...`) used by all 4 auth forms → `components/auth/AuthPageShell.tsx`
3. **`SectionHeader` component** — the mb-4 flex header with title+optional right slot → `components/shared/SectionHeader.tsx`
4. **`useCollectionActions` hook** — handleSave, handleDelete, handleToggleFavorite + their loading states shared between CollectionActionsDropdown and CollectionDetailActions → `hooks/use-collection-actions.ts`
5. **`CollectionEditDialog` component** — the edit Dialog content (name/description fields + footer) duplicated between the two collection components → `components/collections/CollectionEditDialog.tsx`
6. **`LanguageSelect` component** — the CODE_LANGUAGES select in CreateItemDialog + ItemDrawer EditMode → `components/shared/LanguageSelect.tsx`
7. **`PricingPlanCards` shared component** — extract freeFeatures/proFeatures + card markup into a single component consumed by both homepage and upgrade pages.
8. **`appendTag` utility** — the tag dedup/append one-liner in CreateItemDialog + ItemDrawer → `lib/utils.ts`

### Already Well-Organized
- components/shared/EmptyState.tsx — used correctly everywhere
- components/shared/ItemTypeIcon.tsx — exists but ItemCard still does its own ICON_MAP lookup instead of using it
- components/shared/ItemContentField.tsx — good single abstraction for content field switching
- components/ui/ — all shadcn primitives, no issues
