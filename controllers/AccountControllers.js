import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../services/FirebaseConfig.js';
import { v4 as uuidv4 } from 'uuid';

export const UploadToDatabase = async (req, res) => {
  try {
    const { fileBase64, fileName, userId } = req.body;
    if (!fileBase64 || !fileName || !userId) {
      return res.status(400).json({ error: 'Missing file or metadata' });
    }
    const buffer = Buffer.from(fileBase64, 'base64');
    const uniqueName = `${userId}_${uuidv4()}_${fileName}`;
    const storageRef = ref(storage, `UserImages/${uniqueName}`);
    const snapshot = await uploadBytesResumable(storageRef, buffer, {
      contentType: 'image/jpeg', 
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
