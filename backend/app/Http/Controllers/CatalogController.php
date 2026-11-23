<?php
namespace App\Http\Controllers;
use Illuminate\Support\Facades\{DB,Cache};

class CatalogController extends Controller {
    public function index() {
        return Cache::remember('catalog_api_payload', 60, function() {
            $categories = DB::table('categories')->where('active', true)->whereNull('deleted_at')->orderBy('sort_order')->get();
            $products = DB::table('products')->where('active', true)->whereNull('deleted_at')->whereIn('category_id', $categories->pluck('id'))->get();
            $variants = DB::table('variants')->where('active', true)->get()->groupBy('product_id');
            $brands = DB::table('brands')->whereNull('deleted_at')->get()->keyBy('id');

            return [
                'products' => $products->map(function($p) use ($variants, $categories, $brands) {
                    $vs = $variants[$p->id] ?? collect();
                    $v = $vs->first();
                    $legacy = json_decode($p->legacy ?? '{}', true);
                    $images = json_decode($p->images ?? '[]', true);
                    $category = $categories->firstWhere('id', $p->category_id);

                    return [
                        'id' => $p->id,
                        'slug' => $p->slug,
                        'name' => $p->name,
                        'price' => ($v->price ?? 0) / 100,
                        'regularPrice' => isset($v->regular_price) ? $v->regular_price / 100 : null,
                        'image' => $images[0] ?? '/icon.png',
                        'gallery' => $images,
                        'category' => $category->name ?? 'অর্গানিক',
                        'categorySlug' => $category->slug ?? 'organic-food',
                        'brand' => $brands[$p->brand_id]->name ?? 'Halal Sheba',
                        'weight' => $v->name ?? '',
                        'inStock' => true,
                        'featured' => (bool)$p->featured,
                        'isTopSelling' => (bool)$p->bestseller,
                        'badgeLeft' => $p->new_arrival ? 'New Arrival' : ($p->bestseller ? 'Best Selling' : null),
                        'sections' => $legacy['sections'] ?? ['just-for-you'],
                        'shortDescription' => $p->short_description ?? '',
                        'descriptionSections' => $p->description ? [['heading' => $p->name, 'paragraphs' => explode("\n\n", $p->description)]] : ($legacy['descriptionSections'] ?? []),
                        'highlights' => json_decode($p->features ?? '[]', true),
                        'origin' => $p->origin ?? '',
                        'seoTitle' => $p->seo_title,
                        'seoDescription' => $p->seo_description,
                        'variants' => $vs->map(fn($v) => [
                            'id' => $v->id,
                            'name' => $v->name,
                            'sku' => $v->sku,
                            'price' => $v->price / 100,
                            'regularPrice' => $v->regular_price ? $v->regular_price / 100 : null,
                            'available' => max(50, (int)($v->physical - $v->reserved)),
                            'image' => $v->image,
                        ])->values(),
                    ];
                })->values(),
                'categories' => $categories->map(fn($c) => [
                    'id' => (string)$c->id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                    'image' => $c->image ?? '/icon.png',
                    'subcategories' => [],
                ]),
                'settings' => DB::table('settings')->whereIn('key', ['appearance', 'delivery', 'contact'])->get()->mapWithKeys(fn($s) => [$s->key => json_decode($s->value, true)]),
            ];
        });
    }

    public function page(string $slug) {
        $p = DB::table('content_pages')->where('slug', $slug)->where('active', true)->first(['title', 'body']);
        abort_unless($p, 404);
        return $p;
    }

    public function reviews(int $id) {
        return DB::table('reviews')->where('product_id', $id)->where('status', 'approved')->get(['id', 'author', 'rating', 'comment', 'reply', 'created_at']);
    }
}
