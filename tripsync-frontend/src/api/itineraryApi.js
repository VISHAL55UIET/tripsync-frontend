import axiosClient from './axiosClient';

export const itineraryApi = {
  getItineraries: (tripId) => axiosClient.get(`/api/trips/${tripId}/itineraries`),
  createItinerary: (tripId, data) =>
    axiosClient.post(`/api/trips/${tripId}/itineraries`, data),
  updateItinerary: (tripId, itineraryId, data) =>
    axiosClient.put(`/api/trips/${tripId}/itineraries/${itineraryId}`, data),
  deleteItinerary: (tripId, itineraryId) =>
    axiosClient.delete(`/api/trips/${tripId}/itineraries/${itineraryId}`),

  addActivity: (tripId, itineraryId, data) =>
    axiosClient.post(`/api/trips/${tripId}/itineraries/${itineraryId}/activities`, data),
  updateActivity: (tripId, itineraryId, activityId, data) =>
    axiosClient.put(
      `/api/trips/${tripId}/itineraries/${itineraryId}/activities/${activityId}`,
      data
    ),
  deleteActivity: (tripId, itineraryId, activityId) =>
    axiosClient.delete(
      `/api/trips/${tripId}/itineraries/${itineraryId}/activities/${activityId}`
    ),
};