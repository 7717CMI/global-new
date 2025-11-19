import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { getData, formatWithCommas, clearDataCache, type ShovelMarketData } from '../utils/dataGenerator'
import { StatBox } from '../components/StatBox'
import { FilterDropdown } from '../components/FilterDropdown'
import { SegmentGroupedBarChart } from '../components/SegmentGroupedBarChart'
import { RegionCountryStackedBarChart } from '../components/RegionCountryStackedBarChart'
import { CrossSegmentStackedBarChart } from '../components/CrossSegmentStackedBarChart'
import { DemoNotice } from '../components/DemoNotice'
import { useTheme } from '../context/ThemeContext'
import { InfoTooltip } from '../components/InfoTooltip'
import { WaterfallChart } from '../components/WaterfallChart'
import { BubbleChart } from '../components/BubbleChart'
import { YoYCAGRChart } from '../components/YoYCAGRChart'

interface MarketAnalysisProps {
  onNavigate: (page: string) => void
}

type MarketEvaluationType = 'By Value' | 'By Volume'

export function MarketAnalysis({ onNavigate }: MarketAnalysisProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const [activeTab, setActiveTab] = useState<'standard' | 'incremental' | 'attractiveness' | 'yoy'>('standard')
  const [data, setData] = useState<ShovelMarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    year: [] as number[],
    region: [] as string[],
    country: [] as string[],
    insuranceType: [] as string[],
    planType: [] as string[],
    coverageType: [] as string[],
    coverageOption: [] as string[],
    enterpriseSize: [] as string[],
    productType: [] as string[],
    payorType: [] as string[],
    distributionChannel: [] as string[],
    marketEvaluation: 'By Value' as MarketEvaluationType,
  })
  
  // Region-Country mapping for hierarchical filtering
  const regionCountryMap: Record<string, string[]> = {
    "North America": ["U.S.", "Canada"],
    "Europe": ["U.K.", "Germany", "Italy", "France", "Spain", "Russia", "Rest of Europe"],
    "Asia Pacific": ["China", "India", "Japan", "South Korea", "ASEAN", "Australia", "Rest of Asia Pacific"],
    "Latin America": ["Brazil", "Argentina", "Mexico", "Rest of Latin America"],
    "Middle East & Africa": ["GCC", "South Africa", "Rest of Middle East & Africa"]
  }
  
  // Get available countries based on selected regions
  const availableCountries = useMemo(() => {
    if (filters.region.length === 0) {
      // If no region selected, show all countries
      return Object.values(regionCountryMap).flat()
    }
    // Show only countries from selected regions
    return filters.region.flatMap(region => regionCountryMap[region] || [])
  }, [filters.region])
  
  // Separate filters for incremental tab
  const [incrementalFilters, setIncrementalFilters] = useState({
    region: [] as string[],
    insuranceType: [] as string[],
    country: [] as string[],
  })
  
  // Separate filters for attractiveness tab
  const [attractivenessFilters, setAttractivenessFilters] = useState({
    region: [] as string[],
    insuranceType: [] as string[],
  })
  
  // Separate filters for YoY/CAGR tab
  const [yoyFilters, setYoyFilters] = useState({
    region: [] as string[],
    insuranceType: [] as string[],
    country: [] as string[],
  })

  useEffect(() => {
    // Clear cache to ensure fresh data with online channels
    clearDataCache()
    setLoading(true)
    setTimeout(() => {
      try {
        const generatedData = getData()
        setData(generatedData)
        setLoading(false)
        
        setTimeout(() => {
          const availableYears = [...new Set(generatedData.map(d => d.year))].sort()
          const availableRegions = [...new Set(generatedData.map(d => d.region))].sort()
          const availableInsuranceTypes = [...new Set(generatedData.map(d => d.insuranceType))].sort()
          const availablePlanTypes = [...new Set(generatedData.map(d => d.planType))].sort()
          const availableCoverageTypes = [...new Set(generatedData.map(d => d.coverageType))].sort()
          const availableCoverageOptions = [...new Set(generatedData.map(d => d.coverageOption))].sort()
          const availableEnterpriseSizes = [...new Set(generatedData.map(d => d.enterpriseSize))].sort()
          const availableProductTypes = [...new Set(generatedData.map(d => d.productType))].sort()
          const availablePayorTypes = [...new Set(generatedData.map(d => d.payorType))].sort()
          
          // Default to latest years
          const defaultYears = availableYears.length > 0 ? [availableYears[availableYears.length - 1]] : []
          
          // Default to all regions
          const defaultRegions = availableRegions
          
          // Select all available options by default
          const defaultInsuranceTypes = availableInsuranceTypes
          const defaultPlanTypes = availablePlanTypes
          const defaultCoverageTypes = availableCoverageTypes
          const defaultCoverageOptions = availableCoverageOptions
          const defaultEnterpriseSizes = availableEnterpriseSizes
          const defaultProductTypes = availableProductTypes
          const defaultPayorTypes = availablePayorTypes
          
          setFilters({
            year: defaultYears,
            region: defaultRegions,
            country: [],
            insuranceType: defaultInsuranceTypes,
            planType: defaultPlanTypes,
            coverageType: defaultCoverageTypes,
            coverageOption: defaultCoverageOptions,
            enterpriseSize: defaultEnterpriseSizes,
            productType: defaultProductTypes,
            payorType: defaultPayorTypes,
            distributionChannel: [],
            marketEvaluation: 'By Value',
          })
        }, 0)
      } catch (error) {
        console.error('Error loading data:', error)
        setData([])
        setLoading(false)
      }
    }, 500)
  }, [])

  // Get unique filter options - optimized
  const uniqueOptions = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        years: [],
        regions: [],
        insuranceTypes: [],
        planTypes: [],
        coverageTypes: [],
        coverageOptions: [],
        enterpriseSizes: [],
        productTypes: [],
        payorTypes: [],
      }
    }

    const yearSet = new Set<number>()
    const regionSet = new Set<string>()
    const insuranceTypeSet = new Set<string>()
    const planTypeSet = new Set<string>()
    const coverageTypeSet = new Set<string>()
    const coverageOptionSet = new Set<string>()
    const enterpriseSizeSet = new Set<string>()
    const productTypeSet = new Set<string>()
    const payorTypeSet = new Set<string>()

    for (let i = 0; i < data.length; i++) {
      const d = data[i]
      if (d.year) yearSet.add(d.year)
      if (d.region) regionSet.add(d.region)
      if (d.insuranceType) insuranceTypeSet.add(d.insuranceType)
      if (d.planType) planTypeSet.add(d.planType)
      if (d.coverageType) coverageTypeSet.add(d.coverageType)
      if (d.coverageOption) coverageOptionSet.add(d.coverageOption)
      if (d.enterpriseSize) enterpriseSizeSet.add(d.enterpriseSize)
      if (d.productType) productTypeSet.add(d.productType)
      if (d.payorType) payorTypeSet.add(d.payorType)
    }

    return {
      years: Array.from(yearSet).sort((a, b) => a - b),
      regions: Array.from(regionSet).filter(Boolean).sort(),
      insuranceTypes: Array.from(insuranceTypeSet).filter(Boolean).sort(),
      planTypes: Array.from(planTypeSet).filter(Boolean).sort(),
      coverageTypes: Array.from(coverageTypeSet).filter(Boolean).sort(),
      coverageOptions: Array.from(coverageOptionSet).filter(Boolean).sort(),
      enterpriseSizes: Array.from(enterpriseSizeSet).filter(Boolean).sort(),
      productTypes: Array.from(productTypeSet).filter(Boolean).sort(),
      payorTypes: Array.from(payorTypeSet).filter(Boolean).sort(),
    }
  }, [data])

  // Get all distribution channels from full data
  const availableDistributionChannels = useMemo(() => {
    if (!data || data.length === 0) return []
    
    const channelSet = new Set<string>()
    data.forEach(d => {
      if (d.distributionChannel) channelSet.add(d.distributionChannel)
    })
    
    return Array.from(channelSet).sort()
  }, [data])

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = [...data]

    if (filters.year.length > 0) {
      filtered = filtered.filter(d => filters.year.includes(d.year))
    }
    if (filters.region.length > 0) {
      filtered = filtered.filter(d => filters.region.includes(d.region))
    }
    if (filters.country.length > 0) {
      filtered = filtered.filter(d => filters.country.includes(d.country))
    }
    if (filters.insuranceType.length > 0) {
      filtered = filtered.filter(d => filters.insuranceType.includes(d.insuranceType))
    }
    if (filters.planType.length > 0) {
      filtered = filtered.filter(d => filters.planType.includes(d.planType))
    }
    if (filters.coverageType.length > 0) {
      filtered = filtered.filter(d => filters.coverageType.includes(d.coverageType))
    }
    if (filters.coverageOption.length > 0) {
      filtered = filtered.filter(d => filters.coverageOption.includes(d.coverageOption))
    }
    if (filters.enterpriseSize.length > 0) {
      filtered = filtered.filter(d => filters.enterpriseSize.includes(d.enterpriseSize))
    }
    if (filters.productType.length > 0) {
      filtered = filtered.filter(d => filters.productType.includes(d.productType))
    }
    if (filters.payorType.length > 0) {
      filtered = filtered.filter(d => filters.payorType.includes(d.payorType))
    }
    if (filters.distributionChannel.length > 0) {
      filtered = filtered.filter(d => filters.distributionChannel.includes(d.distributionChannel))
    }

    return filtered
  }, [data, filters])

  // Get data value based on market evaluation type
  const getDataValue = (d: any): number => {
    if (filters.marketEvaluation === 'By Volume') {
      return d.volumeUnits || 0
    }
    return (d.marketValueUsd || 0) / 1000 // Convert to millions
  }

  const getDataLabel = (): string => {
    return filters.marketEvaluation === 'By Volume' ? 'Market Volume (Units)' : 'Market Size (US$ Million)'
  }

  // Analysis data for charts - Market segment based
  const analysisData = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        productTypeChartData: [],
        insuranceTypeChartData: [],
        planTypeChartData: [],
        coverageTypeChartData: [],
        regionChartData: [],
        regionCountryPercentageChartData: [],
        productTypes: [] as string[],
        insuranceTypes: [] as string[],
        planTypes: [] as string[],
        coverageTypes: [] as string[],
        regions: [] as string[],
        insuranceTypeStackedData: { chartData: [], segments: [] },
        planTypeStackedData: { chartData: [], segments: [] },
        coverageTypeStackedData: { chartData: [], segments: [] },
        distributionChannelStackedData: { chartData: [], segments: [] },
      }
    }

    const years = [...new Set(filteredData.map(d => d.year))].sort()

    // Helper function to generate segment chart data
    const generateSegmentChartData = (
      segmentKey: string,
      getSegmentValue: (d: any) => string,
      selectedSegments?: string[]
    ) => {
      // Use selected segments from filter if provided, otherwise use segments from filtered data
      const segmentsFromData = [...new Set(filteredData.map(getSegmentValue))].filter(Boolean).sort()
      const segments = selectedSegments && selectedSegments.length > 0 
        ? selectedSegments.filter(s => s).sort() 
        : segmentsFromData
      
      const segmentMap = new Map<string, number>()
      
      filteredData.forEach(d => {
        const key = `${d.year}-${getSegmentValue(d)}`
        segmentMap.set(key, (segmentMap.get(key) || 0) + getDataValue(d))
      })

      const chartData = years.map((year) => {
        const entry: Record<string, number | string> = { year: String(year) }
        segments.forEach((segment) => {
          const key = `${year}-${segment}`
          entry[segment] = segmentMap.get(key) || 0
        })
        return entry
      })

      return { chartData, segments }
    }

    // Helper function to generate year-wise stacked bar chart data
    const generateYearWiseStackedBarData = (
      getSegmentValue: (d: any) => string,
      selectedSegments?: string[]
    ) => {
      const segmentsFromData = [...new Set(filteredData.map(getSegmentValue))].filter(Boolean).sort()
      const segments = selectedSegments && selectedSegments.length > 0 
        ? selectedSegments.filter(s => s).sort() 
        : segmentsFromData
      
      // Group by year, then by segment
      const yearSegmentMap = new Map<number, Map<string, number>>()
      
      filteredData.forEach(d => {
        const year = d.year
        const segment = getSegmentValue(d)
        if (segment) {
          if (!yearSegmentMap.has(year)) {
            yearSegmentMap.set(year, new Map<string, number>())
          }
          const segmentMap = yearSegmentMap.get(year)!
          segmentMap.set(segment, (segmentMap.get(segment) || 0) + getDataValue(d))
        }
      })

      // Convert to array format for stacked bar chart
      const chartData = years.map(year => {
        const entry: Record<string, number | string> = { year: String(year) }
        const segmentMap = yearSegmentMap.get(year) || new Map<string, number>()
        segments.forEach(segment => {
          entry[segment] = segmentMap.get(segment) || 0
        })
        return entry
      })

      // Filter segments that have at least one non-zero value
      const activeSegments = segments.filter(segment => 
        chartData.some(entry => (entry[segment] as number) > 0)
      )

      return { chartData, segments: activeSegments }
    }

    // Product Type Chart - use selected filters to show all selected options
    const productTypeData = generateSegmentChartData(
      'productType', 
      (d) => d.productType || '',
      filters.productType.length > 0 ? filters.productType : undefined
    )

    // Insurance Type Chart - use selected filters to show all selected options
    const insuranceTypeData = generateSegmentChartData(
      'insuranceType', 
      (d) => d.insuranceType || '',
      filters.insuranceType.length > 0 ? filters.insuranceType : undefined
    )

    // Plan Type Chart - use selected filters to show all selected options
    const planTypeData = generateSegmentChartData(
      'planType', 
      (d) => d.planType || '',
      filters.planType.length > 0 ? filters.planType : undefined
    )

    // Coverage Type Chart - use selected filters to show all selected options
    const coverageTypeData = generateSegmentChartData(
      'coverageType', 
      (d) => d.coverageType || '',
      filters.coverageType.length > 0 ? filters.coverageType : undefined
    )

    // Region Chart - use selected filters to show all selected options
    const regionsFromData = [...new Set(filteredData.map(d => d.region))].filter(Boolean).sort()
    const regions = filters.region.length > 0 
      ? filters.region.filter(r => r).sort() 
      : regionsFromData
    const regionMap = new Map<string, number>()
    filteredData.forEach(d => {
      const key = `${d.year}-${d.region}`
      regionMap.set(key, (regionMap.get(key) || 0) + getDataValue(d))
    })
    const regionChartData = years.map((year) => {
      const entry: Record<string, number | string> = { year: String(year) }
      regions.forEach((region) => {
        const key = `${year}-${region}`
        entry[region] = regionMap.get(key) || 0
      })
      return entry
    })


    // Region Country Percentage - Grouped by Year
    const regionYearData: Record<string, Record<string, Record<string, number>>> = {}
    const regionYearTotals: Record<string, Record<string, number>> = {}
    
    filteredData.forEach((d) => {
      const value = getDataValue(d)
      const year = d.year
      const region = d.region
      const country = d.country
      const yearKey = String(year)
      
      if (!regionYearData[yearKey]) {
        regionYearData[yearKey] = {}
        regionYearTotals[yearKey] = {}
      }
      if (!regionYearData[yearKey][region]) {
        regionYearData[yearKey][region] = {}
        regionYearTotals[yearKey][region] = 0
      }
      if (!regionYearData[yearKey][region][country]) {
        regionYearData[yearKey][region][country] = 0
      }
      
      regionYearData[yearKey][region][country] += value
      regionYearTotals[yearKey][region] += value
    })
    
    const regionCountryPercentageChartData = Object.entries(regionYearData).flatMap(([year, regionData]) => {
      return Object.entries(regionData).flatMap(([region, countriesData]) => {
        const totalValue = regionYearTotals[year][region]
        const countryList = Object.keys(countriesData).sort()
        
        return countryList.map((country) => {
          const value = countriesData[country] || 0
          const percentage = totalValue > 0 ? ((value / totalValue) * 100) : 0
          
          return {
            year: Number(year),
            region,
            country,
            value: filters.marketEvaluation === 'By Volume' ? value : percentage,
            yearRegion: `${year} - ${region}`
          }
        })
      })
    })

    // Generate year-wise stacked bar chart data for share analysis
    const insuranceTypeStackedData = generateYearWiseStackedBarData(
      (d) => d.insuranceType || '',
      filters.insuranceType.length > 0 ? filters.insuranceType : undefined
    )
    const planTypeStackedData = generateYearWiseStackedBarData(
      (d) => d.planType || '',
      filters.planType.length > 0 ? filters.planType : undefined
    )
    const coverageTypeStackedData = generateYearWiseStackedBarData(
      (d) => d.coverageType || '',
      filters.coverageType.length > 0 ? filters.coverageType : undefined
    )

    // Generate distribution channel stacked bar chart data
    const distributionChannelStackedData = generateYearWiseStackedBarData(
      (d) => d.distributionChannel || '',
      filters.distributionChannel.length > 0 ? filters.distributionChannel : undefined
    )

    return {
      productTypeChartData: productTypeData.chartData,
      insuranceTypeChartData: insuranceTypeData.chartData,
      planTypeChartData: planTypeData.chartData,
      coverageTypeChartData: coverageTypeData.chartData,
      regionChartData,
      regionCountryPercentageChartData,
      productTypes: productTypeData.segments,
      insuranceTypes: insuranceTypeData.segments,
      planTypes: planTypeData.segments,
      coverageTypes: coverageTypeData.segments,
      regions,
      // Year-wise stacked bar chart data for share analysis
      insuranceTypeStackedData,
      planTypeStackedData,
      coverageTypeStackedData,
      distributionChannelStackedData,
    }
  }, [filteredData, filters.marketEvaluation, filters.productType, filters.insuranceType, filters.planType, filters.coverageType, filters.region, filters.distributionChannel])

  // KPI Stats
  const kpis = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalValue: 'N/A',
      }
    }

    const totalValue = filteredData.reduce((sum, d) => sum + getDataValue(d), 0)

    return {
      totalValue: filters.marketEvaluation === 'By Volume' 
        ? `${formatWithCommas(totalValue / 1000, 1)}K Units`
        : `${formatWithCommas(totalValue, 1)}M`,
    }
  }, [filteredData, filters.marketEvaluation])

  // Get unique options for incremental filters
  const incrementalFilterOptions = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        regions: [],
        insuranceTypes: [],
        countries: [],
      }
    }
    
    const regionSet = new Set<string>()
    const insuranceTypeSet = new Set<string>()
    const countrySet = new Set<string>()
    
    data.forEach(d => {
      if (d.region) regionSet.add(d.region)
      if (d.insuranceType) insuranceTypeSet.add(d.insuranceType)
      if (d.country) countrySet.add(d.country)
    })
    
    return {
      regions: Array.from(regionSet).sort(),
      insuranceTypes: Array.from(insuranceTypeSet).sort(),
      countries: Array.from(countrySet).sort(),
    }
  }, [data])

  // Filter data for incremental chart
  const filteredIncrementalData = useMemo(() => {
    let filtered = [...data]
    
    if (incrementalFilters.region.length > 0) {
      filtered = filtered.filter(d => incrementalFilters.region.includes(d.region))
    }
    if (incrementalFilters.insuranceType.length > 0) {
      filtered = filtered.filter(d => incrementalFilters.insuranceType.includes(d.insuranceType))
    }
    if (incrementalFilters.country.length > 0) {
      filtered = filtered.filter(d => incrementalFilters.country.includes(d.country))
    }
    
    return filtered
  }, [data, incrementalFilters])

  // Waterfall Chart Data (Incremental Opportunity) - based on filters
  const waterfallData = useMemo(() => {
    // Calculate base value from 2024 data
    const baseYearData = filteredIncrementalData.filter(d => d.year === 2024)
    const baseValue = baseYearData.reduce((sum, d) => sum + (d.marketValueUsd || 0) / 1000, 0) || 57159
    
    // Calculate incremental values for each year
    const incrementalValues = []
    for (let year = 2025; year <= 2031; year++) {
      const yearData = filteredIncrementalData.filter(d => d.year === year)
      const prevYearData = filteredIncrementalData.filter(d => d.year === year - 1)
      
      const yearValue = yearData.reduce((sum, d) => sum + (d.marketValueUsd || 0) / 1000, 0)
      const prevYearValue = prevYearData.reduce((sum, d) => sum + (d.marketValueUsd || 0) / 1000, 0)
      
      // If no data, use default incremental values scaled by filter
      const incremental = yearValue > 0 && prevYearValue > 0
        ? yearValue - prevYearValue
        : [2638.4, 2850.4, 3055.6, 3231.0, 3432.9, 3674.2, 3885.1][year - 2025] * (baseValue / 57159)
      
      incrementalValues.push({ year: String(year), value: incremental })
    }
    
    let cumulative = baseValue
    const chartData = [
      { year: '2024', baseValue, totalValue: baseValue, isBase: true },
      ...incrementalValues.map(item => {
        cumulative += item.value
        return {
          year: item.year,
          incrementalValue: item.value,
          totalValue: cumulative,
        }
      }),
      { year: '2032', baseValue: cumulative, totalValue: cumulative, isTotal: true },
    ]
    
    const totalIncremental = incrementalValues.reduce((sum, item) => sum + item.value, 0)
    
    return { chartData, incrementalOpportunity: totalIncremental }
  }, [filteredIncrementalData])

  // Get unique options for attractiveness filters
  const attractivenessFilterOptions = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        regions: [],
        insuranceTypes: [],
      }
    }
    
    const regionSet = new Set<string>()
    const insuranceTypeSet = new Set<string>()
    
    data.forEach(d => {
      if (d.region) regionSet.add(d.region)
      if (d.insuranceType) insuranceTypeSet.add(d.insuranceType)
    })
    
    return {
      regions: Array.from(regionSet).sort(),
      insuranceTypes: Array.from(insuranceTypeSet).sort(),
    }
  }, [data])

  // Filter data for attractiveness chart
  const filteredAttractivenessData = useMemo(() => {
    let filtered = [...data]
    
    // Filter by year range 2025-2032 (use available year range)
    const availableYears = [...new Set(data.map(d => d.year))].sort()
    const minYear = availableYears.length > 0 ? availableYears[Math.floor(availableYears.length * 0.3)] : 2025
    const maxYear = availableYears.length > 0 ? availableYears[availableYears.length - 1] : 2032
    
    filtered = filtered.filter(d => d.year >= minYear && d.year <= maxYear)
    
    if (attractivenessFilters.region.length > 0) {
      filtered = filtered.filter(d => attractivenessFilters.region.includes(d.region))
    }
    if (attractivenessFilters.insuranceType.length > 0) {
      filtered = filtered.filter(d => attractivenessFilters.insuranceType.includes(d.insuranceType))
    }
    
    return filtered
  }, [data, attractivenessFilters])

  // Bubble Chart Data (Market Attractiveness) - based on filters
  const bubbleChartData = useMemo(() => {
    // Group data by region
    const regionDataMap = new Map<string, {
      values: number[]
      volumes: number[]
      years: number[]
    }>()
    
    filteredAttractivenessData.forEach(d => {
      const region = d.region
      if (!region) return
      
      if (!regionDataMap.has(region)) {
        regionDataMap.set(region, { values: [], volumes: [], years: [] })
      }
      
      const regionData = regionDataMap.get(region)!
      const value = (d.marketValueUsd || 0) / 1000 // Convert to millions
      regionData.values.push(value)
      regionData.volumes.push(d.volumeUnits || 0)
      regionData.years.push(d.year)
    })
    
    // Calculate CAGR Index and Market Share Index for each region
    const regions = Array.from(regionDataMap.keys())
    const allRegionsTotal = filteredAttractivenessData.reduce((sum, d) => sum + (d.marketValueUsd || 0) / 1000, 0)
    
    const bubbleData = regions.map(region => {
      const regionData = regionDataMap.get(region)!
      
      // Calculate CAGR (Compound Annual Growth Rate) from 2025 to 2032
      const startYear = 2025
      const endYear = 2032
      const startValue = regionData.values.find((_, i) => regionData.years[i] === startYear) || 0
      const endValue = regionData.values.find((_, i) => regionData.years[i] === endYear) || 0
      
      let cagr = 0
      if (startValue > 0 && endValue > 0) {
        const years = endYear - startYear
        cagr = (Math.pow(endValue / startValue, 1 / years) - 1) * 100
      }
      
      // Calculate Market Share Index (average market share across years)
      const regionTotal = regionData.values.reduce((sum, v) => sum + v, 0)
      const marketShare = allRegionsTotal > 0 ? (regionTotal / allRegionsTotal) * 100 : 0
      
      // Calculate Incremental Opportunity (total growth from 2025 to 2032)
      const incrementalOpportunity = endValue - startValue
      
      // Normalize to index scale (0-10) for display
      const cagrIndex = Math.min(cagr / 10, 10) // Scale CAGR to 0-10 index
      const marketShareIndex = Math.min(marketShare / 10, 10) // Scale market share to 0-10 index
      
      // Use default values if no data
      const defaultValues: Record<string, { cagr: number; share: number; opp: number }> = {
        'Asia Pacific': { cagr: 8.5, share: 9.2, opp: 12500 },
        'Europe': { cagr: 5.2, share: 6.8, opp: 6800 },
        'Rest of Europe': { cagr: 4.8, share: 5.5, opp: 5500 },
        'North America': { cagr: 5.8, share: 7.1, opp: 7200 },
        'Middle East': { cagr: 6.5, share: 3.2, opp: 1200 },
        'Latin America': { cagr: 4.2, share: 2.8, opp: 800 },
        'Africa': { cagr: 3.8, share: 1.9, opp: 400 },
      }
      
      const defaults = defaultValues[region] || { cagr: 5.0, share: 5.0, opp: 5000 }
      
      // Use region name as display name
      const regionDisplayName = region
      
      return {
        region: regionDisplayName,
        cagrIndex: cagrIndex > 0 ? cagrIndex : defaults.cagr,
        marketShareIndex: marketShareIndex > 0 ? marketShareIndex : defaults.share,
        incrementalOpportunity: incrementalOpportunity > 0 ? incrementalOpportunity : defaults.opp,
        description: regionDisplayName === 'Asia Pacific' 
          ? 'Asia Pacific are expected to dominate the Global Shovel Market from rapid industrialization, strong manufacturing capabilities, and robust construction and agricultural sectors that drive significant demand for high-quality shovels.'
          : undefined,
      }
    })
    
    // If no regions in filtered data, return default regions
    if (bubbleData.length === 0) {
      return [
        {
          region: 'Asia Pacific',
          cagrIndex: 8.5,
          marketShareIndex: 9.2,
          incrementalOpportunity: 12500,
          description: 'Asia Pacific are expected to dominate the Global Shovel Market from rapid industrialization, strong manufacturing capabilities, and robust construction and agricultural sectors that drive significant demand for high-quality shovels.',
        },
        {
          region: 'Europe',
          cagrIndex: 5.2,
          marketShareIndex: 6.8,
          incrementalOpportunity: 6800,
        },
        {
          region: 'North America',
          cagrIndex: 5.8,
          marketShareIndex: 7.1,
          incrementalOpportunity: 7200,
        },
        {
          region: 'Middle East',
          cagrIndex: 6.5,
          marketShareIndex: 3.2,
          incrementalOpportunity: 1200,
        },
        {
          region: 'Latin America',
          cagrIndex: 4.2,
          marketShareIndex: 2.8,
          incrementalOpportunity: 800,
        },
        {
          region: 'Africa',
          cagrIndex: 3.8,
          marketShareIndex: 1.9,
          incrementalOpportunity: 400,
        },
      ]
    }
    
    return bubbleData
  }, [filteredAttractivenessData])

  // Get unique options for YoY filters
  const yoyFilterOptions = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        regions: [],
        insuranceTypes: [],
        countries: [],
        countryOptions: [],
      }
    }
    
    const regionSet = new Set<string>()
    const insuranceTypeSet = new Set<string>()
    const countryRegionMap = new Map<string, string>()
    
    data.forEach(d => {
      if (d.region) regionSet.add(d.region)
      if (d.insuranceType) insuranceTypeSet.add(d.insuranceType)
      if (d.country && d.region) {
        countryRegionMap.set(d.country, d.region)
      }
    })
    
    // Filter countries based on selected regions
    let availableCountries = Array.from(countryRegionMap.keys())
    if (yoyFilters.region.length > 0) {
      availableCountries = availableCountries.filter(country => {
        const countryRegion = countryRegionMap.get(country)
        return countryRegion && yoyFilters.region.includes(countryRegion)
      })
    }
    
    // Create country options with region names
    const countryOptions = availableCountries
      .sort()
      .map(country => {
        const region = countryRegionMap.get(country) || ''
        return {
          value: country,
          label: `${country} (${region})`
        }
      })
    
    return {
      regions: Array.from(regionSet).sort(),
      insuranceTypes: Array.from(insuranceTypeSet).sort(),
      countries: availableCountries.sort(),
      countryOptions: countryOptions,
    }
  }, [data, yoyFilters.region])

  // Filter data for YoY/CAGR chart
  const filteredYoyData = useMemo(() => {
    let filtered = [...data]
    
    if (yoyFilters.region.length > 0) {
      filtered = filtered.filter(d => yoyFilters.region.includes(d.region))
    }
    if (yoyFilters.insuranceType.length > 0) {
      filtered = filtered.filter(d => yoyFilters.insuranceType.includes(d.insuranceType))
    }
    if (yoyFilters.country.length > 0) {
      filtered = filtered.filter(d => yoyFilters.country.includes(d.country))
    }
    
    return filtered
  }, [data, yoyFilters])

  // YoY/CAGR Chart Data - Generate separate data for each country/region (no summation)
  const yoyCagrDataByEntity = useMemo(() => {
    // Determine which entities to create charts for
    const entities: Array<{ type: 'country' | 'region', name: string, label: string }> = []
    
    // If countries are selected, create charts for each country
    if (yoyFilters.country.length > 0) {
      yoyFilters.country.forEach(country => {
        // Find the region for this country
        const countryData = filteredYoyData.find(d => d.country === country)
        const region = countryData?.region || ''
        entities.push({
          type: 'country',
          name: country,
          label: `${country}${region ? ` (${region})` : ''}`
        })
      })
    } 
    // If only regions are selected (no countries), create charts for each region
    else if (yoyFilters.region.length > 0) {
      yoyFilters.region.forEach(region => {
        entities.push({
          type: 'region',
          name: region,
          label: region
        })
      })
    }
    // If nothing is selected, return empty array
    else {
      return []
    }
    
    // Generate data for each entity
    const entityDataMap = new Map<string, Array<{ year: string, yoy: number, cagr: number }>>()
    
    entities.forEach(entity => {
      // Filter data for this specific entity
      let entityFilteredData = filteredYoyData
      
      if (entity.type === 'country') {
        entityFilteredData = entityFilteredData.filter(d => d.country === entity.name)
      } else if (entity.type === 'region') {
        entityFilteredData = entityFilteredData.filter(d => d.region === entity.name)
      }
      
      // Group data by year for this entity (no summation across entities)
      const yearDataMap = new Map<number, number>()
      
      entityFilteredData.forEach(d => {
        const year = d.year
        const value = (d.marketValueUsd || 0) / 1000 // Convert to millions
        yearDataMap.set(year, (yearDataMap.get(year) || 0) + value)
      })
      
      // Sort years
      const years = Array.from(yearDataMap.keys()).sort()
      
      if (years.length < 2) {
        // Not enough data for YoY/CAGR calculation
        return
      }
      
      // Calculate YoY and CAGR for each year
      const chartData = years.map((year, index) => {
        const currentValue = yearDataMap.get(year) || 0
        
        // Calculate YoY (Year-over-Year) growth
        let yoy = 0
        if (index > 0) {
          const previousYear = years[index - 1]
          const previousValue = yearDataMap.get(previousYear) || 0
          if (previousValue > 0) {
            yoy = ((currentValue - previousValue) / previousValue) * 100
          }
        }
        
        // Calculate CAGR from first year to current year
        let cagr = 0
        if (index > 0) {
          const firstYear = years[0]
          const firstValue = yearDataMap.get(firstYear) || 0
          if (firstValue > 0 && currentValue > 0) {
            const yearsDiff = year - firstYear
            if (yearsDiff > 0) {
              cagr = (Math.pow(currentValue / firstValue, 1 / yearsDiff) - 1) * 100
            }
          }
        }
        
        return {
          year: String(year),
          yoy: yoy,
          cagr: cagr,
        }
      })
      
      entityDataMap.set(entity.label, chartData)
    })
    
    return Array.from(entityDataMap.entries()).map(([label, data]) => ({
      label,
      data
    }))
  }, [filteredYoyData, yoyFilters.country, yoyFilters.region])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading market analysis data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('Home')}
          className="flex items-center gap-2 px-5 py-2.5 bg-electric-blue text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
        >
          <ArrowLeft size={20} />
          Back to Home
        </motion.button>
      </div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <InfoTooltip content="• Provides insights into market size and volume analysis\n• Analyze data by market segments: Insurance Type, Plan Type, Coverage Type, Coverage Option, Enterprise Size, Product Type, Payor Type\n• Use filters to explore market trends\n• Charts show market size (US$ Million) or volume (Enrollment Count) by selected segments">
          <h1 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3 cursor-help">
            Market Analysis
          </h1>
        </InfoTooltip>
        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark">
          Global Group Health Insurance Market analysis by segments, countries, and years
        </p>
      </motion.div>

      {!data || data.length === 0 ? (
        <div className={`p-8 rounded-2xl shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'}`}>
          <div className="text-center py-12">
            <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark mb-4">
              No data available. Please check the data source.
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              If this issue persists, please refresh the page or contact support.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs Section */}
          <div className={`p-6 rounded-2xl mb-6 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'}`}>
            <div className="flex gap-4 border-b-2 border-gray-300 dark:border-navy-light">
              <button
                onClick={() => setActiveTab('standard')}
                className={`px-6 py-3 font-semibold text-base transition-all relative ${
                  activeTab === 'standard'
                    ? 'text-electric-blue dark:text-cyan-accent'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue dark:hover:text-cyan-accent'
                }`}
              >
                Market Size
                {activeTab === 'standard' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('incremental')}
                className={`px-6 py-3 font-semibold text-base transition-all relative ${
                  activeTab === 'incremental'
                    ? 'text-electric-blue dark:text-cyan-accent'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue dark:hover:text-cyan-accent'
                }`}
              >
                Incremental Opportunity
                {activeTab === 'incremental' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('attractiveness')}
                className={`px-6 py-3 font-semibold text-base transition-all relative ${
                  activeTab === 'attractiveness'
                    ? 'text-electric-blue dark:text-cyan-accent'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue dark:hover:text-cyan-accent'
                }`}
              >
                Market Attractiveness
                {activeTab === 'attractiveness' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('yoy')}
                className={`px-6 py-3 font-semibold text-base transition-all relative ${
                  activeTab === 'yoy'
                    ? 'text-electric-blue dark:text-cyan-accent'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue dark:hover:text-cyan-accent'
                }`}
              >
                Y-o-Y / CAGR Analysis
                {activeTab === 'yoy' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                )}
              </button>
            </div>
          </div>

          <DemoNotice />

          {/* Filters Section - Only for Standard Tab */}
          {activeTab === 'standard' && (
          <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'} relative`} style={{ overflow: 'visible' }}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  Filter Data
                </h3>
              </div>
              <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
                Filter market data by various criteria.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <FilterDropdown
                label="Year"
                value={filters.year.map(y => String(y))}
                onChange={(value) => setFilters({ ...filters, year: (value as string[]).map(v => Number(v)) })}
                options={uniqueOptions.years ? uniqueOptions.years.map(y => String(y)) : []}
              />
              <FilterDropdown
                label="Region"
                value={filters.region}
                onChange={(value) => {
                  setFilters({ ...filters, region: value as string[], country: [] })
                }}
                options={uniqueOptions.regions || []}
              />
              {filters.region.length > 0 && (
                <FilterDropdown
                  label="Country (within selected regions)"
                  value={filters.country}
                  onChange={(value) => setFilters({ ...filters, country: value as string[] })}
                  options={availableCountries}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <FilterDropdown
                label="Insurance Type"
                value={filters.insuranceType}
                onChange={(value) => setFilters({ ...filters, insuranceType: value as string[] })}
                options={uniqueOptions.insuranceTypes}
              />
              <FilterDropdown
                label="Plan Type"
                value={filters.planType}
                onChange={(value) => setFilters({ ...filters, planType: value as string[] })}
                options={uniqueOptions.planTypes}
              />
              <FilterDropdown
                label="Coverage Type"
                value={filters.coverageType}
                onChange={(value) => setFilters({ ...filters, coverageType: value as string[] })}
                options={uniqueOptions.coverageTypes}
              />
              <FilterDropdown
                label="Coverage Option"
                value={filters.coverageOption}
                onChange={(value) => setFilters({ ...filters, coverageOption: value as string[] })}
                options={uniqueOptions.coverageOptions}
              />
              <FilterDropdown
                label="Enterprise Size"
                value={filters.enterpriseSize}
                onChange={(value) => setFilters({ ...filters, enterpriseSize: value as string[] })}
                options={uniqueOptions.enterpriseSizes}
              />
              <FilterDropdown
                label="Product Type"
                value={filters.productType}
                onChange={(value) => setFilters({ ...filters, productType: value as string[] })}
                options={uniqueOptions.productTypes}
              />
              <FilterDropdown
                label="Payor Type"
                value={filters.payorType}
                onChange={(value) => setFilters({ ...filters, payorType: value as string[] })}
                options={uniqueOptions.payorTypes}
              />
              <FilterDropdown
                label="Distribution Channel"
                value={filters.distributionChannel}
                onChange={(value) => setFilters({ ...filters, distributionChannel: value as string[] })}
                options={availableDistributionChannels}
              />
            </div>

            {/* Active Filters Display */}
            {(filters.year.length > 0 || filters.insuranceType.length > 0 || filters.region.length > 0) && (
              <div className="mt-6 pt-6 border-t-2 border-gray-300 dark:border-navy-light">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-navy-dark' : 'bg-blue-50'}`}>
                  <p className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                    Currently Viewing:
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Year:</span>
                      <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                        {filters.year.length > 0 ? filters.year.join(', ') : 'All Years'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Insurance Type:</span>
                      <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                        {filters.insuranceType.length > 0 ? filters.insuranceType.join(', ') : 'All'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Regions:</span>
                      <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                        {filters.region.length > 0 ? filters.region.join(', ') : 'All Regions'}
                      </span>
                    </div>
                    {filters.country.length > 0 && (
                      <div>
                        <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Countries:</span>
                        <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                          {filters.country.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Tab Content */}
          {activeTab === 'standard' && (
            <>
              {/* KPI Cards */}
              <div className="mb-10">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                      Key Metrics
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <div className={`p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <StatBox
                      title={kpis.totalValue}
                      subtitle={`Total ${filters.marketEvaluation === 'By Volume' ? 'Volume' : 'Market Size'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Graph 1: Market Size by Product Type */}
          {analysisData.productTypeChartData.length > 0 && analysisData.productTypes && analysisData.productTypes.length > 0 && (
            <div className="mb-20">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                  <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} by product type grouped by year\n• X-axis: Year\n• Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Compare product type performance across years`}>
                    <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                      {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} by Product Type
                    </h2>
                  </InfoTooltip>
                </div>
                <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                  Product type performance comparison by year
                </p>
              </div>
              <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                  <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                    {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} by Product Type by Year
                  </h3>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {getDataLabel()}
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                  <SegmentGroupedBarChart
                    data={analysisData.productTypeChartData}
                    segmentKeys={analysisData.productTypes}
                    xAxisLabel="Year"
                    yAxisLabel={getDataLabel()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Share Analysis Section - Year-wise Stacked Bar Charts */}
          {((analysisData.insuranceTypeStackedData.chartData.length > 0 && analysisData.insuranceTypeStackedData.segments.length > 0) ||
            (analysisData.planTypeStackedData.chartData.length > 0 && analysisData.planTypeStackedData.segments.length > 0) ||
            (analysisData.coverageTypeStackedData.chartData.length > 0 && analysisData.coverageTypeStackedData.segments.length > 0) ||
            (analysisData.distributionChannelStackedData.chartData.length > 0 && analysisData.distributionChannelStackedData.segments.length > 0)) && (
            <div className="mb-20">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                  <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share across different segments by year\n• Each stacked bar represents a year with segments showing the proportion\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Hover over bars to see detailed values and percentages`}>
                    <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                      {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} Analysis by Segments
                    </h2>
                  </InfoTooltip>
                </div>
                <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                  Year-wise share breakdown (no summation across years)
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Insurance Type Stacked Bar Chart */}
                {analysisData.insuranceTypeStackedData.chartData.length > 0 && analysisData.insuranceTypeStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by insurance type by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Insurance Type Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.insuranceTypeStackedData.chartData}
                        dataKeys={analysisData.insuranceTypeStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}

                {/* Plan Type Stacked Bar Chart */}
                {analysisData.planTypeStackedData.chartData.length > 0 && analysisData.planTypeStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by plan type by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Plan Type Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.planTypeStackedData.chartData}
                        dataKeys={analysisData.planTypeStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}

                {/* Coverage Type Stacked Bar Chart */}
                {analysisData.coverageTypeStackedData.chartData.length > 0 && analysisData.coverageTypeStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by coverage type by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Coverage Type Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.coverageTypeStackedData.chartData}
                        dataKeys={analysisData.coverageTypeStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}



                {/* Distribution Channel Stacked Bar Chart */}
                {analysisData.distributionChannelStackedData.chartData.length > 0 && analysisData.distributionChannelStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by distribution channel by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Distribution Channel Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.distributionChannelStackedData.chartData}
                        dataKeys={analysisData.distributionChannelStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}


              </div>
            </div>
          )}

          {/* Graph 6: Market Size by Region */}
          {analysisData.regionChartData.length > 0 && analysisData.regions && analysisData.regions.length > 0 && (
            <div className="mb-20">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                  <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} by region grouped by year\n• X-axis: Year\n• Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Compare region performance across years`}>
                    <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                      {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} by Region by Year
                    </h2>
                  </InfoTooltip>
                </div>
                <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                  Region-wise breakdown grouped by year
                </p>
              </div>
              <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                  <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                    {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} by Region by Year
                  </h3>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {getDataLabel()}
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                  <SegmentGroupedBarChart
                    data={analysisData.regionChartData}
                    segmentKeys={analysisData.regions}
                    xAxisLabel="Year"
                    yAxisLabel={getDataLabel()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Graph 9: Region Country Percentage */}
          {analysisData.regionCountryPercentageChartData.length > 0 && (
            <div className="mb-20">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                  <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} by region and country grouped by year\n• X-axis: Year - Region combinations\n• Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : filters.marketEvaluation === 'By Value' ? 'Percentage (%)' : 'Market Size'}\n• Compare regional and country performance across years`}>
                    <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                      {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} by Region & Country
                    </h2>
                  </InfoTooltip>
                </div>
                {filters.marketEvaluation === 'By Value' && (
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                    Percentage distribution of countries within each region by year
                  </p>
                )}
                {filters.marketEvaluation === 'By Volume' && (
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                    Market volume by region and country grouped by year
                  </p>
                )}
              </div>
              <div className={`p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                  <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                    Regional Distribution
                  </h3>
                </div>
                <div className="flex-1 min-h-0 w-full">
                  <RegionCountryStackedBarChart
                    data={analysisData.regionCountryPercentageChartData}
                    dataKey="value"
                    xAxisLabel="Year"
                    yAxisLabel={filters.marketEvaluation === 'By Volume' ? 'Volume (Units)' : 'Percentage (%)'}
                    showPercentage={filters.marketEvaluation === 'By Value'}
                  />
                </div>
              </div>
            </div>
          )}
            </>
          )}

          {/* Incremental Opportunity Tab */}
          {activeTab === 'incremental' && (
            <>
              {/* Filters Section for Incremental Tab */}
              <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'} relative`} style={{ overflow: 'visible' }}>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                      Filter Data
                    </h3>
                  </div>
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
                    Filter incremental opportunity data by region, insurance type, and country.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FilterDropdown
                    label="Region"
                    value={incrementalFilters.region}
                    onChange={(value) => setIncrementalFilters({ ...incrementalFilters, region: value as string[] })}
                    options={incrementalFilterOptions.regions}
                  />
                  <FilterDropdown
                    label="Insurance Type"
                    value={incrementalFilters.insuranceType}
                    onChange={(value) => setIncrementalFilters({ ...incrementalFilters, insuranceType: value as string[] })}
                    options={incrementalFilterOptions.insuranceTypes}
                  />
                  <FilterDropdown
                    label="Country"
                    value={incrementalFilters.country}
                    onChange={(value) => setIncrementalFilters({ ...incrementalFilters, country: value as string[] })}
                    options={incrementalFilterOptions.countries}
                  />
                </div>
              </div>

              <div className="mb-20">
                <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[600px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                  <div className="flex-1 flex items-center justify-center min-h-0">
                    <WaterfallChart
                      data={waterfallData.chartData}
                      xAxisLabel="Incremental $ Opportunity"
                      yAxisLabel="Market Value (US$ Mn)"
                      incrementalOpportunity={waterfallData.incrementalOpportunity}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Market Attractiveness Tab */}
          {activeTab === 'attractiveness' && (
            <>
              {/* Filters Section for Attractiveness Tab */}
              <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'} relative`} style={{ overflow: 'visible' }}>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                      Filter Data
                    </h3>
                  </div>
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
                    Filter market attractiveness data by region and insurance type.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FilterDropdown
                    label="Region"
                    value={attractivenessFilters.region}
                    onChange={(value) => setAttractivenessFilters({ ...attractivenessFilters, region: value as string[] })}
                    options={attractivenessFilterOptions.regions}
                  />
                  <FilterDropdown
                    label="Insurance Type"
                    value={attractivenessFilters.insuranceType}
                    onChange={(value) => setAttractivenessFilters({ ...attractivenessFilters, insuranceType: value as string[] })}
                    options={attractivenessFilterOptions.insuranceTypes}
                  />
                </div>
              </div>

              <div className="mb-20">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <InfoTooltip content="• Shows market attractiveness by region from 2025 to 2032\n• X-axis: CAGR Index (Compound Annual Growth Rate)\n• Y-axis: Market Share Index\n• Bubble size indicates incremental opportunity\n• Larger bubbles represent greater market potential">
                      <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                        Market Attractiveness, By Region, 2025-2032
                      </h2>
                    </InfoTooltip>
                  </div>
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                    Market attractiveness analysis by CAGR and Market Share Index
                  </p>
                </div>
                <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[600px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                  <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                    <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                      Market Attractiveness Analysis
                    </h3>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      CAGR Index vs Market Share Index
                    </p>
                  </div>
                  <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                    <BubbleChart
                      data={bubbleChartData}
                      xAxisLabel="CAGR Index"
                      yAxisLabel="Market Share Index"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* YoY / CAGR Analysis Tab */}
          {activeTab === 'yoy' && (
            <>
              {/* Filters Section for YoY/CAGR Tab */}
              <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'} relative`} style={{ overflow: 'visible' }}>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                      Filter Data
                    </h3>
                  </div>
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
                    Filter YoY and CAGR analysis data by region, insurance type, and country.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FilterDropdown
                    label="Region"
                    value={yoyFilters.region}
                    onChange={(value) => {
                      const newRegions = value as string[]
                      // Clear country selection when region changes to avoid invalid states
                      setYoyFilters({ ...yoyFilters, region: newRegions, country: [] })
                    }}
                    options={yoyFilterOptions.regions}
                  />
                  <FilterDropdown
                    label="Insurance Type"
                    value={yoyFilters.insuranceType}
                    onChange={(value) => setYoyFilters({ ...yoyFilters, insuranceType: value as string[] })}
                    options={yoyFilterOptions.insuranceTypes}
                  />
                  <FilterDropdown
                    label="Country"
                    value={yoyFilters.country}
                    onChange={(value) => setYoyFilters({ ...yoyFilters, country: value as string[] })}
                    options={yoyFilterOptions.countries}
                    optionLabels={yoyFilterOptions.countryOptions.reduce((acc, opt) => {
                      acc[opt.value] = opt.label
                      return acc
                    }, {} as Record<string, string>)}
                  />
                </div>
              </div>

              <div className="mb-20">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <InfoTooltip content="• Shows Year-over-Year (Y-o-Y) growth rate and Compound Annual Growth Rate (CAGR)\n• Toggle between Y-o-Y and CAGR views using the button\n• Y-o-Y shows year-to-year growth percentage\n• CAGR shows cumulative annual growth rate from the first year\n• Select regions or countries to generate separate charts for each (no summation)\n• Use filters to analyze specific regions, product types, or countries">
                      <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                        Year-over-Year (Y-o-Y) & CAGR Analysis
                      </h2>
                    </InfoTooltip>
                  </div>
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                    Growth rate analysis with toggle between Y-o-Y and CAGR metrics. Separate charts for each selected country/region.
                  </p>
                </div>
                
                {yoyCagrDataByEntity.length === 0 ? (
                  <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="flex items-center justify-center h-[400px]">
                      <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg">
                        Please select at least one region or country to view the analysis
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {yoyCagrDataByEntity.map((entity, index) => (
                      <div key={index} className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[600px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                          <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                            {entity.label}
                          </h3>
                          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            Toggle between Y-o-Y and CAGR views
                          </p>
                        </div>
                        <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                          <YoYCAGRChart
                            data={entity.data}
                            xAxisLabel="Year"
                            yAxisLabel="Growth Rate (%)"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
