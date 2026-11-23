<?php
namespace App\Services;
use Illuminate\Support\Facades\DB;
class Audit {
    public static function record(string $action, string $entity, ?int $id, array $changes = []): void {
        DB::table('audit_logs')->insert(['user_id'=>auth()->id(),'action'=>$action,'entity'=>$entity,'entity_id'=>$id,'changes'=>json_encode($changes),'created_at'=>now(),'updated_at'=>now()]);
    }
}
