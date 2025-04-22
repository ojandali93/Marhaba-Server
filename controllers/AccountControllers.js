import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../services/FirebaseConfig.js';
import { v4 as uuidv4 } from 'uuid';

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