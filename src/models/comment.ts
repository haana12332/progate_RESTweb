import {User} from "@/models/user";
import {databaseManager} from "@/db";
import {
  serializeToSQLiteDateTimeString,
  deserializeFromSQLiteDateTimeString,
} from "@/lib/convert_date";

/* eslint-disable camelcase */
export interface CommentRawData {
  content: string;
  user_id: number;
  post_id: number;
  created_at: string;
  updated_at: string;
}
/* eslint-enable camelcase */

export interface CommentRawDataWithId extends CommentRawData {
  id: number;
}

/* eslint-disable camelcase */
export interface CommentRawDataWithIdAndUser extends CommentRawDataWithId {
  user_name: string;
  user_email: string;
  user_image_name: string;
  user_created_at: string;
  user_updated_at: string;
}
/* eslint-enable camelcase */

export interface CommentWithUser {
  id?: number;
  content: string;
  userId: number;
  postId: number;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
}

export class Comment {
  public id?: number;

  static fromRawData(data: CommentRawData): Comment {
    return new Comment(
      data.user_id,
      data.post_id,
      data.content,
      deserializeFromSQLiteDateTimeString(data.created_at),
      deserializeFromSQLiteDateTimeString(data.updated_at)
    );
  }

  static fromRawDataWithId(data: CommentRawDataWithId): Comment {
    const comment = Comment.fromRawData(data);
    comment.id = data.id;
    return comment;
  }

  constructor(
    public userId: number,
    public postId: number,
    public content: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  async user(): Promise<User | undefined> {
    return User.find(this.userId);
  }

  async save(): Promise<void> {
    // Populate the datetime fields before insert so that we don't have to run
    // additional SELECT query to know `created_at` and `updated_at` fields.
    const now = new Date();
    this.createdAt = this.createdAt ?? now;
    this.updatedAt = this.updatedAt ?? now;

    const db = await databaseManager.getInstance();
    const {lastID} = await db.run(
      `INSERT INTO comments (content, user_id, post_id, created_at, updated_at)
         VALUES ($content, $userId, $postId, $createdAt, $updatedAt)`,
      {
        $content: this.content,
        $userId: this.userId,
        $postId: this.postId,
        $createdAt: serializeToSQLiteDateTimeString(this.createdAt),
        $updatedAt: serializeToSQLiteDateTimeString(this.updatedAt),
      }
    );
    this.id = lastID;
  }

  async update(): Promise<void> {
    // Populate the datetime field before insert so that we don't have to run
    // additional SELECT query to know `updated_at`.
    this.updatedAt = new Date();

    const db = await databaseManager.getInstance();
    await db.run(
      "UPDATE comments SET content=$content, updated_at=$updatedAt WHERE id=$id",
      {
        $content: this.content,
        $updatedAt: serializeToSQLiteDateTimeString(this.updatedAt),
        $id: this.id,
      }
    );
  }

  async delete(): Promise<void> {
    const db = await databaseManager.getInstance();
    await db.run("DELETE FROM comments WHERE id=?", [this.id]);
  }

  static async allByPost(postId: number): Promise<CommentWithUser[]> {
    const db = await databaseManager.getInstance();
    const commentRowDataList = await db.all<CommentRawDataWithIdAndUser[]>(
      "SELECT c.id, c.content, c.user_id, c.post_id, c.created_at, c.updated_at, u.name as user_name, u.email as user_email, u.image_name as user_image_name, u.created_at as user_created_at, u.updated_at as user_updated_at FROM comments c INNER JOIN users u ON c.user_id=u.id WHERE c.post_id=? ORDER BY c.created_at desc",
      [postId]
    );
    /* eslint-disable camelcase */
    return commentRowDataList.map(data => {
      const comment = Comment.fromRawDataWithId({
        id: data.id,
        content: data.content,
        user_id: data.user_id,
        post_id: data.post_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      });

      const user = User.fromRawDataWithId({
        id: data.user_id,
        name: data.user_name,
        email: data.user_email,
        image_name: data.user_image_name,
        created_at: data.user_created_at,
        updated_at: data.user_updated_at,
      });
      return {...comment, user};
    });
    /* eslint-enable camelcase */
  }

  static async find(commentId: number): Promise<Comment | undefined> {
    const db = await databaseManager.getInstance();
    const commentRowData = await db.get<CommentRawDataWithId>(
      "SELECT c.id, c.content, c.user_id, c.post_id, c.created_at, c.updated_at FROM comments c WHERE c.id=?",
      [commentId]
    );
    return commentRowData && Comment.fromRawDataWithId(commentRowData);
  }
}
