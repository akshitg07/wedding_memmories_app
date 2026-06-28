import axios from 'axios';
export const api=axios.create({baseURL:process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',withCredentials:true});
api.interceptors.request.use(config=>{ if(typeof window!=='undefined'){ const token=localStorage.getItem('accessToken'); if(token) config.headers.Authorization=`Bearer ${token}`; } return config; });
export type MediaItem={id:string;originalName:string;mimeType:string;type:'IMAGE'|'VIDEO';size:string;createdAt:string;downloads:number;uploader:{displayName:string;avatarUrl?:string};_count:{likes:number;comments:number}};
