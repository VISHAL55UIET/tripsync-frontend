import axiosClient from './axiosClient';

export const financeApi = {
  // Expenses
  getExpenses: (tripId) => axiosClient.get(`/api/trips/${tripId}/expenses`),
  addExpense: (tripId, data) => axiosClient.post(`/api/trips/${tripId}/expenses`, data),
  updateExpense: (tripId, expenseId, data) =>
    axiosClient.put(`/api/trips/${tripId}/expenses/${expenseId}`, data),
  deleteExpense: (tripId, expenseId) =>
    axiosClient.delete(`/api/trips/${tripId}/expenses/${expenseId}`),

  // Balances & Settlements
  getBalances: (tripId) => axiosClient.get(`/api/trips/${tripId}/balances`),
  getSettlements: (tripId) => axiosClient.get(`/api/trips/${tripId}/settlements`),
  recordSettlement: (tripId, data) =>
    axiosClient.post(`/api/trips/${tripId}/settlements/settlements`, data),
};