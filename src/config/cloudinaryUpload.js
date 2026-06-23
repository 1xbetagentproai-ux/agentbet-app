// ═══════════════════════════════════════════════════════════════
//  1xBet Agent Pro — Upload de preuves de paiement vers Cloudinary
//  Fichier : cloudinaryUpload.js
// ═══════════════════════════════════════════════════════════════

// ── Configuration Cloudinary du projet 1xBet Agent Pro ──
const CLOUDINARY_CLOUD_NAME = "dafsklnej";
const CLOUDINARY_UPLOAD_PRESET = "1xbet_proofs";

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Upload une image (preuve de paiement) vers Cloudinary
 * @param {string} imageUri - URI locale de l'image (depuis ImagePicker)
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadProofImage(imageUri) {
  try {
    const formData = new FormData();

    // Préparer le fichier pour l'upload
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      type,
      name: filename || 'proof.jpg',
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', '1xbet-proofs'); // organise dans un dossier dédié

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();

    if (data.secure_url) {
      return { success: true, url: data.secure_url };
    } else {
      console.error('Erreur upload Cloudinary:', data);
      return { success: false, error: data.error?.message || 'Échec de l\'upload.' };
    }
  } catch (error) {
    console.error('Erreur réseau upload:', error);
    return { success: false, error: 'Impossible d\'uploader l\'image. Vérifiez votre connexion.' };
  }
}

export default { uploadProofImage };
