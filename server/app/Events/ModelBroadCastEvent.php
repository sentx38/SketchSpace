<?php

namespace App\Events;

use App\Models\SketchModel;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ModelBroadCastEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $model;
    public $action;

    /**
     * Create a new event instance.
     *
     * @param mixed $model Модель или данные модели (например, массив с ID для удаления)
     * @param string $action Действие: 'create' или 'delete'
     */
    public function __construct($model, string $action = 'create')
    {
        $this->model = $model;
        $this->action = $action;

        // Загружаем отношения только для действия create и если передана модель SketchModel
        if ($action === 'create' && $model instanceof SketchModel) {
            $this->model->loadMissing(['author', 'category']);
        }
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel
     */
    public function broadcastOn(): Channel
    {
        return new Channel('model-broadcast');
    }

    /**
     * Customize the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'model' => $this->model,
            'action' => $this->action,
        ];
    }
}