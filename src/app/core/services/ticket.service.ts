import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { PagedResultDto } from '../models/common.models';
import {
  AssignTicketRequestDto,
  CreateTicketCommentDto,
  CreateTicketRequestDto,
  TicketCommentDto,
  TicketDetailsDto,
  TicketQueryParametersDto,
  TicketResponseDto
} from '../models/ticket.models';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);

  createTicket(dto: CreateTicketRequestDto): Observable<TicketResponseDto> {
    return this.http.post<TicketResponseDto>(API_ENDPOINTS.tickets.base, dto);
  }

  getTicketById(id: number): Observable<TicketDetailsDto> {
    return this.http.get<TicketDetailsDto>(API_ENDPOINTS.tickets.byId(id));
  }

  getMyTickets(): Observable<TicketResponseDto[]> {
    return this.http.get<TicketResponseDto[]>(API_ENDPOINTS.tickets.my);
  }

  getAllTickets(params?: TicketQueryParametersDto): Observable<PagedResultDto<TicketResponseDto>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.pageNumber !== undefined && params.pageNumber !== null) {
        httpParams = httpParams.set('PageNumber', params.pageNumber.toString());
      }
      if (params.pageSize !== undefined && params.pageSize !== null) {
        httpParams = httpParams.set('PageSize', params.pageSize.toString());
      }
      if (params.search && params.search.trim()) {
        httpParams = httpParams.set('Search', params.search.trim());
      }
      if (params.status && params.status.trim()) {
        httpParams = httpParams.set('Status', params.status.trim());
      }
      if (params.priority && params.priority.trim()) {
        httpParams = httpParams.set('Priority', params.priority.trim());
      }
      if (params.categoryId !== undefined && params.categoryId !== null) {
        httpParams = httpParams.set('CategoryId', params.categoryId.toString());
      }
      if (params.sortBy && params.sortBy.trim()) {
        httpParams = httpParams.set('SortBy', params.sortBy.trim());
      }
      if (params.sortDirection && params.sortDirection.trim()) {
        httpParams = httpParams.set('SortDirection', params.sortDirection.trim());
      }
    }
    return this.http.get<PagedResultDto<TicketResponseDto>>(API_ENDPOINTS.tickets.base, { params: httpParams });
  }

  assignTicket(id: number, agentId: number): Observable<TicketResponseDto> {
    const payload: AssignTicketRequestDto = { agentId };
    return this.http.put<TicketResponseDto>(API_ENDPOINTS.tickets.assign(id), payload);
  }

  unassignTicket(id: number): Observable<TicketResponseDto> {
    return this.http.put<TicketResponseDto>(API_ENDPOINTS.tickets.unassign(id), {});
  }

  startTicket(id: number): Observable<TicketResponseDto> {
    return this.http.put<TicketResponseDto>(API_ENDPOINTS.tickets.start(id), {});
  }

  resolveTicket(id: number): Observable<TicketResponseDto> {
    return this.http.put<TicketResponseDto>(API_ENDPOINTS.tickets.resolve(id), {});
  }

  closeTicket(id: number): Observable<TicketResponseDto> {
    return this.http.put<TicketResponseDto>(API_ENDPOINTS.tickets.close(id), {});
  }

  getComments(ticketId: number): Observable<TicketCommentDto[]> {
    return this.http.get<TicketCommentDto[]>(API_ENDPOINTS.tickets.comments(ticketId));
  }

  addComment(ticketId: number, dto: CreateTicketCommentDto): Observable<TicketCommentDto> {
    return this.http.post<TicketCommentDto>(API_ENDPOINTS.tickets.comments(ticketId), dto);
  }
}

