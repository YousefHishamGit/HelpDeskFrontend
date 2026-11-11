export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterRequestDto {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

export interface RegisterResponseDto {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface CurrentUserDto {
  userId: string;
  email: string;
  role: 'Admin' | 'Agent' | 'Employee' | string;
}

