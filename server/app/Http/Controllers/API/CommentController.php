<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\SketchModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $postId = $request->get("model_id");
        $comments = Comment::select("id", "user_id", "model_id", "comment", "created_at")
            ->where("model_id", $postId)->with('user')
            ->orderByDesc("id")->cursorPaginate(15);
        return response()->json($comments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $payload = $request->validate([
            "comment" => "required|min:2|max:2000",
            "model_id" => "required"
        ]);
        try {
            $user = $request->user();
            $payload["user_id"] = $user->id;

            // Находим минимальный свободный id
            $existingIds = Comment::pluck('id')->toArray();
            sort($existingIds);
            $newId = 1;
            foreach ($existingIds as $id) {
                if ($id == $newId) {
                    $newId++;
                } else {
                    break;
                }
            }

            // Создаем комментарий с новым id
            $comment = new Comment($payload);
            $comment->id = $newId;
            $comment->save();

            $comment = Comment::where('id', $newId)->with('user')->orderByDesc("id")->first();

            return response()->json(["comment" => $comment, "message" => "Comment added successfully!"]);
        } catch (\Exception $err) {
            Log::info("model-error => " . $err->getMessage());
            return response()->json(["message" => "something went wrong.please try again!"], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
