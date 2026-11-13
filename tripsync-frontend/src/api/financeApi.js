import axiosClient from './axiosClient';

export const financeApi = {
  // Expenses: { title, description, category, amount, expenseDate, splits: [{ userId, shareAmount }] }
  createExpense: (tripId, data) =>
    axiosClient.post(`/api/trips/${tripId}/expenses`, data),

  // Balances
  getBalances: (tripId) =>
    axiosClient.get(`/api/trips/${tripId}/balances`),

  // Settlements: { payeeId, amount, note }
  createSettlement: (tripId, data) =>
    axiosClient.post(`/api/trips/${tripId}/settlements/settlements`, data),
};