//todo implent company cache that works with middleware so not each call requests if the crganization exists

// type CompanyData = {
//     // Define your company fields here
//     id: string;
//     name: string;
//     // ...other fields
//   };
  
//   type CacheEntry = {
//     data: CompanyData | null;
//     expires: number;
//   };
  
//   const companyCache: Record<string, CacheEntry> = {};
  
//   const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  
//   // Replace this with your actual DB/service call
//   async function fetchCompanyFromDB(subdomain: string): Promise<CompanyData | null> {
//     // Example: return await prisma.company.findUnique({ where: { subdomain } });
//     return null;
//   }
  
//   export async function getCompanyBySubdomain(subdomain: string): Promise<CompanyData | null> {
//     const now = Date.now();
//     const cached = companyCache[subdomain];
  
//     if (cached && cached.expires > now) {
//       return cached.data;
//     }
  
//     const data = await fetchCompanyFromDB(subdomain);
//     companyCache[subdomain] = {
//       data,
//       expires: now + CACHE_TTL_MS,
//     };
//     return data;
//   }