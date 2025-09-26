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

export interface ReviewDTO {
  id: string;
  businessId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  likes?: number;
  isLiked?: boolean;
}

export interface PagedResult<T> { items: T[]; nextPage?: number; }

export async function fetchBusinesses(): Promise<BusinessDTO[]> {
  return httpClient.get<BusinessDTO[]>('/businesses');
}

export async function fetchBusiness(id: string): Promise<BusinessDTO> {
  return httpClient.get<BusinessDTO>(`/businesses/${id}`);
}

export async function fetchBusinessReviews(businessId: string, page = 1): Promise<PagedResult<ReviewDTO>> {
  return httpClient.get<PagedResult<ReviewDTO>>(`/businesses/${businessId}/reviews?page=${page}&limit=10`);
}

export interface CreateReviewPayload {
  tags?: string[];
  images?: { uri: string; name?: string; type?: string }[];
}

export async function createReview(businessId: string, rating: number, comment: string, extras?: CreateReviewPayload): Promise<ReviewDTO> {
  if (extras?.images?.length || extras?.tags?.length) {
    const form = new FormData();
    form.append('rating', String(rating));
    form.append('comment', comment);
    if (extras.tags) form.append('tags', JSON.stringify(extras.tags));
    extras.images?.forEach((img, i) => {
      form.append(`image_${i}` as any, { uri: img.uri, name: img.name || `photo_${i}.jpg`, type: img.type || 'image/jpeg' } as any);
    });
    return httpClient.post<ReviewDTO>(`/businesses/${businessId}/reviews`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return httpClient.post<ReviewDTO>(`/businesses/${businessId}/reviews`, { rating, comment });
}

export async function toggleFavoriteBusiness(businessId: string): Promise<{ favorited: boolean }> {
  return httpClient.post<{ favorited: boolean }>(`/businesses/${businessId}/favorite`);
}

export async function likeReview(reviewId: string): Promise<{ liked: boolean; likes: number }> {
  return httpClient.post<{ liked: boolean; likes: number }>(`/reviews/${reviewId}/like`);
}
