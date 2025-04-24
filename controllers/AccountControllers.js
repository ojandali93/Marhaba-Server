import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../services/FirebaseConfig.js';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/SupabaseClient.js';

export const UploadToDatabase = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;

    if (!userId || !file) {
      return res.status(400).json({ error: 'Missing userId or image file' });
    }

    const fileName = `${userId}_${uuidv4()}_${file.originalname}`;
    const storageRef = ref(storage, `UserImages/${fileName}`);

    const snapshot = await uploadBytesResumable(storageRef, file.buffer, {
      contentType: file.mimetype,
    });

    const downloadURL = await getDownloadURL(snapshot.ref);

    return res.status(200).json({
      success: true,
      url: downloadURL,
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
};

export const createUserAccount = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const { data: signupUser, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (signUpError) {
      throw signUpError
    }
    const userId = signupUser.user.id;

    if(userId){
      return res.status(200).json({ success: true, data: userId})
    } else {
      return res.status(400).json({ error: signUpError.message });
    }

  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
};