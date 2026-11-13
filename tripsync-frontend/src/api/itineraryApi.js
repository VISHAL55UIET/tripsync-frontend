import axiosClient from './axiosClient';

export const itineraryApi = {
  // Itineraries (Days)
  getItineraries: (tripId) => axiosClient.get(`/api/trips/${tripId}/itineraries`),
  getItinerary: (tripId, itineraryId) =>
    axiosClient.get(`/api/trips/${tripId}/itineraries/${itineraryId}`),
  createItinerary: (tripId, data) =>
    axiosClient.post(`/api/trips/${tripId}/itineraries`, data), // { date, note }
  updateItinerary: (tripId, itineraryId, data) =>
    axiosClient.put(`/api/trips/${tripId}/itineraries/${itineraryId}`, data),
  deleteItinerary: (tripId, itineraryId) =>
    axiosClient.delete(`/api/trips/${tripId}/itineraries/${itineraryId}`),

  // Activities
  getActivities: (tripId, itineraryId) =>
    axiosClient.get(`/api/trips/${tripId}/itineraries/${itineraryId}/activities`),
  createActivity: (tripId, itineraryId, data) =>
    axiosClient.post(`/api/trips/${tripId}/itineraries/${itineraryId}/activities`, data),
  updateActivity: (tripId, itineraryId, activityId, data) =>
    axiosClient.put(`/api/trips/${tripId}/itineraries/${itineraryId}/activities/${activityId}`, data),
  deleteActivity: (tripId, itineraryId, activityId) =>
    axiosClient.delete(`/api/trips/${tripId}/itineraries/${itineraryId}/activities/${activityId}`),
};