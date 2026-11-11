export interface UserListItemDto {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAgentRequestDto {
  fullName: string;
  email: string;
  phone?: string | null;
}

export interface UpdateUserRequestDto {
  fullName: string;
  phone: string;
}

export interface UpdateUserStatusDto {
  isActive: boolean;
}

export interface UserQueryParametersDto {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc' | string;
}

