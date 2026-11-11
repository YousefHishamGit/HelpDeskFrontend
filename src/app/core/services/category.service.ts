import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { CategoryResponseDto } from '../models/category.models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);

  getCategories(): Observable<CategoryResponseDto[]> {
    return this.http.get<CategoryResponseDto[]>(API_ENDPOINTS.categories.base);
  }

  getCategoryById(id: number): Observable<CategoryResponseDto> {
    return this.http.get<CategoryResponseDto>(API_ENDPOINTS.categories.byId(id));
  }
}

