<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\InventoryService;
class InventoryController extends Controller {
    public function index() {
        return DB::table('variants')->join('products','products.id','=','variants.product_id')
            ->select('variants.*','products.name as product_name')->selectRaw('physical - reserved as available')->orderBy('product_name')->get();
    }
    public function history() {
        return DB::table('inventory_transactions')->leftJoin('users','users.id','=','inventory_transactions.user_id')
            ->join('variants','variants.id','=','inventory_transactions.variant_id')
            ->select('inventory_transactions.*','users.name as admin','variants.sku')->orderByDesc('inventory_transactions.id')->limit(300)->get();
    }
    public function adjust(Request $r, int $id, InventoryService $service) {
        $d=$r->validate(['type'=>'required|in:add,reduce,correct,damaged,expired,returned','quantity'=>'required|integer|min:0|max:1000000',
            'reason'=>'required|string|min:3|max:2000','cost'=>'nullable|integer|min:0','supplier'=>'nullable|string|max:255',
            'batch'=>'nullable|string|max:255','expires_at'=>'nullable|date','received_at'=>'nullable|date']);
        if($d['type']!=='correct') abort_unless($d['quantity']>0,422,'Quantity must be positive.');
        $res = $service->adjust($id,$d);
        CatalogController::clearCache();
        return $res;
    }
}
