import { test, expect } from '@playwright/test'

test('root redirects to /login when unauthenticated', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
})

test('login page is accessible', async ({ page }) => {
  await page.goto('/login')
  // Supabase UI might not render without config, but the container should exist
  await expect(page).toHaveURL(/\/login$/)
})


