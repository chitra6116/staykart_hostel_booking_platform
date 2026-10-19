import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { propertyApi } from '../../api/propertyApi';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import {
  Upload,
  Star,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Building,
  BedDouble,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortablePhotoCard({ image, onSetCover, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border-2 transition-all group ${
        image.isCover ? 'border-amber-400 shadow-md ring-2 ring-amber-400/30' : 'border-transparent shadow-sm'
      }`}
    >
      <img
        src={image.cardUrl || image.thumbnailUrl}
        alt={image.altText || 'Gallery photo'}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Overlay Actions */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
        {/* Top Controls: Drag handle + Cover Indicator */}
        <div className="flex items-center justify-between">
          <button
            {...attributes}
            {...listeners}
            className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
            type="button"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {image.isCover && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-slate-950" />
              Cover Photo
            </span>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between gap-2 pt-2">
          {!image.isCover && (
            <button
              onClick={() => onSetCover(image)}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold backdrop-blur-md flex items-center gap-1 transition-colors"
              title="Set as Cover"
              type="button"
            >
              <Star className="w-3 h-3 text-amber-300" />
              <span>Set Cover</span>
            </button>
          )}

          <button
            onClick={() => onDelete(image)}
            className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white ml-auto transition-colors"
            title="Delete Image"
            type="button"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminManagePhotosPage() {
  const toast = useToast();
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const res = await propertyApi.search({ size: 100 });
        const list = res.content || [];
        setProperties(list);
        if (list.length > 0) {
          setSelectedPropertyId(list[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load properties', err);
      }
    };
    loadProperties();
  }, []);

  const loadPropertyPhotos = async () => {
    if (!selectedPropertyId) return;
    setLoading(true);
    try {
      const prop = await propertyApi.getById(selectedPropertyId);
      setImages(prop.images || []);
    } catch (err) {
      console.error('Failed to load photos', err);
      toast.error('Failed to load gallery photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPropertyPhotos();
  }, [selectedPropertyId]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex);
    setImages(reordered);

    try {
      const ids = reordered.map((img) => img.id);
      await adminApi.reorderImages(ids);
      toast.success('Gallery order updated');
    } catch (err) {
      console.error('Failed to save photo reorder', err);
      toast.error('Failed to save gallery order');
      loadPropertyPhotos();
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      await adminApi.uploadPropertyImages(selectedPropertyId, formData);
      toast.success('Photos uploaded successfully');
      loadPropertyPhotos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSetCover = async (img) => {
    try {
      await adminApi.updateImage(img.id, { isCover: true, altText: img.altText });
      toast.success('Cover photo updated');
      loadPropertyPhotos();
    } catch (err) {
      toast.error('Failed to update cover photo');
    }
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;
    try {
      await adminApi.deleteImage(imageToDelete.id);
      toast.success('Photo deleted from disk and gallery');
      setDeleteModalOpen(false);
      loadPropertyPhotos();
    } catch (err) {
      toast.error('Failed to delete photo');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Photo Gallery &amp; Reordering
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Drag and drop to reorder gallery pictures, designate cover photos, and upload WebP assets.
          </p>
        </div>

        {/* Upload Trigger Button */}
        <label className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-teal-500/25 cursor-pointer self-start sm:self-auto">
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>{uploading ? 'Processing WebP...' : 'Upload Photos'}</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Property Selector */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
        <Building className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
          Select Hotel Property:
        </label>
        <select
          value={selectedPropertyId}
          onChange={(e) => setSelectedPropertyId(e.target.value)}
          className="flex-1 max-w-md px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.city})
            </option>
          ))}
        </select>
      </div>

      {/* Gallery Grid with DND */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60 text-xs text-slate-500">
          <span>{images.length} photos in gallery &bull; Drag tile by grip handle to reorder</span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            Starred photo is shown as main property cover
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-300" />
            <p>No photos uploaded for this property yet.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img) => (
                  <SortablePhotoCard
                    key={img.id}
                    image={img}
                    onSetCover={handleSetCover}
                    onDelete={(i) => {
                      setImageToDelete(i);
                      setDeleteModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Photo"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Are you sure you want to delete this photograph? It will be removed from disk storage and no longer appear in guest galleries.
          </p>

          <div className="flex gap-3 pt-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
