import { auth } from "@/app/(auth)/auth";
import { deleteUser } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:auth").toResponse();
    }

    if (session.user.type !== "regular") {
      return new ChatSDKError("forbidden:auth").toResponse();
    }

    await deleteUser(session.user.id);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return new ChatSDKError("bad_request:auth").toResponse();
  }
}
