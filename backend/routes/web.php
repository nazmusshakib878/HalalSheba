<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AuthController,CatalogController,ProductController,InventoryController,OrderController,ManagementController,ReportController};
Route::prefix('api')->group(function() {
    Route::get('csrf',[AuthController::class,'csrf']);
    Route::post('login',[AuthController::class,'login'])->middleware('throttle:5,1');
    Route::post('forgot-password',[AuthController::class,'forgot'])->middleware('throttle:3,1');
    Route::post('reset-password',[AuthController::class,'reset'])->middleware('throttle:5,1');
    Route::get('catalog',[CatalogController::class,'index']);
    Route::get('pages/{slug}',[CatalogController::class,'page']);
    Route::get('products/{id}/reviews',[CatalogController::class,'reviews']);
    Route::post('reviews',[\App\Http\Controllers\ReviewController::class,'create'])->middleware('throttle:5,1');
    Route::post('orders',[OrderController::class,'create'])->middleware('throttle:10,1');
    Route::post('quote',[OrderController::class,'create'])->middleware('throttle:30,1');
    Route::post('track',[OrderController::class,'track'])->middleware('throttle:10,1');
    Route::get('media/products/{file}',function(string $file) {
        abort_unless(preg_match('/^[A-Za-z0-9]+\.(jpg|jpeg|png|webp)$/',$file),404);
        $path=storage_path('app/public/products/'.$file); abort_unless(is_file($path),404);
        return response()->file($path,['X-Content-Type-Options'=>'nosniff','Cache-Control'=>'public, max-age=86400']);
    });
    Route::prefix('admin')->middleware('admin')->group(function() {
        Route::get('me',[AuthController::class,'user']); Route::post('logout',[AuthController::class,'logout']);
        Route::post('password',[AuthController::class,'changePassword'])->middleware('throttle:5,1');
        Route::get('products',[ProductController::class,'index']); Route::post('products',[ProductController::class,'save']);
        Route::get('products/{id}',[ProductController::class,'detail']); Route::put('products/{id}',[ProductController::class,'save']);
        Route::post('products/{id}/action',[ProductController::class,'action']); Route::post('images',[ProductController::class,'upload']);
        Route::get('inventory',[InventoryController::class,'index']); Route::get('inventory/history',[InventoryController::class,'history']);
        Route::post('inventory/{id}',[InventoryController::class,'adjust']);
        Route::get('orders',[OrderController::class,'index']); Route::post('orders',[OrderController::class,'create']);
        Route::get('orders/{id}',[OrderController::class,'detail']); Route::put('orders/{id}',[OrderController::class,'update']);
        Route::get('reports',[ReportController::class,'index']);
        Route::get('manage/{resource}',[ManagementController::class,'index']);
        Route::post('manage/{resource}',[ManagementController::class,'save']); Route::put('manage/{resource}/{id}',[ManagementController::class,'save']);
        Route::get('settings',[ManagementController::class,'settings']);
        Route::put('settings/{key}',[ManagementController::class,'saveSettings'])->middleware('admin:super_admin');
        Route::get('staff',[ManagementController::class,'staff'])->middleware('admin:super_admin');
        Route::post('staff',[ManagementController::class,'saveStaff'])->middleware('admin:super_admin');
        Route::put('staff/{id}',[ManagementController::class,'saveStaff'])->middleware('admin:super_admin');
        Route::get('audit',fn()=>\Illuminate\Support\Facades\DB::table('audit_logs')->orderByDesc('id')->limit(500)->get())->middleware('admin:super_admin');
    });
});
