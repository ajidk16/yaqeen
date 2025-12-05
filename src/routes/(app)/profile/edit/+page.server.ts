import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { PageServerLoad, Actions } from "./$types";
import { deleteImage, getPublicIdFromUrl, uploadImageFromBuffer } from "$lib/server/cloudinary";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}

	const currentUser = await db.query.user.findFirst({
		where: eq(user.id, locals.user.id)
	});

	if (!currentUser) {
		throw redirect(302, "/login");
	}

	return {
		user: currentUser
	};
};

export const actions: Actions = {
	update: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401);
		}

		const formData = await request.formData();
		const name = formData.get("fullName") as string;
		const username = formData.get("username") as string;
		const bio = formData.get("bio") as string;
		const location = formData.get("location") as string;
		const theme = formData.get("theme") as string; // 'light' | 'dark'
		const notifications = formData.get("notifications") === 'on';
		const image = formData.get("image") as File;

		// Handle avatar upload (simplified for now, assuming base64 or URL if client handles upload)
		// Ideally, we should handle file upload here or use a signed URL for client-side upload.
		// For this implementation, let's assume the client sends the avatar URL or we skip it for now if complex.
		// Wait, the previous code used a FileReader to set `user.avatar`. 
		// If we want to persist it, we need to upload it.
		// Since I don't have a storage bucket setup in the prompt, I will skip actual file upload logic 
		// and just update text fields for now, or assume the avatar is a URL string if provided.
		// Let's stick to updating text fields first.

		if (!name) {
			return fail(400, { message: "Name is required" });
		}

		const oldPost = await db.query.user.findFirst({
			where: eq(user.id, locals.user.id)
		});

		if (!oldPost) {
			return { success: false, error: 'Post not found' };
		}


		let coverImage = oldPost.image || '';

		if (
			image &&
			image instanceof File &&
			image.size > 0
		) {
			const buffer = Buffer.from(await image.arrayBuffer());

			try {
				if (oldPost.image) {
					const publicId = getPublicIdFromUrl(oldPost.image);
					if (publicId) {
						console.log('Deleting old image with public ID:', publicId);
						await deleteImage(publicId);
					}
				}

				const result = await uploadImageFromBuffer(buffer, 'yaaqeen/avatars');
				coverImage = result.secure_url;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';

				return fail(500, { status: 500, message: `Failed to upload avatar: ${errorMessage}` });
			}
		}

		try {
			await db.update(user)
				.set({
					name,
					username,
					bio,
					location: { city: location },
					preferences: {
						notifications
					},
					updatedAt: new Date(),
					image: coverImage
				})
				.where(eq(user.id, locals.user.id));
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Failed to update profile" });
		}

		return { success: true, theme };
	}
};
