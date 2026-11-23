<?php
namespace Tests\Feature;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\User;
use App\Services\{InventoryService,OrderService};
class CommerceTest extends TestCase {
    use RefreshDatabase;
    private function fixture():array {
        $cat=DB::table('categories')->insertGetId(['name'=>'Oil','slug'=>'oil']);
        $p=DB::table('products')->insertGetId(['name'=>'Mustard oil','slug'=>'mustard-oil','category_id'=>$cat]);
        $v=DB::table('variants')->insertGetId(['product_id'=>$p,'name'=>'1L','sku'=>'OIL-1','price'=>33000,'cost'=>20000,'physical'=>20]);
        return [$p,$v,$cat];
    }
    private function order(int $v):array {return ['idempotency_key'=>(string)Str::uuid(),'name'=>'Test buyer','phone'=>'01712345678','address'=>'Test address','district'=>'Dhaka','payment_method'=>'cod','items'=>[['variant_id'=>$v,'quantity'=>3]]];}
    public function test_private_endpoints_require_authentication():void {
        foreach(['products','inventory','orders','reports','settings','staff','audit','manage/customers'] as $path) $this->getJson('/api/admin/'.$path)->assertUnauthorized();
    }
    public function test_staff_cannot_change_settings_or_manage_admins():void {
        $user=User::factory()->create(['role'=>'admin']);$this->actingAs($user);
        $this->putJson('/api/admin/settings/delivery',['dhaka'=>5000,'outside'=>10000])->assertForbidden();
        $this->getJson('/api/admin/staff')->assertForbidden();
    }
    public function test_public_catalog_never_exposes_private_values():void {
        $this->fixture();$response=$this->getJson('/api/catalog')->assertOk();
        $product=$response->json('products.0');$this->assertArrayNotHasKey('cost',$product);$this->assertArrayNotHasKey('legacy',$product);
        $variant=$product['variants'][0];$this->assertArrayNotHasKey('cost',$variant);$this->assertArrayNotHasKey('physical',$variant);$this->assertEquals(330,$variant['price']);
    }
    public function test_restock_adds_and_cannot_reduce_below_reserved():void {
        [, $v]=$this->fixture();$service=app(InventoryService::class);
        $service->adjust($v,['type'=>'add','quantity'=>30,'reason'=>'Stock received']);
        $this->assertDatabaseHas('variants',['id'=>$v,'physical'=>50,'received'=>30]);
        DB::table('variants')->where('id',$v)->update(['reserved'=>10]);
        $this->actingAs(User::factory()->create());
        $this->postJson('/api/admin/inventory/'.$v,['type'=>'reduce','quantity'=>45,'reason'=>'Invalid decrease'])->assertUnprocessable();
        $this->assertDatabaseHas('variants',['id'=>$v,'physical'=>50]);
    }
    public function test_order_is_authoritative_idempotent_and_releases_on_cancellation():void {
        [, $v]=$this->fixture();$payload=$this->order($v);$payload['total']=1;$payload['items'][0]['price']=1;
        $first=$this->postJson('/api/orders',$payload)->assertOk();
        $this->assertEquals(105000,$first->json('total'));
        $this->postJson('/api/orders',$payload)->assertOk()->assertJsonPath('reference',$first->json('reference'));
        $this->assertDatabaseCount('orders',1);$this->assertDatabaseHas('variants',['id'=>$v,'reserved'=>3,'physical'=>20]);
        $o=DB::table('orders')->first();$s=app(OrderService::class);$s->transition($o->id,['status'=>'cancelled','reason'=>'Customer cancelled']);
        $s->transition($o->id,['status'=>'cancelled','reason'=>'Duplicate action']);
        $this->assertDatabaseHas('variants',['id'=>$v,'reserved'=>0,'physical'=>20]);
    }
    public function test_shipment_consumes_once_return_restores_once():void {
        [, $v]=$this->fixture();$s=app(OrderService::class);$o=$s->create($this->order($v));
        foreach(['confirmed','processing','packed','shipped','shipped'] as $status) $s->transition($o->id,['status'=>$status,'reason'=>'Verified operation']);
        $this->assertDatabaseHas('variants',['id'=>$v,'physical'=>17,'reserved'=>0,'sold'=>3]);
        foreach(['returned','returned'] as $status)$s->transition($o->id,['status'=>$status,'reason'=>'Goods received back']);
        $this->assertDatabaseHas('variants',['id'=>$v,'physical'=>20,'reserved'=>0,'sold'=>0]);
    }
    public function test_overselling_and_inactive_products_are_rejected():void {
        [$p,$v]=$this->fixture();$d=$this->order($v);$d['items'][0]['quantity']=21;
        $this->postJson('/api/orders',$d)->assertUnprocessable();$this->assertDatabaseCount('orders',0);
        DB::table('products')->where('id',$p)->update(['active'=>false]);$d['items'][0]['quantity']=1;
        $this->postJson('/api/orders',$d)->assertUnprocessable();$this->getJson('/api/catalog')->assertJsonCount(0,'products');
    }
    public function test_product_create_price_edit_archive_restore_and_duplicate():void {
        [,$v,$cat]=$this->fixture();$this->actingAs(User::factory()->create());
        $data=['name'=>'Honey','slug'=>'honey','category_id'=>$cat,'features'=>['Pure'],'images'=>[],'tags'=>[], 'active'=>true,'variants'=>[['name'=>'1kg','sku'=>'HONEY-1','price'=>60000,'cost'=>40000,'low_stock_threshold'=>5]]];
        $created=$this->postJson('/api/admin/products',$data)->assertOk();$id=$created->json('id');
        $data['variants'][0]['id']=$created->json('variants.0.id');$data['variants'][0]['price']=65000;
        $this->putJson('/api/admin/products/'.$id,$data)->assertOk()->assertJsonPath('variants.0.price',65000);
        $this->postJson('/api/admin/products/'.$id.'/action',['action'=>'archive'])->assertOk();
        $this->assertNotNull(DB::table('products')->where('id',$id)->value('deleted_at'));
        $this->postJson('/api/admin/products/'.$id.'/action',['action'=>'restore'])->assertOk();
        $this->assertDatabaseHas('products',['id'=>$id,'active'=>false,'deleted_at'=>null]);
        $this->postJson('/api/admin/products/'.$id.'/action',['action'=>'duplicate'])->assertOk()->assertJsonPath('variants.0.physical',0);
    }
    public function test_quote_does_not_consume_coupon_or_stock():void {
        [,$v]=$this->fixture();DB::table('coupons')->insert(['code'=>'SAVE10','type'=>'percent','value'=>10,'usage_limit'=>1]);
        $d=$this->order($v);$d['coupon']='SAVE10';$this->postJson('/api/quote',$d)->assertOk()->assertJsonPath('discount',9900);
        $this->assertDatabaseHas('coupons',['code'=>'SAVE10','used'=>0]);$this->assertDatabaseHas('variants',['id'=>$v,'reserved'=>0]);
    }
}
