<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Services\Audit;
class ProductController extends Controller {
    public function index(Request $r) {
        $q=DB::table('products')->orderByDesc('id');
        if (!$r->boolean('archived')) $q->whereNull('deleted_at');
        if ($r->filled('q')) $q->where('name','like','%'.$r->string('q').'%');
        return $q->get()->map(fn($p)=>$this->detail($p->id));
    }
    public function detail(int $id) {
        $p=DB::table('products')->find($id); abort_unless($p,404);
        foreach (['features','images','tags','legacy'] as $key) $p->$key=json_decode($p->$key??'[]',true);
        $p->variants=DB::table('variants')->where('product_id',$id)->get();
        return $p;
    }
    public function save(Request $r, ?int $id=null) {
        if ($id) abort_unless(DB::table('products')->where('id',$id)->exists(),404);
        // Blank SKUs are normalised to null before validation: the `distinct`
        // rule below would otherwise reject two new variants that both send
        // an empty SKU, while null values on a nullable field skip it.
        $variantsInput=$r->input('variants',[]);
        if (is_array($variantsInput)) {
            foreach ($variantsInput as $i=>$vv) if (is_array($vv) && empty($vv['sku'])) $variantsInput[$i]['sku']=null;
            $r->merge(['variants'=>$variantsInput]);
        }
        $d=$r->validate([
            'name'=>'required|string|max:255','name_en'=>'nullable|string|max:255',
            'slug'=>$r->filled('slug')?['required','regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',Rule::unique('products')->ignore($id)]:['nullable','string','max:255'],
            'category_id'=>'required|exists:categories,id','brand_id'=>'nullable|exists:brands,id',
            'short_description'=>'nullable|string','description'=>'nullable|string','features'=>'array', 'features.*'=>'string|max:1000',
            'images'=>'array|max:12','images.*'=>'string|max:2048','tags'=>'array','tags.*'=>'string|max:100',
            'origin'=>'nullable|string|max:255','storage_instructions'=>'nullable|string', 'seo_title'=>'nullable|string|max:255','seo_description'=>'nullable|string|max:1000',
            'active'=>'boolean','featured'=>'boolean','bestseller'=>'boolean','new_arrival'=>'boolean',
            'variants'=>'required|array|min:1','variants.*.id'=>'nullable|integer', 'variants.*.name'=>'required|string|max:255',
            'variants.*.sku'=>'nullable|string|max:255|distinct','variants.*.price'=>'required|integer|min:0',
            'variants.*.regular_price'=>'nullable|integer|min:0','variants.*.cost'=>'required|integer|min:0',
            'variants.*.low_stock_threshold'=>'required|integer|min:0','variants.*.image'=>'nullable|string|max:2048', 'variants.*.active'=>'boolean',
        ]);
        return DB::transaction(function() use($d,$id) {
            $variants=$d['variants']; unset($d['variants']);
            $before=$id?$this->detail($id):null;
            // Slug is no longer entered in the admin form: generate it when
            // missing. An existing product keeps its stored slug, so its URL
            // never changes on edit.
            if (empty($d['slug'])) {
                if ($before && !empty($before->slug)) {
                    $d['slug']=$before->slug;
                } else {
                    $base=\Illuminate\Support\Str::slug((string)($d['name_en'] ?? ''));
                    if ($base==='') $base=\Illuminate\Support\Str::slug((string)($d['name'] ?? ''));
                    if ($base==='') $base='product-'.strtolower(\Illuminate\Support\Str::random(6));
                    $slug=$base; $n=2;
                    while (DB::table('products')->where('slug',$slug)->when($id,fn($q)=>$q->where('id','!=',$id))->exists()) { $slug=$base.'-'.$n; $n++; }
                    $d['slug']=$slug;
                }
            }
            foreach(['features','images','tags'] as $key) if(isset($d[$key])) $d[$key]=json_encode($d[$key]);
            $d['updated_at']=now();
            if($id) DB::table('products')->where('id',$id)->update($d);
            else $id=DB::table('products')->insertGetId([...$d,'created_at'=>now()]);
            $kept=[]; $usedSkus=[];
            foreach($variants as $v) {
                $vid=$v['id']??null; unset($v['id']);
                if($vid) abort_unless(DB::table('variants')->where('product_id',$id)->where('id',$vid)->exists(),422,'Invalid variant.');
                // SKU is no longer entered in the admin form: generate it from
                // the (final) product slug + variant name, e.g. seed-jaggery-1kg.
                // Uniqueness is guaranteed against the variants table AND
                // within this request, so the check below still passes.
                if (empty($v['sku'])) {
                    $base=\Illuminate\Support\Str::slug($d['slug'].'-'.(string)($v['name'] ?? ''));
                    if ($base==='') $base=$d['slug'].'-'.strtolower(\Illuminate\Support\Str::random(6));
                    $sku=$base;
                    while (in_array($sku,$usedSkus,true) || DB::table('variants')->where('sku',$sku)->when($vid,fn($q)=>$q->where('id','!=',$vid))->exists()) $sku=$base.'-'.strtolower(\Illuminate\Support\Str::random(6));
                    $v['sku']=$sku;
                }
                abort_if(DB::table('variants')->where('sku',$v['sku'])->when($vid,fn($q)=>$q->where('id','!=',$vid))->exists(),422,'SKU is already in use.');
                $usedSkus[]=$v['sku'];
                $v['updated_at']=now();
                if($vid) DB::table('variants')->where('id',$vid)->update($v);
                else $vid=DB::table('variants')->insertGetId([...$v,'product_id'=>$id,'created_at'=>now()]);
                $kept[]=$vid;
            }
            DB::table('variants')->where('product_id',$id)->whereNotIn('id',$kept)->update(['active'=>false]);
            Audit::record($before?'product.update':'product.create','product',$id,['before'=>$before,'after'=>$this->detail($id)]);
            CatalogController::clearCache();
            return $this->detail($id);
        });
    }
    public function action(Request $r, int $id) {
        $r->validate(['action'=>'required|in:archive,restore,duplicate,toggle-active,activate,deactivate']); $p=$this->detail($id);
        return DB::transaction(function() use($r,$id,$p) {
            if (in_array($r->action, ['toggle-active', 'activate', 'deactivate'])) {
                $newActive = match($r->action) {
                    'activate' => true,
                    'deactivate' => false,
                    default => !$p->active,
                };
                DB::table('products')->where('id', $id)->update([
                    'active' => $newActive,
                    'deleted_at' => null,
                    'updated_at' => now(),
                ]);
                Audit::record('product.' . ($newActive ? 'activate' : 'deactivate'), 'product', $id);
                CatalogController::clearCache();
                return ['message' => 'Product ' . ($newActive ? 'activated' : 'deactivated'), 'active' => $newActive];
            }
            if($r->action==='duplicate') {
                $data=(array)DB::table('products')->find($id); unset($data['id']);
                $data['slug'].='-copy-'.strtolower(\Illuminate\Support\Str::random(6)); $data['name'].=' (Copy)';
                $data['active']=false; $data['deleted_at']=null; $data['created_at']=now(); $data['updated_at']=now();
                $new=DB::table('products')->insertGetId($data);
                foreach($p->variants as $v) {
                    $v=(array)$v; unset($v['id']); $v['product_id']=$new; $v['sku'].='-'.strtolower(\Illuminate\Support\Str::random(6));
                    foreach(['physical','reserved','received','sold'] as $key) $v[$key]=0;
                    $v['restocked_at']=null; DB::table('variants')->insert($v);
                }
                Audit::record('product.duplicate','product',$new);
                CatalogController::clearCache();
                return $this->detail($new);
            }
            DB::table('products')->where('id',$id)->update(['deleted_at'=>$r->action==='archive'?now():null,'active'=>false,'updated_at'=>now()]);
            Audit::record('product.'.$r->action,'product',$id);
            CatalogController::clearCache();
            return ['message'=>'Product updated'];
        });
    }
    public function upload(Request $r) {
        $r->validate(['image'=>'required|image|mimes:jpg,jpeg,png,webp,gif|max:30720|dimensions:max_width=10000,max_height=10000']);
        $path=$r->file('image')->store('products','public');
        return ['url'=>'/api/media/'.$path];
    }
}
