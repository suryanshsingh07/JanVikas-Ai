import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mic, MicOff, MapPin, Upload, X, Send, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import L from 'leaflet';
import { useAuth } from '../../hooks/useAuth';
import { submissionService } from '../../services/submissionService';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { useGeolocation } from '../../hooks/useGeolocation';
import { CATEGORIES, LANGUAGES } from '../../constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BackButton from '../../components/common/BackButton';
import { MapContainer, TileLayer, Marker, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SubmitIssue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [speechLanguage, setSpeechLanguage] = useState('en-US'); // Default to English for voice recognition
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationMode, setLocationMode] = useState('live'); // live or manual
  const [placeName, setPlaceName] = useState('');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [locationDetailsError, setLocationDetailsError] = useState(null);
  const [loadingLocationDetails, setLoadingLocationDetails] = useState(false);
  
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
    isRecording, transcript, startRecording, stopRecording, clearRecording, clearTranscript 
  } = useVoiceRecorder(speechLanguage);
  
  const originalLanguage = speechLanguage === 'auto'
    ? (navigator.language?.split('-')[0] || 'en')
    : speechLanguage.split('-')[0];

  const { coordinates, requestLocation, loaded: locationLoaded, error: locationError } = useGeolocation({ autoRequest: true });

  const mapCenter = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : coordinates
      ? [coordinates[1], coordinates[0]]
      : [20.5937, 78.9629]; // India center fallback

  useEffect(() => {
    if (locationMode === 'live' && coordinates) {
      setSelectedLocation({ lat: coordinates[1], lng: coordinates[0] });
    }
  }, [coordinates, locationMode]);

  useEffect(() => {
    if (!selectedLocation) {
      setPlaceName('');
      setNearbyPlaces([]);
      setLocationDetailsError(null);
      return;
    }

    const controller = new AbortController();
    const fetchLocationDetails = async () => {
      setLoadingLocationDetails(true);
      setLocationDetailsError(null);
      setNearbyPlaces([]);

      const lat = selectedLocation.lat;
      const lng = selectedLocation.lng;

      try {
        const reverseResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
          { signal: controller.signal }
        );

        if (reverseResponse.ok) {
          const reverseData = await reverseResponse.json();
          setPlaceName(reverseData.display_name || 'Selected location');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLocationDetailsError('Unable to fetch address details.');
        }
      }

      try {
        const query = `
          [out:json][timeout:10];
          (
            node(around:250,${lat},${lng})["name"]["tourism"];
            node(around:250,${lat},${lng})["name"]["historic"];
            node(around:250,${lat},${lng})["name"]["amenity"];
            node(around:250,${lat},${lng})["name"]["shop"];
            node(around:250,${lat},${lng})["name"]["leisure"];
            way(around:250,${lat},${lng})["name"]["tourism"];
            way(around:250,${lat},${lng})["name"]["historic"];
            way(around:250,${lat},${lng})["name"]["amenity"];
            way(around:250,${lat},${lng})["name"]["shop"];
            way(around:250,${lat},${lng})["name"]["leisure"];
          );
          out center 20;
        `;

        const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
          signal: controller.signal,
          headers: { 'Content-Type': 'text/plain' },
        });

        if (overpassResponse.ok) {
          const overpassData = await overpassResponse.json();
          const places = overpassData.elements
            .map((item) => {
              const name = item.tags?.name;
              if (!name) return null;
              const type = item.tags?.tourism || item.tags?.historic || item.tags?.amenity || item.tags?.shop || item.tags?.leisure || 'place';
              const lat = item.type === 'node'
                ? item.lat
                : item.center?.lat;
              const lng = item.type === 'node'
                ? item.lon
                : item.center?.lon;
              if (lat == null || lng == null) return null;
              return {
                id: `${item.type}-${item.id}`,
                name,
                type,
                lat,
                lng,
              };
            })
            .filter(Boolean)
            .slice(0, 8);

          setNearbyPlaces(places);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLocationDetailsError('Unable to load nearby landmarks.');
        }
      } finally {
        setLoadingLocationDetails(false);
      }
    };

    fetchLocationDetails();
    return () => controller.abort();
  }, [selectedLocation]);

  const LocationPicker = () => {
    const map = useMap();

    useEffect(() => {
      if (locationMode === 'live' && selectedLocation) {
        map.setView([selectedLocation.lat, selectedLocation.lng], map.getZoom());
      }
    }, [locationMode, selectedLocation, map]);

    useMapEvents({
      click(e) {
        setSelectedLocation(e.latlng);
        setLocationMode('manual');
      },
    });
    return null;
  };

  // Update description when voice transcript changes
  useEffect(() => {
    if (transcript) {
      const currentDesc = watch('description');
      setValue('description', currentDesc ? `${currentDesc} ${transcript}` : transcript);
      clearTranscript(); // Clear only the transcript string to preserve the audio blob
    }
  }, [transcript, setValue, watch, clearTranscript]);

  // Handle Image Upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('You can only upload a maximum of 5 images');
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

  // Handle Video Upload
  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + videos.length > 2) {
      toast.error('You can only upload a maximum of 2 videos');
      return;
    }

    // Check size limit for each video (e.g. 50MB)
    const validFiles = files.filter(file => {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`Video ${file.name} exceeds 50MB limit`);
        return false;
      }
      return true;
    });

    const newVideos = [...videos, ...validFiles];
    setVideos(newVideos);

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setVideoPreviews([...videoPreviews, ...newPreviews]);
  };

  const removeVideo = (index) => {
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    setVideos(newVideos);

    const newPreviews = [...videoPreviews];
    URL.revokeObjectURL(newPreviews[index]); // Free memory
    newPreviews.splice(index, 1);
    setVideoPreviews(newPreviews);
  };

  const onSubmit = async (data) => {
    const finalCoordinates = selectedLocation
      ? [selectedLocation.lng, selectedLocation.lat]
      : coordinates;

    if (!finalCoordinates) {
      toast.error('Please select a pin on the map or capture your GPS location.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('isAnonymous', data.isAnonymous);
      formData.append('originalLanguage', originalLanguage);
      
      const locationData = {
        type: 'Point',
        coordinates: finalCoordinates,
        state: user.state,
        district: user.district,
        constituency: user.constituency
      };
      formData.append('location', JSON.stringify(locationData));

      // Append images
      images.forEach(image => {
        formData.append('images', image);
      });

      // Append videos
      videos.forEach(video => {
        formData.append('videos', video);
      });

      // We're omitting voice blob upload here for simplicity, using just the transcript 
      // which is already appended to the description. For full implementation, we'd append the audioBlob.

      const response = await submissionService.create(formData);
      
      toast.success('Issue submitted successfully!');
      navigate(`/submissions/${response.submission._id}`);
      
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to submit issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <BackButton className="mb-6" />
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
                value={speechLanguage}
                onChange={(e) => setSpeechLanguage(e.target.value)}
                className="text-xs bg-surface border border-border rounded p-1"
              >
                <option value="en-US">English</option>
                <option value="auto">Auto Detect (Browser Language)</option>
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
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">Current Selection:</p>
                      <span className={`text-[11px] font-semibold uppercase tracking-[0.15em] px-2 py-1 rounded-full ${locationMode === 'live' ? 'bg-primary-100 text-primary-700' : 'bg-surface text-gray-700'}`}>
                        {locationMode === 'live' ? 'Live' : 'Manual'}
                      </span>
                    </div>
                    {selectedLocation ? (
                      <p className="text-xs text-success mt-1">
                        {locationMode === 'live' ? 'Live GPS location:' : 'Manual pin location:'} {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                      </p>
                    ) : coordinates ? (
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

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLocationMode('live');
                    requestLocation();
                  }}
                  className={`flex-1 py-2 bg-surface hover:bg-surfaceHover border border-border rounded-lg text-sm font-medium transition-colors ${locationMode === 'live' ? 'ring-2 ring-primary-500' : ''}`}
                >
                  Use live location
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode('manual')}
                  className={`flex-1 py-2 bg-surface hover:bg-surfaceHover border border-border rounded-lg text-sm font-medium transition-colors ${locationMode === 'manual' ? 'ring-2 ring-primary-500' : ''}`}
                >
                  Set location manually
                </button>
              </div>

              {locationError && (
                <p className="text-xs text-danger text-center">Location error: {locationError.message}</p>
              )}

              <div className="h-72 rounded-xl overflow-hidden border border-border mt-4">
                <MapContainer center={mapCenter} zoom={15} scrollWheelZoom className="h-full w-full">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker />
                  {(selectedLocation || coordinates) && (
                    <>
                      <Marker
                        position={[selectedLocation ? selectedLocation.lat : coordinates[1], selectedLocation ? selectedLocation.lng : coordinates[0]]}
                      />
                      {locationMode === 'live' && selectedLocation && (
                        <CircleMarker
                          center={[selectedLocation.lat, selectedLocation.lng]}
                          radius={10}
                          pathOptions={{ color: '#2563eb', fillColor: '#93c5fd', fillOpacity: 0.35 }}
                      >
                          <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                            Live GPS location
                          </Tooltip>
                        </CircleMarker>
                      )}
                    </>
                  )}
                  {nearbyPlaces.map((place) => (
                    <CircleMarker
                      key={place.id}
                      center={[place.lat, place.lng]}
                      radius={7}
                      pathOptions={{ color: '#0f766e', fillColor: '#5eead4', fillOpacity: 0.45 }}
                    >
                      <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                        <span className="text-xs font-semibold">{place.name}</span><br />
                        <span className="text-[11px]">{place.type}</span>
                      </Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>

              <p className="text-xs text-gray-500 mt-2 text-center">
                {locationMode === 'live'
                  ? 'Using device location automatically. Tap the map to switch to manual placement.'
                  : 'Tap on the map to choose a location manually. You can switch back to live location at any time.'}
              </p>

              <div className="mt-4 rounded-xl bg-surface border border-border p-3">
                <p className="text-sm font-medium mb-2">Nearby places and landmarks</p>
                {loadingLocationDetails ? (
                  <p className="text-xs text-gray-500">Loading nearby landmarks…</p>
                ) : locationDetailsError ? (
                  <p className="text-xs text-danger">{locationDetailsError}</p>
                ) : (
                  <>
                    {placeName && <p className="text-xs text-gray-600 mb-2">{placeName}</p>}
                    {nearbyPlaces.length > 0 ? (
                      <ul className="space-y-1 text-xs text-gray-700">
                        {nearbyPlaces.map(place => (
                          <li key={place.id} className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-primary-500" />
                            <span>{place.name} <span className="text-gray-400">({place.type})</span></span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500">No nearby landmarks found for this location.</p>
                    )}
                  </>
                )}
              </div>

              {!coordinates && !selectedLocation && (
                <p className="text-xs text-danger text-center">Please capture GPS or choose a pin on the map.</p>
              )}
            </div>
          </div>

          {/* Media */}
          <div className="glass-card p-6 rounded-xl flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold border-b border-border pb-3 mb-4 flex items-center justify-between">
                Photos 
                <span className="text-xs font-normal text-gray-500">Max 5</span>
              </h2>
              
              <div className="space-y-4">
                {/* Upload Button */}
                {images.length < 5 && (
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

            <div>
              <h2 className="text-lg font-semibold border-b border-border pb-3 mb-4 flex items-center justify-between">
                Videos
                <span className="text-xs font-normal text-gray-500">Max 2</span>
              </h2>
              
              <div className="space-y-4">
                {videos.length < 2 && (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg cursor-pointer transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">Click to upload videos</p>
                    </div>
                    <input type="file" accept="video/*" multiple className="hidden" onChange={handleVideoChange} />
                  </label>
                )}

                {videoPreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {videoPreviews.map((url, idx) => (
                      <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-black">
                        <video src={url} className="w-full h-full object-cover" controls />
                        <button
                          type="button"
                          onClick={() => removeVideo(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger z-10"
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
            disabled={isSubmitting || !(coordinates || selectedLocation)}
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
