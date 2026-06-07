'use server';

import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { message: 'Not authenticated', success: false };
    }

    const username = formData.get('username') as string;
    const bio = formData.get('bio') as string;
    const avatarFile = formData.get('avatar') as File;
    
    const firstName = (formData.get('firstName') as string) || '';
    const lastName = (formData.get('lastName') as string) || '';
    const dob = (formData.get('dob') as string) || '';
    const instagram = (formData.get('instagram') as string) || '';
    const twitter = (formData.get('twitter') as string) || '';
    const youtube = (formData.get('youtube') as string) || '';

    if (!username || username.trim().length < 3) {
        return { message: 'Username must be at least 3 characters long.', success: false };
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    // Update Auth User Metadata
    try {
        await supabase.auth.updateUser({
            data: {
                dob,
                instagram,
                twitter,
                youtube,
                full_name: fullName
            }
        });
    } catch (authErr) {
        console.warn('Failed to update auth metadata:', authErr);
    }

    const updates: any = {
        username: username.trim(),
        full_name: fullName || null,
        bio: bio ? bio.trim() : null,
        updated_at: new Date().toISOString(),
    };

    // Handle Avatar Upload
    if (avatarFile && avatarFile.size > 0) {
        // Validate file type
        if (!avatarFile.type.startsWith('image/')) {
            return { message: 'File is not a valid image.', success: false };
        }

        // validate file size (e.g., 5MB limit)
        if (avatarFile.size > 5 * 1024 * 1024) {
            return { message: 'Image size must be less than 5MB.', success: false };
        }

        // --- NEW: Delete old avatar if exists ---
        try {
            // Get current profile to find old avatar
            const { data: currentProfile } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .single();

            if (currentProfile?.avatar_url) {
                const oldUrl = currentProfile.avatar_url;
                // Check if it's a Supabase hosted image (contains '/avatars/')
                if (oldUrl.includes('/avatars/')) {
                    // Extract filename: .../avatars/filename.ext
                    const oldPath = oldUrl.split('/avatars/').pop();
                    if (oldPath) {
                        const { error: removeError } = await supabase.storage
                            .from('avatars')
                            .remove([oldPath]);

                        if (removeError) {
                            console.warn('Failed to delete old avatar:', removeError);
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('Error handling old avatar deletion:', err);
            // Don't block update if deletion fails
        }
        // ----------------------------------------

        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, {
                upsert: true
            });

        if (uploadError) {
            console.error('Avatar Upload Error:', uploadError);
            return { message: 'Failed to upload avatar image.', success: false };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        updates.avatar_url = publicUrl;
    } else {
    }

    // Update Profile Record
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

    if (error) {
        // Postgres Unique Constraint Violation Code: 23505
        if (error.code === '23505') {
            return { message: 'This username is already taken.', success: false };
        }
        console.error('Update Profile Error:', error);
        return { message: 'Failed to update profile.', success: false };
    }

    revalidatePath(`/profile/${user.id}`);
    revalidatePath('/'); // Refresh places where username might be shown (like Navbar)

    return {
        message: 'Profile updated!',
        success: true,
        data: {
            avatar_url: updates.avatar_url,
            username: updates.username,
            full_name: updates.full_name,
            bio: updates.bio
        }
    };
}
