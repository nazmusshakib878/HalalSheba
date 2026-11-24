import {test,expect} from '@playwright/test';
test('checkout and cart render at desktop and narrow mobile widths without overflow',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/checkout');
 await page.evaluate(()=>localStorage.setItem('halalsheba_store_v1',JSON.stringify({cart:[{productId:19,variantId:19,slug:'chui-jhal',name:'Chui jhal',price:800,weight:'Chikon',image:'/images/products/chui-jhal.jpg',quantity:2}],wishlist:[],user:null})));
 await page.reload();await expect(page.getByRole('heading',{name:'Checkout'})).toBeVisible();
 await page.getByLabel('Open shopping cart').click();await expect(page.getByRole('complementary',{name:'Shopping Cart'})).toBeVisible();
 for(const width of [360,390,1440]){await page.setViewportSize({width,height:900});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);}
 await page.getByRole('button',{name:/Close/}).click();await expect(page.getByRole('complementary',{name:'Shopping Cart'})).toHaveCount(0);expect(errors).toEqual([]);
});

