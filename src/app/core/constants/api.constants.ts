export const API_BASE_URL = 'http://helpdesk-api.runasp.net/';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/Auth/login`,
    register: `${API_BASE_URL}/api/Auth/register`,
    me: `${API_BASE_URL}/api/Auth/me`,
    adminTest: `${API_BASE_URL}/api/Auth/admin-test`,
    refresh: `${API_BASE_URL}/api/Auth/refresh`,
    revoke: `${API_BASE_URL}/api/Auth/revoke`
  },
  tickets: {
    base: `${API_BASE_URL}/api/Tickets`,
    my: `${API_BASE_URL}/api/Tickets/my`,
    byId: (id: number) => `${API_BASE_URL}/api/Tickets/${id}`,
    assign: (id: number) => `${API_BASE_URL}/api/Tickets/${id}/assign`,
    unassign: (id: number) => `${API_BASE_URL}/api/Tickets/${id}/unassign`,
    start: (id: number) => `${API_BASE_URL}/api/Tickets/${id}/start`,
    resolve: (id: number) => `${API_BASE_URL}/api/Tickets/${id}/resolve`,
    close: (id: number) => `${API_BASE_URL}/api/Tickets/${id}/close`,
    comments: (ticketId: number) => `${API_BASE_URL}/api/Tickets/${ticketId}/comments`
  },
  users: {
    base: `${API_BASE_URL}/api/Users`,
    agents: `${API_BASE_URL}/api/Users/agents`,
    status: (id: number) => `${API_BASE_URL}/api/Users/${id}/status`,
    update: (id: number) => `${API_BASE_URL}/api/Users/${id}`
  },
  categories: {
    base: `${API_BASE_URL}/api/Categories`,
    byId: (id: number) => `${API_BASE_URL}/api/Categories/${id}`
  }
};

