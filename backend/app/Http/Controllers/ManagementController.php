<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Services\Audit;
class ManagementController extends Controller {
    private function table(string $resource): string {
        abort_unless(in_array($resource,['categories','brands','customers','coupons','content_pages','reviews']),404); return $resource;
    }
    public function index(string $resource) {
        $table=$this->table($resource);
        if($table==='customers') return DB::table('customers')->get()->map(function($c){
            $c->orders=DB::table('orders')->where('customer_id',$c->id)->orderByDesc('id')->get();
            $c->spending=$c->orders->where('payment_status','paid')->where('status','delivered')->sum('total'); return $c;
        });
        return DB::table($table)->orderByDesc('id')->get();
    }
    public function save(Request $r,string $resource,?int $id=null) {
        $table=$this->table($resource); if($id) abort_unless(DB::table($table)->where('id',$id)->exists(),404);
        $rules=match($table) {
            'categories','brands'=>['name'=>'required|string|max:255','slug'=>['required','regex:/^[a-z0-9-]+$/',Rule::unique($table)->ignore($id)],'image'=>'nullable|string|max:2048','active'=>'boolean','sort_order'=>'integer|min:0'],
            'customers'=>['notes'=>'nullable|string|max:5000','vip'=>'boolean','status'=>'required|in:active,blocked'],
            'coupons'=>['code'=>['required','regex:/^[A-Z0-9_-]+$/',Rule::unique('coupons')->ignore($id)],'type'=>'required|in:percent,fixed,free_delivery','value'=>'required|integer|min:0','minimum'=>'integer|min:0','usage_limit'=>'nullable|integer|min:1','expires_at'=>'nullable|date','active'=>'boolean','product_id'=>'nullable|exists:products,id','category_id'=>'nullable|exists:categories,id'],
            'content_pages'=>['slug'=>['required','regex:/^[a-z0-9-]+$/',Rule::unique($table)->ignore($id)],'title'=>'required|string|max:255','body'=>'required|string','active'=>'boolean'],
            'reviews'=>['status'=>'required|in:pending,approved,rejected','reply'=>'nullable|string|max:5000'],
        };
        if($table==='categories') {
            if (empty($r->input('parent_id')) || $r->input('parent_id') == 0) {
                $r->merge(['parent_id' => null]);
            }
            $rules['parent_id'] = 'nullable|exists:categories,id';
        }
        if(in_array($table,['customers','reviews'])) abort_unless($id,405);
        $data=$r->validate($rules);
        if($table==='coupons' && $data['type']==='percent') abort_if($data['value']>100,422,'Percentage cannot exceed 100.');
        if($table==='categories' && !empty($data['parent_id'])) {
            $parent=$data['parent_id']; $seen=[];
            while($parent) { abort_if($parent==$id || in_array($parent,$seen),422,'Category hierarchy cannot contain a cycle.'); $seen[]=$parent; $parent=DB::table('categories')->where('id',$parent)->value('parent_id'); }
        }
        return DB::transaction(function() use($table,$data,$id){
            $data['updated_at']=now();
            if($id) DB::table($table)->where('id',$id)->update($data);
            else $id=DB::table($table)->insertGetId([...$data,'created_at'=>now()]);
            Audit::record('save',$table,$id,$data);
            CatalogController::clearCache();
            return DB::table($table)->find($id);
        });
    }
    public function settings() { return DB::table('settings')->get()->mapWithKeys(fn($s)=>[$s->key=>json_decode($s->value,true)]); }
    public function saveSettings(Request $r,string $key) {
        $rules=match($key) {
            'delivery'=>['dhaka'=>'required|integer|min:0','outside'=>'required|integer|min:0','free_above'=>'nullable|integer|min:0','districts'=>'array','districts.*'=>'integer|min:0'],
            'contact'=>['phone'=>'nullable|string|max:30','whatsapp'=>'nullable|regex:/^[0-9]{8,15}$/','email'=>'nullable|email','address'=>'nullable|string|max:1000','facebook'=>'nullable|url:https','instagram'=>'nullable|url:https'],
            'appearance'=>['announcement'=>'nullable|string|max:500','logo'=>'nullable|string|max:2048','favicon'=>'nullable|string|max:2048','footer'=>'nullable|string|max:2000','primary'=>'nullable|regex:/^#[0-9a-fA-F]{6}$/','accent'=>'nullable|regex:/^#[0-9a-fA-F]{6}$/','seo_title'=>'nullable|string|max:255','seo_description'=>'nullable|string|max:1000','hero_title'=>'nullable|string|max:255','hero_image'=>'nullable|string|max:2048','hero_text'=>'nullable|string|max:1000','sections'=>'array','sections.*'=>'in:honey,gur-sweets,oil,ghee,spices-seeds,organic-food','hidden_sections'=>'array','hidden_sections.*'=>'string|max:100'],
            default=>abort(404),
        };
        $data=$r->validate($rules);
        DB::table('settings')->updateOrInsert(['key'=>$key],['value'=>json_encode($data),'created_at'=>now(),'updated_at'=>now()]);
        Audit::record('settings.update',$key,null,$data);
        CatalogController::clearCache();
        return $data;
    }
    public function staff() { return DB::table('users')->get(['id','name','email','role','active','created_at']); }
    public function saveStaff(Request $r,?int $id=null) {
        $d=$r->validate(['name'=>'required|string|max:255','email'=>['required','email',Rule::unique('users')->ignore($id)],'role'=>'required|in:admin,super_admin','active'=>'required|boolean']);
        abort_if($id===auth()->id() && (!$d['active'] || $d['role']!=='super_admin'),422,'You cannot disable or demote yourself.');
        if($id) { $u=\App\Models\User::findOrFail($id); $u->forceFill($d)->save(); DB::table('sessions')->where('user_id',$id)->delete(); }
        else { $u=new \App\Models\User; $u->forceFill([...$d,'password'=>\Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(64))])->save(); \Illuminate\Support\Facades\Password::sendResetLink(['email'=>$d['email']]); }
        Audit::record('staff.save','user',$u->id,$d); return $u->only('id','name','email','role','active');
    }
}
