import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mic, MicOff, MapPin, Upload, X, Send, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { submissionService } from '../../services/submissionService';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { useGeolocation } from '../../hooks/useGeolocation';
import { CATEGORIES, LANGUAGES } from '../../constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SubmitIssue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN'); // Default to Hindi
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      category: '',
      title: '',
      description: '',
      isAnonymous: false,
    }
  });

  const description = watch('description');

  // Hooks
  const { 
    isRecording, transcript, startRecording, stopRecording, clearRecording 
  } = useVoiceRecorder(selectedLanguage);
  
  const { coordinates, requestLocation, loaded: locationLoaded, error: locationError } = useGeolocation({ autoRequest: false });

  // Update description when voice transcript changes
  useEffect(() => {
    if (transcript) {
      const currentDesc = watch('description');
      setValue('description', currentDesc ? `${currentDesc} ${transcript}` : transcript);
      clearRecording(); // Clear after appending so we don't duplicate on next update
    }
  }, [transcript, setValue, watch, clearRecording]);

  // Handle Image Upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      toast.error('You can only upload a maximum of 3 images');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]); // Free memory
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const onSubmit = async (data) => {
    if (!coordinates) {
      toast.error('Please provide location data before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('isAnonymous', data.isAnonymous);
      formData.append('originalLanguage', selectedLanguage.split('-')[0]);
      
      // Location data (using user's base location if exact GPS fails, but we require coordinates)
      const locationData = {
        type: 'Point',
        coordinates: coordinates,
        state: user.state,
        district: user.district,
        constituency: user.constituency
      };
      formData.append('location', JSON.stringify(locationData));

      // Append images
      images.forEach(image => {
        formData.append('images', image);
      });

      // We're omitting voice blob upload here for simplicity, using just the transcript 
      // which is already appended to the description. For full implementation, we'd append the audioBlob.

      const response = await submissionService.create(formData);
      
      toast.success('Issue submitted successfully!');
      navigate(`/citizen/track/${response.submission._id}`);
      
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to submit issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Report an Issue</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Your submission will be analyzed by AI and sent directly to your representative.
        </p>
      </div>

      <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex gap-3 text-warning-700 dark:text-warning-400">
        <AlertCircle className="shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">AI Duplicate Detection is Active</p>
          <p>Please ensure you are not reporting an issue that has already been submitted in your area. Our system will flag exact duplicates.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Category & Title */}
        <div className="glass-card p-6 rounded-xl space-y-5">
          <h2 className="text-lg font-semibold border-b border-border pb-3">Basic Details</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1.5">Category *</label>
            <select
              className={`w-full px-4 py-2.5 bg-surface border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${errors.category ? 'border-danger' : 'border-border'}`}
              {...register('category', { required: 'Please select a category' })}
            >
              <option value="">Select the type of issue...</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1.5 text-sm text-danger">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Brief Title *</label>
            <input
              type="text"
              className={`w-full px-4 py-2.5 bg-surface border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${errors.title ? 'border-danger' : 'border-border'}`}
              placeholder="e.g. Broken water pipe in Sector 4"
              {...register('title', { 
                required: 'Title is required',
                minLength: { value: 10, message: 'Title must be at least 10 characters' }
              })}
            />
            {errors.title && <p className="mt-1.5 text-sm text-danger">{errors.title.message}</p>}
          </div>
        </div>

        {/* Description & Voice */}
        <div className="glass-card p-6 rounded-xl space-y-5">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h2 className="text-lg font-semibold">Description</h2>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Language:</span>
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-xs bg-surface border border-border rounded p-1"
              >
                <option value="en-US">English</option>
                <option value="hi-IN">Hindi</option>
                <option value="mr-IN">Marathi</option>
                <option value="bn-IN">Bengali</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-1.5">
              <label className="block text-sm font-medium">Detailed Description *</label>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isRecording 
                    ? 'bg-danger/10 text-danger animate-pulse' 
                    : 'bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400'
                }`}
              >
                {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                {isRecording ? 'Stop Recording' : 'Dictate with AI'}
              </button>
            </div>
            
            <textarea
              rows="5"
              className={`w-full px-4 py-3 bg-surface border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${errors.description ? 'border-danger' : 'border-border'}`}
              placeholder="Describe the issue in detail. You can type or use the voice dictation feature above..."
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 20, message: 'Please provide more details (min 20 characters)' }
              })}
            ></textarea>
            {errors.description && <p className="mt-1.5 text-sm text-danger">{errors.description.message}</p>}
          </div>
        </div>

        {/* Location & Media */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-lg font-semibold border-b border-border pb-3 mb-4">Location *</h2>
            
            <div className="space-y-4">
              <div className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-primary-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Current Selection:</p>
                    {coordinates ? (
                      <p className="text-xs text-success mt-1">
                        GPS acquired: {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        {user?.district}, {user?.state} (Default)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={requestLocation}
                disabled={locationLoaded && !!coordinates}
                className="w-full py-2 bg-surface hover:bg-surfaceHover border border-border rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {coordinates ? 'Location Captured ✓' : 'Capture Exact GPS Location'}
              </button>
              
              {!coordinates && (
                <p className="text-xs text-danger text-center">GPS coordinates are required for the heatmap.</p>
              )}
            </div>
          </div>

          {/* Media */}
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-lg font-semibold border-b border-border pb-3 mb-4 flex items-center justify-between">
              Photos 
              <span className="text-xs font-normal text-gray-500">Max 3</span>
            </h2>
            
            <div className="space-y-4">
              {/* Upload Button */}
              {images.length < 3 && (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg cursor-pointer transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500">Click to upload images</p>
                  </div>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                </label>
              )}

              {/* Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Options & Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 bg-surface border-border" 
              {...register('isAnonymous')}
            />
            <span className="text-sm font-medium">Submit Anonymously</span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting || !coordinates}
            className="w-full sm:w-auto px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="text-white" />
                Processing via AI...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Issue
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitIssue;
