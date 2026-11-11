import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { PagedResultDto } from '../models/common.models';
import {
  CreateAgentRequestDto,
  UpdateUserRequestDto,
  UpdateUserStatusDto,
  UserListItemDto,
  UserQueryParametersDto
} from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  getUsers(params?: UserQueryParametersDto): Observable<PagedResultDto<UserListItemDto>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.pageNumber !== undefined) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize !== undefined) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.role) httpParams = httpParams.set('role', params.role);
      if (params.isActive !== undefined && params.isActive !== null) {
        httpParams = httpParams.set('isActive', params.isActive.toString());
      }
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }
    return this.http.get<PagedResultDto<UserListItemDto>>(API_ENDPOINTS.users.base, { params: httpParams });
  }

  createAgent(dto: CreateAgentRequestDto): Observable<UserListItemDto> {
    return this.http.post<UserListItemDto>(API_ENDPOINTS.users.agents, dto);
  }

  updateUserStatus(id: number, isActive: boolean): Observable<void> {
    const payload: UpdateUserStatusDto = { isActive };
    return this.http.patch<void>(API_ENDPOINTS.users.status(id), payload);
  }

  updateUser(id: number, dto: UpdateUserRequestDto): Observable<void> {
    return this.http.put<void>(API_ENDPOINTS.users.update(id), dto);
  }
}

