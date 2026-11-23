import {test,expect} from '@playwright/test';
test('private admin redirects unauthenticated visitors',async({page})=>{await page.goto('/admin/inventory');await expect(page).toHaveURL(/\/admin\/login/);await expect(page.getByRole('heading',{name:'Welcome back'})).toBeVisible();});
test('admin login, pages and responsive layouts',async({page})=>{
 test.skip(!process.env.E2E_EMAIL||!process.env.E2E_PASSWORD,'Set credentials explicitly; no credentials are stored in tests.');
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/admin/login');await page.getByLabel('Email address').fill(process.env.E2E_EMAIL!);await page.getByLabel('Password',{exact:true}).fill(process.env.E2E_PASSWORD!);await page.getByRole('button',{name:'Sign in securely'}).click();await expect(page).toHaveURL(/\/admin$/);
 await expect(page.getByRole('heading',{name:'Business overview'})).toBeVisible();
 for(const [path,heading] of [['products','Products'],['products/add','Add new product'],['inventory','Inventory'],['orders','Orders'],['categories','Categories'],['customers','Customers'],['analytics','Sales & analytics'],['settings','Store settings']]){
  await page.goto('/admin/'+path);await expect(page.getByRole('heading',{name:heading,exact:true})).toBeVisible();await expect(page.locator('.notice.error')).toHaveCount(0);
 }
 await page.goto('/admin/products');await expect(page.locator('tbody tr').first()).toBeVisible();
 for(const width of [390,768,1440]){await page.setViewportSize({width,height:900});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.screenshot({path:`test-results/admin-${width}.png`,fullPage:true});}
 await page.setViewportSize({width:1440,height:900});await page.getByRole('button',{name:'Sign out'}).click();await expect(page).toHaveURL(/\/admin\/login/);expect(errors).toEqual([]);
});
test('storefront catalog and inactive purchase controls render',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/products/sorishar-tel');await expect(page.getByRole('heading',{name:'ঘানি ভাঙা খাঁটি সরিষার তেল',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:/৫ লিটার/})).toBeVisible();await page.getByRole('button',{name:/৫ লিটার/}).click();
 await expect(page.getByRole('button',{name:'Add to Cart',exact:true})).toBeDisabled();
 await page.setViewportSize({width:390,height:844});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 expect(errors).toEqual([]);
});
