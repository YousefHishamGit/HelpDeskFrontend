import { TicketPriority, TicketStatus } from '../constants/enums';

export interface TicketResponseDto {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdById: number;
  createdAt: string;
}

export interface TicketDetailsDto {
  id: number;
  title: string;
  description: string;
  categoryName: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdById: number;
  createdByName: string;
  assignedToId?: number | null;
  assignedToName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  dueAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
}

export interface TicketCommentDto {
  id: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
}

export interface CreateTicketRequestDto {
  title: string;
  description: string;
  categoryId: number;
  priority: TicketPriority;
}

export interface CreateTicketCommentDto {
  content: string;
}

export interface AssignTicketRequestDto {
  agentId: number;
}

export interface TicketQueryParametersDto {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  priority?: string;
  categoryId?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc' | string;
}

