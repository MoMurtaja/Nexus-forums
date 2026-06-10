import React, { useState } from 'react';
import { supabase } from './supabaseClient'; // Import our new connection

export default function App() {
  const [user, setUser] = useState({ username: "MoMurtaja", role: "owner" }); // Simulated logged-in user
  const [newPostText, setNewPostText] = useState('');
  const [imageFile, setImageFile] = useState(null); // Track selected image file
  const [loading, setLoading] = useState(false);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    setLoading(true);
    let imageUrl = null;

    try {
      // 1. IF AN IMAGE WAS SELECTED, UPLOAD IT TO THE STORAGE BUCKET FIRST
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`; // Create a unique file name
        const filePath = `post-images/${fileName}`;

        // Upload file to Supabase Bucket named "images"
        let { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Get the public URL of the uploaded image
        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      // 2. INSERT THE TEXT AND THE IMAGE URL INTO THE SUPABASE DATABASE
      const { error: dbError } = await supabase
        .from('posts')
        .insert([
          {
            author: user.username,
            role: user.role,
            content: newPostText.trim(),
            image_url: imageUrl, // Saves the link to the image (or null if no image)
            created_at: new Date()
          }
        ]);

      if (dbError) throw dbError;

      // Clear form on success
      setNewPostText('');
      setImageFile(null);
      alert('Post published globally!');

    } catch (error) {
      alert('Error publishing post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreatePost} className="post-creator-form">
      <textarea 
        value={newPostText}
        onChange={(e) => setNewPostText(e.target.value)}
        placeholder="Broadcast a new topic to the network..."
        required
      />
      
      {/* File input for images */}
      <div className="file-upload-row" style={{ marginTop: '10px' }}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setImageFile(e.target.files[0])} 
        />
      </div>

      <button type="submit" className="btn-primary-small" disabled={loading}>
        {loading ? 'Uploading...' : 'Publish Thread'}
      </button>
    </form>
  );
}

