<?php
use Illuminate\Support\Facades\{Artisan,DB,Hash};
use App\Models\User;
Artisan::command('admin:create {email} {--name=Administrator}', function() {
    $email=$this->argument('email');
    if(!filter_var($email,FILTER_VALIDATE_EMAIL) || User::where('email',$email)->exists()) { $this->error('Invalid email or account already exists.'); return 1; }
    $password=$this->secret('Choose a password (at least 10 characters)');
    if(strlen($password??'')<10) { $this->error('Password must be at least 10 characters.'); return 1; }
    $user=new User; $user->forceFill(['name'=>$this->option('name'),'email'=>$email,'password'=>Hash::make($password),'role'=>'super_admin','active'=>true])->save();
    $this->info('Super Admin created. Sign in at /admin/login.');
});
Artisan::command('catalog:import {file=database/seeders/catalog.json}', function() {
    $path=base_path($this->argument('file'));
    if(!is_file($path)) { $this->error('Catalog JSON file missing. Run the frontend export script first.'); return 1; }
    $data=json_decode(file_get_contents($path),true,512,JSON_THROW_ON_ERROR);
    DB::transaction(function() use($data) {
        foreach($data['categories'] as $c) if(!DB::table('categories')->where('slug',$c['slug'])->exists()) DB::table('categories')->insert(['name'=>$c['name'],'slug'=>$c['slug'],'image'=>$c['image'],'created_at'=>now(),'updated_at'=>now()]);
        if(!DB::table('brands')->where('slug','halal-sheba')->exists()) DB::table('brands')->insert(['name'=>'Halal Sheba','slug'=>'halal-sheba','created_at'=>now(),'updated_at'=>now()]);
        $brand=DB::table('brands')->where('slug','halal-sheba')->value('id');
        foreach($data['products'] as $p) {
            if(DB::table('products')->where('slug',$p['slug'])->exists()) continue;
            $id=DB::table('products')->insertGetId(['id'=>$p['id'],'name'=>$p['name'],'slug'=>$p['slug'],
                'category_id'=>DB::table('categories')->where('slug',$p['categorySlug'])->value('id'),'brand_id'=>$brand,
                'short_description'=>$p['shortDescription'],'features'=>json_encode($p['highlights']),
                'images'=>json_encode($p['gallery']??[$p['image']]),'legacy'=>json_encode($p),'origin'=>$p['origin'],
                'bestseller'=>$p['isTopSelling']??false,'created_at'=>now(),'updated_at'=>now()]);
            $variants=[['name'=>$p['weight']??'Standard','price'=>$p['price'],'image'=>$p['image']]];
            if($p['slug']==='sorishar-tel') $variants[]=['name'=>'৫ লিটার','price'=>1600,'image'=>'/images/products/sorishar-tel-5l.jpg'];
            if($p['slug']==='chui-jhal') $variants=[['name'=>'মোটা','price'=>1200,'image'=>$p['image']],['name'=>'মাঝামাঝি','price'=>900,'image'=>$p['gallery'][1]??$p['image']],['name'=>'চিকন','price'=>800,'image'=>$p['gallery'][2]??$p['image']]];
            foreach($variants as $i=>$v) DB::table('variants')->insert(['product_id'=>$id,'name'=>$v['name'],'sku'=>'HS-'.$id.'-'.($i+1),'price'=>(int)round($v['price']*100),'regular_price'=>isset($p['regularPrice'])&&$i===0?(int)round($p['regularPrice']*100):null,'physical'=>100,'received'=>100,'reserved'=>0,'image'=>$v['image'],'created_at'=>now(),'updated_at'=>now()]);
        }
    });
    // The seeder inserts products with explicit IDs, which never advances
    // the PostgreSQL sequence — resync it so new product creates stop
    // colliding on the primary key (see migration 2026_11_25_000004).
    if (DB::getDriverName() === 'pgsql') {
        DB::statement("SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 0))");
    }
    $this->info('Catalog imported without overwriting existing products. Stock initialized to 100 units.');
});
