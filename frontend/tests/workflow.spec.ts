import { test, expect, type Page } from '@playwright/test';

const email = process.env.TEST_ADMIN_EMAIL || 'local-admin@example.test';
const password = process.env.TEST_ADMIN_PASSWORD || 'LocalTest!234';

async function login(page: Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in securely' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Business overview' })).toBeVisible();
}

test('authenticated admin sidebar, filters and inventory preview/save at desktop and mobile sizes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await login(page);
  for (const width of [360, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/admin');
    await expect(page.getByRole('link', { name: 'Pending orders' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Low stock' })).toBeVisible();
    if (width < 850) {
      const trigger = page.getByRole('button', { name: 'Open navigation menu' });
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: 'Admin navigation' });
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await trigger.click();
      await dialog.locator('a[href="/admin/orders"]').click();
      await expect(page).toHaveURL(/\/admin\/orders$/);
      await trigger.click();
      await dialog.locator('a[href="/admin/inventory"]').click();
      await expect(page).toHaveURL(/\/admin\/inventory$/);
    }

    await page.goto('/admin');
    await page.getByRole('link', { name: 'Pending orders' }).click();
    await expect(page).toHaveURL(/\/admin\/orders\?status=new/);
    await expect(page.locator('select').first()).toHaveValue('new');
    if (width < 768) await expect(page.locator('.mobile-order-card').filter({ hasText: 'Fixture buyer' }).first()).toBeVisible();
    else await expect(page.locator('tbody').getByText('Fixture buyer').first()).toBeVisible();
    await page.getByLabel('Search orders by reference, customer or mobile number').fill('no-such-local-order');
    if (width < 768) await expect(page.locator('.mobile-order-card')).toHaveCount(0); else await expect(page.locator('.table-wrap tbody tr')).toHaveCount(0);
    await page.screenshot({ path: `test-results/admin-orders-${width}.png`, fullPage: true });

    await page.goto('/admin');
    await page.getByRole('link', { name: 'Low stock' }).click();
    await expect(page).toHaveURL(/\/admin\/inventory\?filter=low/);
    await expect(page.getByRole('heading', { name: 'Inventory', exact: true })).toBeVisible();
    await page.goto('/admin/inventory?filter=low');
    await expect(page.locator('select').first()).toHaveValue('low');
    await expect(page.getByText('TEST-CHUI-THIN').first()).toBeVisible();
    if (width === 360) {
      await page.locator('.table-wrap').first().evaluate(element => { element.scrollLeft = element.scrollWidth; });
      await page.getByRole('button', { name: 'Adjust' }).first().click();
      await expect(page.getByText(/Current physical stock: 4/)).toBeVisible();
      await page.getByLabel(/Action/).selectOption('add');
      await page.getByLabel(/Quantity/).fill('1');
      await expect(page.getByText(/After this change: 5/)).toBeVisible();
      await page.getByRole('button', { name: 'Cancel' }).click();
      await expect(page.getByText('TEST-CHUI-THIN')).toBeVisible();
      await page.getByRole('button', { name: 'Adjust' }).first().click();
      await page.getByLabel(/Action/).selectOption('add');
      await page.getByLabel(/Quantity/).fill('2');
      await page.getByLabel(/Reason/).fill('Playwright local stock fixture');
      await expect(page.getByText(/After this change: 6/)).toBeVisible();
      await page.getByRole('button', { name: 'Save & update stock' }).click();
      await expect(page.getByText('Stock updated.')).toBeVisible();
      await expect(page.getByText('TEST-CHUI-THIN')).toBeVisible();
      const history = page.getByText('Playwright local stock fixture');
      await expect(history).toBeVisible();
      await page.goto('/admin/inventory?filter=low');
      await expect(page.locator('.table-wrap').first()).toContainText('No records yet.');
    }
    await page.screenshot({ path: `test-results/admin-inventory-${width}.png`, fullPage: true });

    await page.goto('/admin/orders');
    const table = page.locator('.table-wrap').first();
    if (width < 768) await expect(page.locator('.mobile-order-card').first()).toBeVisible();
    else await expect(table.locator('tbody tr').first()).toBeVisible();
    if (width < 850) {
      const lastAction = width < 768
        ? page.locator('.mobile-order-card').first().locator('a[href^="/admin/orders/"]').last()
        : table.locator('tbody tr').first().locator('td').last().getByRole('link').last();
      if (width >= 768) await table.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
      await expect(lastAction).toBeVisible();
      await lastAction.click();
      await expect(page).toHaveURL(/\/admin\/orders\/\d+$/);
      await page.goBack();
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  }
});

test('customer checkout preserves distinct variants through order detail and invoice', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  let savedOrder: Record<string, number | string> | undefined;
  let orderResponseStatus = 0;
  page.on('response', async response => {
    if (response.url().includes('/api/orders') && response.request().method() === 'POST') {
      orderResponseStatus = response.status();
      if (response.ok()) savedOrder = await response.json();
    }
  });
  await page.goto('/products/chui-jhal');
  await page.getByRole('button', { name: /Chikon/ }).click();
  await page.locator('main').getByRole('button', { name: 'Add to Cart', exact: true }).first().click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: /Mota/ }).click();
  await page.locator('main').getByRole('button', { name: 'Add to Cart', exact: true }).first().click();
  const drawer = page.getByRole('complementary', { name: 'Shopping Cart' });
  await expect(drawer.getByText('(Chikon)')).toBeVisible();
  await expect(drawer.getByText('(Mota)')).toBeVisible();
  await drawer.getByRole('button', { name: 'Increase quantity' }).first().click();
  await expect(drawer.getByRole('button', { name: 'Increase quantity' }).first().locator('xpath=preceding-sibling::span')).toHaveText('2');
  await drawer.getByRole('button', { name: 'Remove Test chui jhal' }).last().click();
  await expect(drawer.getByText('(Chikon)')).toBeVisible();
  await expect(drawer.getByText('(Mota)')).toHaveCount(0);
  await drawer.getByRole('link', { name: /Checkout/i }).click();
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  await expect(page.getByText(/1,600\.00 BDT/)).toBeVisible();
  await expect(page.getByText('৳60.00 BDT', { exact: true })).toBeVisible();
  await expect(page.getByText(/1,660\.00 BDT/)).toBeVisible();
  await page.getByLabel('Customer name').fill('Local checkout customer');
  await page.getByLabel(/Mobile phone/).fill('01987654321');
  await page.getByLabel(/Full delivery address/).fill('House 12, Road 3, Dhanmondi');
  await page.getByLabel('I have read and agree to the Terms and Conditions, Privacy Policy & Refund and Return Policy.').check().catch(async () => page.locator('#terms-checkbox').check());
  await expect.poll(() => page.locator('form.grid').evaluate(form => (form as HTMLFormElement).checkValidity())).toBe(true);
  await page.getByRole('button', { name: 'PLACE ORDER' }).click();
  await expect.poll(() => savedOrder?.total, { message: `order POST returned HTTP ${orderResponseStatus}` }).toBe(166000);
  await expect(page.getByText(/Your Order Has Been Placed/)).toBeVisible();

  await login(page);
  await page.goto('/admin/orders');
  const orders = await page.evaluate(async () => (await fetch('/api/admin/orders')).json());
  const created = orders.find((order: { phone: string }) => order.phone === '01987654321');
  expect(created).toBeTruthy();
  await page.goto(`/admin/orders/${created.id}`);
  await expect(page.locator('.invoice-products-table')).toContainText('Chikon');
  await expect(page.locator('.invoice-products-table')).toContainText('৳800');
  await expect(page.locator('.invoice-products-table')).toContainText('2');
  await expect(page.locator('.invoice-products-table')).toContainText('1,600');
  await expect(page.locator('.invoice-summary-table')).toContainText('60');
  await expect(page.locator('.invoice-summary-table')).toContainText('1,660');
  await page.screenshot({ path: 'test-results/order-invoice-1440.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/order-invoice-390.png', fullPage: true });
  await page.goto('/admin/orders/2');
  await expect(page.locator('.invoice-products-table')).toContainText('Mota');
  await page.goto('/admin/analytics');
  const beforeCostConfirmation = await page.evaluate(async () => (await fetch('/api/admin/reports?from=2026-11-01&to=2026-11-30')).json());
  await expect(page.getByText(/Courier cost recorded for/)).toBeVisible();
  await expect(page.getByText(new RegExp(`unknown for ${beforeCostConfirmation.delivery_cost_unknown_orders} orders`))).toBeVisible();
  await page.goto('/admin/orders/3');
  await page.getByLabel(/Courier cost is confirmed/).check();
  const updateResponse = page.waitForResponse(response => response.url().includes('/api/admin/orders/3') && response.request().method() === 'PUT');
  await page.getByRole('button', { name: /Save Changes/ }).click();
  expect((await updateResponse).ok()).toBeTruthy();
  await page.goto('/admin/analytics');
  const afterCostConfirmation = await page.evaluate(async () => (await fetch('/api/admin/reports?from=2026-11-01&to=2026-11-30')).json());
  await expect(page.getByText(new RegExp(`Courier cost recorded for ${afterCostConfirmation.delivery_cost_recorded_orders} orders; unknown for ${afterCostConfirmation.delivery_cost_unknown_orders} orders`))).toBeVisible();
  expect(errors).toEqual([]);
});
