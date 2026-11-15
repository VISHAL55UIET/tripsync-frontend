import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Camera,
  Heart,
  MapPin,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { workspaceApi } from '../../api/workspaceApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const POLAROID_TILTS = [
  'hover:-rotate-1',
  'hover:rotate-1',
  'hover:-rotate-2',
  'hover:rotate-2',
];

function resolveImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default function TripMemoriesPage() {
  const { trip, permissions } = useTrip();
  const { user } = useAuth();

  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [locationTag, setLocationTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Lightbox Modal State
  const [activeMemory, setActiveMemory] = useState(null);

  const loadMemories = useCallback(async () => {
    if (!trip?.id) return;
    try {
      setLoading(true);
      const data = await workspaceApi.getTripMemories(trip.id);
      setMemories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setLoading(false);
    }
  }, [trip?.id]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);
  useEffect(() => {
    const onLiveUpdate = (e) => {
      if (e.detail?.module === 'MEMORY') loadMemories();
    };
    window.addEventListener('tripsync:live-update', onLiveUpdate);
    return () => window.removeEventListener('tripsync:live-update', onLiveUpdate);
  }, [loadMemories]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    setError('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const resetUploadModal = () => {
    setUploadOpen(false);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setCaption('');
    setLocationTag('');
    setError('');
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a photo first.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('caption', caption.trim() || `${trip.destination} Moment`);
      formData.append('locationTag', locationTag.trim() || trip.destination);

      const created = await workspaceApi.uploadTripMemory(trip.id, formData);
      setMemories((prev) => [created, ...prev]);
      resetUploadModal();
    } catch (err) {
      setError(err?.message || 'Failed to upload memory photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleLike = async (memoryId) => {
    try {
      const updated = await workspaceApi.toggleMemoryLike(trip.id, memoryId);
      setMemories((prev) => prev.map((m) => (m.id === memoryId ? updated : m)));
      if (activeMemory?.id === memoryId) {
        setActiveMemory(updated);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleDeleteMemory = async (memoryId) => {
    if (!window.confirm('Remove this photo from the trip wall?')) return;
    try {
      await workspaceApi.deleteTripMemory(trip.id, memoryId);
      setMemories((prev) => prev.filter((m) => m.id !== memoryId));
      if (activeMemory?.id === memoryId) {
        setActiveMemory(null);
      }
    } catch (err) {
      alert(err?.message || 'Failed to delete memory.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/25">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Trip Memories & Polaroid Wall</h2>
            <p className="text-xs text-slate-400">
              {memories.length} {memories.length === 1 ? 'snapshot' : 'snapshots'} pinned from{' '}
              <span className="text-rose-400 font-semibold">{trip.destination}</span>
            </p>
          </div>
        </div>

        {permissions?.canEdit && (
          <button
            type="button"
            onClick={() => {
              setLocationTag(trip.destination || '');
              setUploadOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-rose-600/20 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Pin a Memory</span>
          </button>
        )}
      </div>

      {/* Memories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-80 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/25 text-rose-400 flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-white text-base">Your scrapbook wall is empty</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
            Upload your favorite candid moments, scenic views, or group selfies with captions and
            location tags!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((mem, idx) => {
            const tiltClass = POLAROID_TILTS[idx % POLAROID_TILTS.length];
            const canDelete =
              permissions?.isOwner || mem.uploadedByEmail === user?.email;

            return (
              <div
                key={mem.id}
                className={`group bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-3.5 pb-4 shadow-xl transition-all duration-300 ${tiltClass}`}
              >
                {/* Polaroid Photo Frame */}
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
                  <img
                    src={resolveImageUrl(mem.imageUrl)}
                    alt={mem.caption}
                    onClick={() => setActiveMemory(mem)}
                    className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Overlay Actions */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setActiveMemory(mem)}
                      className="p-1.5 rounded-lg bg-slate-950/80 text-white hover:bg-indigo-600 backdrop-blur-md transition"
                      title="Full View"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMemory(mem.id)}
                        className="p-1.5 rounded-lg bg-slate-950/80 text-rose-300 hover:bg-rose-600 hover:text-white backdrop-blur-md transition"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Location Pill */}
                  {mem.locationTag && (
                    <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800/80 backdrop-blur-md text-[11px] font-medium text-slate-200">
                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate max-w-[160px]">{mem.locationTag}</span>
                    </div>
                  )}
                </div>

                {/* Polaroid Caption & Like Footer */}
                <div className="pt-3.5 px-1 space-y-2.5">
                  <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
                    “{mem.caption}”
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div className="text-[11px] text-slate-400 truncate">
                      Pinned by <span className="text-slate-200 font-medium">{mem.uploadedByName}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleLike(mem.id)}
                      title={
                        mem.likedByNames?.length > 0
                          ? `Liked by: ${mem.likedByNames.join(', ')}`
                          : 'Like this memory'
                      }
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition ${
                        mem.likedByCurrentUser
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-rose-300 hover:border-rose-500/30'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          mem.likedByCurrentUser ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                      <span>{mem.likeCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Memory Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-white text-base">Pin a Trip Memory</h3>
              </div>
              <button
                type="button"
                onClick={resetUploadModal}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                  {error}
                </div>
              )}

              {/* Photo Picker / Preview */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-[16/10] w-full rounded-xl border-2 border-dashed border-slate-700 hover:border-rose-500/60 bg-slate-950 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Camera className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-white">Click to choose a photo</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, WEBP supported</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Caption / Story *
                </label>
                <input
                  type="text"
                  maxLength={250}
                  required
                  placeholder="e.g., Sunset Maggi point after 4km trek!"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Location Tag
                </label>
                <input
                  type="text"
                  maxLength={120}
                  placeholder="e.g., Old Manali Cafe"
                  value={locationTag}
                  onChange={(e) => setLocationTag(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-rose-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetUploadModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white disabled:opacity-50 transition"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Post to Wall</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {activeMemory && (
        <div
          onClick={() => setActiveMemory(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl"
          >
            <div className="relative bg-black max-h-[70vh] flex items-center justify-center">
              <img
                src={resolveImageUrl(activeMemory.imageUrl)}
                alt={activeMemory.caption}
                className="max-h-[70vh] w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setActiveMemory(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-white hover:bg-rose-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-base font-bold text-white">“{activeMemory.caption}”</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>By {activeMemory.uploadedByName}</span>
                  {activeMemory.locationTag && (
                    <span className="inline-flex items-center gap-1 text-rose-300">
                      <MapPin className="w-3.5 h-3.5" />
                      {activeMemory.locationTag}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleLike(activeMemory.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  activeMemory.likedByCurrentUser
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-rose-500/40'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    activeMemory.likedByCurrentUser ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
                <span>
                  {activeMemory.likeCount} {activeMemory.likeCount === 1 ? 'Like' : 'Likes'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}