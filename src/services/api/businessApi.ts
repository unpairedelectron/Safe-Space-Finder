import { httpClient } from './httpClient';

export interface BusinessDTO {
  id: string;
  name: string;
  category: string;
  rating: number;
  address?: string;
  description?: string;
  imageUrl?: string;
}

export async function fetchBusinesses(): Promise<BusinessDTO[]> {
  return httpClient.get<BusinessDTO[]>('/businesses');
}

export async function fetchBusiness(id: string): Promise<BusinessDTO> {
  return httpClient.get<BusinessDTO>(`/businesses/${id}`);
}
