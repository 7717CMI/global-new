interface ShovelMarketData {
  recordId: number
  year: number
  region: string
  country: string
  insuranceType: string
  planType: string
  coverageType: string
  coverageOption: string
  enterpriseSize: string
  productType: string
  payorType: string
  distributionChannel: string
  brand: string
  company: string
  price: number
  volumeUnits: number
  enrollmentCount: number
  revenue: number
  marketValueUsd: number
  value: number
  marketSharePct: number
  cagr: number
  yoyGrowth: number
}

const generateComprehensiveData = (): ShovelMarketData[] => {
  const years = Array.from({ length: 3 }, (_, i) => 2023 + i)
  const regions = ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East & Africa"]
  
  const insuranceTypes = ["Self-Funded (Employer-Sponsored)", "Fully-Insured Plans"]
  const planTypes = ["Health Maintenance Organization (HMO)", "Preferred Provider Organization (PPO)", "Exclusive Provider Organization (EPO)", "Point of Service (POS)", "High-Deductible Health Plans (HDHPs)"]
  const coverageTypes = ["Inpatient Coverage", "Outpatient Coverage", "Dental & Vision Coverage", "Maternity & Newborn Care Coverage", "Prescription Drug Coverage", "Other (e.g. Mental Health & Wellness Coverage)"]
  const coverageOptions = ["Individual Coverage (Employee-Only)", "Family Coverage (Employee + Dependents such as Spouse Children Parents)"]
  const enterpriseSizes = ["Small and Medium Enterprises", "Large Enterprises"]
  const productTypes = ["Contributory Plans (Employer + Employee Premium Share)", "Non-Contributory Plans (Employer-Paid)"]
  const payorTypes = ["Private Insurers", "Public Insurers"]
  const distributionChannels = ["Direct Sales (Insurer to Employer)", "Agents and Brokers", "Bancassurance", "Online Platforms and Digital Channels"]
  
  const brands = ["Aetna", "UnitedHealth", "Cigna", "Anthem", "Humana", "WellCare", "Centene"]
  
  const companies = ["Aetna Inc", "UnitedHealth Group", "Cigna Corporation", "Anthem Inc", "Humana Inc", "WellCare Group", "Centene Corporation"]
  
  const countryMap: Record<string, string[]> = {
    "North America": ["U.S.", "Canada"],
    "Europe": ["U.K.", "Germany", "Italy", "France", "Spain", "Russia", "Rest of Europe"],
    "Asia Pacific": ["China", "India", "Japan", "South Korea", "ASEAN", "Australia", "Rest of Asia Pacific"],
    "Latin America": ["Brazil", "Argentina", "Mexico", "Rest of Latin America"],
    "Middle East & Africa": ["GCC", "South Africa", "Rest of Middle East & Africa"]
  }
  
  // Insurance type multipliers
  const insuranceTypeMultipliers: Record<string, { price: number; volume: number; cagr: number }> = {
    'Self-Funded (Employer-Sponsored)': { price: 1.0, volume: 1.1, cagr: 1.1 },
    'Fully-Insured Plans': { price: 1.1, volume: 0.9, cagr: 0.95 }
  }
  
  // Plan type multipliers
  const planTypeMultipliers: Record<string, { price: number; volume: number }> = {
    'Health Maintenance Organization (HMO)': { price: 0.85, volume: 1.2 },
    'Preferred Provider Organization (PPO)': { price: 1.1, volume: 1.0 },
    'Exclusive Provider Organization (EPO)': { price: 0.95, volume: 1.05 },
    'Point of Service (POS)': { price: 1.0, volume: 0.9 },
    'High-Deductible Health Plans (HDHPs)': { price: 0.8, volume: 1.3 }
  }
  
  // Enterprise size multipliers
  const enterpriseSizeMultipliers: Record<string, { volume: number; price: number }> = {
    'Small and Medium Enterprises': { volume: 1.3, price: 1.0 },
    'Large Enterprises': { volume: 1.5, price: 0.95 }
  }
  
  // Region-specific multipliers
  const regionMultipliers: Record<string, { volume: number; marketShare: number }> = {
    'North America': { volume: 1.6, marketShare: 1.5 },
    'Europe': { volume: 1.4, marketShare: 1.3 },
    'Asia Pacific': { volume: 1.9, marketShare: 1.6 },
    'Latin America': { volume: 1.1, marketShare: 0.9 },
    'Middle East & Africa': { volume: 1.0, marketShare: 1.0 }
  }
  
  // Brand-specific multipliers
  const brandPremiumMap: Record<string, number> = {}
  brands.forEach((brand, idx) => {
    brandPremiumMap[brand] = 0.9 + (idx % 3) * 0.35
  })

  const data: ShovelMarketData[] = []
  let recordId = 100000
  
  let seed = 42
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  
  for (const year of years) {
    for (const region of regions) {
      const regionMult = regionMultipliers[region]
      const countries = countryMap[region] || []
      const countriesToProcess = countries.length > 0 ? countries : [region]
      
      for (const country of countriesToProcess) {
        for (const insuranceType of insuranceTypes) {
          const insuranceMult = insuranceTypeMultipliers[insuranceType]
          
          for (const planType of planTypes) {
            const planMult = planTypeMultipliers[planType]
            
            for (const coverageType of coverageTypes) {
              for (const coverageOption of coverageOptions) {
                for (const enterpriseSize of enterpriseSizes) {
                  const sizeMult = enterpriseSizeMultipliers[enterpriseSize]
                  
                  for (const productType of productTypes) {
                    for (const payorType of payorTypes) {
                      const payorMult = payorType === 'Private Insurers' ? 1.2 : 0.95
                      
                      const distributionChannel = distributionChannels[Math.floor(seededRandom() * distributionChannels.length)]
                      const brand = brands[Math.floor(seededRandom() * brands.length)]
                      const brandMult = brandPremiumMap[brand] || 1.0
                      const company = companies[Math.floor(seededRandom() * companies.length)]
                      
                      // Calculate metrics
                      const basePrice = 50 + seededRandom() * 450 // $50-$500
                      const price = basePrice * insuranceMult.price * planMult.price * payorMult * (1 + (year - 2023) * 0.03)
                      
                      const baseVolume = 5000 + seededRandom() * 45000 // 5k-50k
                      const enrollmentCount = Math.floor(
                        baseVolume * 
                        regionMult.volume * 
                        insuranceMult.volume * 
                        planMult.volume * 
                        sizeMult.volume * 
                        (1 + (year - 2023) * 0.06)
                      )
                      
                      const volumeUnits = Math.floor(enrollmentCount * 0.8)
                      const revenue = price * enrollmentCount
                      const marketValueUsd = revenue * (0.85 + seededRandom() * 0.3)
                      
                      const baseMarketShare = 0.5 + seededRandom() * 4.5
                      const marketSharePct = baseMarketShare * regionMult.marketShare * brandMult
                      
                      const baseCAGR = 3 + seededRandom() * 8
                      const cagr = baseCAGR * insuranceMult.cagr
                      const yoyGrowth = 2 + seededRandom() * 10
                      
                      data.push({
                        recordId,
                        year,
                        region,
                        country,
                        insuranceType,
                        planType,
                        coverageType,
                        coverageOption,
                        enterpriseSize,
                        productType,
                        payorType,
                        distributionChannel,
                        brand,
                        company,
                        price: Math.round(price * 100) / 100,
                        volumeUnits,
                        enrollmentCount,
                        revenue: Math.round(revenue * 100) / 100,
                        marketValueUsd: Math.round(marketValueUsd * 100) / 100,
                        value: Math.round(marketValueUsd * 100) / 100,
                        marketSharePct: Math.round(marketSharePct * 100) / 100,
                        cagr: Math.round(cagr * 100) / 100,
                        yoyGrowth: Math.round(yoyGrowth * 100) / 100,
                      })
                      
                      recordId++
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  return data
}

let dataCache: ShovelMarketData[] | null = null

export const getData = (): ShovelMarketData[] => {
  if (!dataCache) {
    try {
      dataCache = generateComprehensiveData()
    } catch (error) {
      dataCache = []
    }
  }
  return dataCache
}

// Function to clear cache and regenerate data (for development/testing)
export const clearDataCache = () => {
  dataCache = null
}

export interface FilterOptions {
  year?: number[]
  productType?: string[]
  bladeMaterial?: string[]
  handleLength?: string[]
  application?: string[]
  endUser?: string[]
  distributionChannelType?: string[]
  distributionChannel?: string[]
  region?: string[]
  country?: string[]
  brand?: string[]
  company?: string[]
  [key: string]: any
}

export const filterDataframe = (data: ShovelMarketData[], filters: FilterOptions): ShovelMarketData[] => {
  let filtered = [...data]
  
  for (const [field, values] of Object.entries(filters)) {
    if (values && Array.isArray(values) && values.length > 0) {
      filtered = filtered.filter(item => {
        const itemValue = item[field as keyof ShovelMarketData]
        // Handle number to string conversion for year field
        if (field === 'year' && typeof itemValue === 'number') {
          return values.map(v => String(v)).includes(String(itemValue))
        }
        return values.includes(itemValue as any)
      })
    }
  }
  
  return filtered
}

export const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    const formatted = (num / 1_000_000_000).toFixed(1)
    return `${parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B`
  } else if (num >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(1)
    return `${parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`
  } else if (num >= 1_000) {
    const formatted = (num / 1_000).toFixed(1)
    return `${parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}K`
  }
  return Math.round(num).toLocaleString('en-US')
}

export const formatWithCommas = (num: number, decimals = 1): string => {
  const value = parseFloat(num.toFixed(decimals))
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export const addCommas = (num: number | null | undefined): string | number | null | undefined => {
  if (num === null || num === undefined || isNaN(num)) {
    return num
  }
  return Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export type { ShovelMarketData }
