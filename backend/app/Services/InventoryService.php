<?php
namespace App\Services;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
class InventoryService {
    public function adjust(int $id, array $data): object {
        return DB::transaction(function () use ($id,$data) {
            $v = DB::table('variants')->lockForUpdate()->find($id);
            abort_unless($v,404);
            $quantity = (int)$data['quantity'];
            $delta = match($data['type']) {
                'add','returned' => $quantity,
                'reduce','damaged','expired' => -$quantity,
                'correct' => $quantity - $v->physical,
            };
            if ($v->physical + $delta < $v->reserved) throw ValidationException::withMessages(['quantity'=>'Physical stock cannot be lower than reserved stock.']);
            $update = ['physical'=>$v->physical+$delta,'updated_at'=>now()];
            if ($data['type']==='add') {
                $update['received']=$v->received+$quantity; $update['restocked_at']=now();
                if (isset($data['cost'])) $update['cost']=$data['cost'];
            }
            DB::table('variants')->where('id',$id)->update($update);
            $this->record($v,$delta,$data['type'],$data['reason'],null,$data);
            Audit::record('stock.'.$data['type'],'variant',$id,$update);
            return DB::table('variants')->find($id);
        }, 3);
    }
    public function record(object $v, int $delta, string $type, string $reason, ?int $order = null, array $data = []): void {
        DB::table('inventory_transactions')->insert([
            'variant_id'=>$v->id,'user_id'=>auth()->id(),'order_id'=>$order,'type'=>$type,'quantity'=>$delta,
            'previous_stock'=>$v->physical,'updated_stock'=>$v->physical+$delta,'reason'=>$reason,
            'supplier'=>$data['supplier']??null,'batch'=>$data['batch']??null,'expires_at'=>$data['expires_at']??null,
            'received_at'=>$data['received_at']??null,'created_at'=>now(),'updated_at'=>now(),
        ]);
    }
}
