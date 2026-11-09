const browserUrl=process.env.NEXT_PUBLIC_API_URL??'http://localhost:3001/api/v1';
const baseUrl=typeof window==='undefined'?(process.env.API_INTERNAL_URL??browserUrl):browserUrl;
export async function apiGet<T>(path:string,options?:RequestInit):Promise<T>{
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),8000);
  try{const response=await fetch(`${baseUrl}${path}`,{...options,signal:controller.signal,headers:{Accept:'application/json',...options?.headers}});if(!response.ok)throw new Error(response.status===404?'Recurso não encontrado':'API indisponível');return await response.json() as T;}
  finally{clearTimeout(timeout);}
}
