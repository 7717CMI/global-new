import { useState, useEffect } from 'react'
import { ArrowLeft, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { InfoTooltip } from '../components/InfoTooltip'

interface CustomerIntelligenceProps {
  onNavigate: (page: string) => void
}

export function CustomerIntelligence({ onNavigate }: CustomerIntelligenceProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState<'first' | 'second' | 'third' | null>(null)
  const [csvData, setCsvData] = useState<string[][]>([])
  const [loading, setLoading] = useState(false)

  const loadCSV = async (fileName: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/${fileName}`)
      const text = await response.text()
      
      // Parse CSV
      const rows = text.split('\n').map(row => {
        const cells: string[] = []
        let cell = ''
        let inQuotes = false
        
        for (let i = 0; i < row.length; i++) {
          const char = row[i]
          
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            cells.push(cell.trim())
            cell = ''
          } else {
            cell += char
          }
        }
        cells.push(cell.trim())
        return cells
      })
      
      setCsvData(rows.filter(row => row.some(cell => cell.length > 0)))
    } catch (error) {
      console.error('Error loading CSV:', error)
      setCsvData([])
    }
    setLoading(false)
  }

  const handleTabClick = (tab: 'first' | 'second' | 'third', fileName: string) => {
    setActiveTab(tab)
    loadCSV(fileName)
  }

  const handleExportCSV = () => {
    if (!activeTab) return
    
    const fileName = activeTab === 'first' ? 'first-pre.csv' : activeTab === 'second' ? 'second-pre.csv' : 'third-pre.csv'
    const link = document.createElement('a')
    link.href = `/${fileName}`
    link.download = fileName
    link.click()
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
        {activeTab && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <Download size={20} />
            Export CSV
          </motion.button>
        )}
      </div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <InfoTooltip content="• View comprehensive customer intelligence data\n• Select different propositions to view detailed customer information\n• Download CSV files for each proposition">
          <h1 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3 cursor-help">
            Customer Intelligence
          </h1>
        </InfoTooltip>
        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark">
          Global customer data analysis and insights
        </p>
      </motion.div>

      {/* Proposition Tabs */}
      <div className={`p-8 rounded-2xl shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'}`}>
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
            Customer Database Propositions
          </h3>
          <p className="text-base text-text-secondary-light dark:text-text-secondary-dark">
            Select a proposition to view detailed customer data
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-4 mb-6 border-b border-gray-300 dark:border-navy-light">
          <button
            onClick={() => handleTabClick('first', 'first-pre.csv')}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
              activeTab === 'first'
                ? isDark 
                  ? 'text-cyan-accent border-cyan-accent bg-navy-dark' 
                  : 'text-electric-blue border-electric-blue bg-blue-50'
                : isDark 
                  ? 'text-gray-400 border-transparent hover:text-cyan-accent hover:border-cyan-accent hover:bg-navy-dark' 
                  : 'text-gray-600 border-transparent hover:text-electric-blue hover:border-electric-blue hover:bg-blue-50'
            }`}
          >
            Proposition 1
          </button>
          <button
            onClick={() => handleTabClick('second', 'second-pre.csv')}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
              activeTab === 'second'
                ? isDark 
                  ? 'text-cyan-accent border-cyan-accent bg-navy-dark' 
                  : 'text-electric-blue border-electric-blue bg-blue-50'
                : isDark 
                  ? 'text-gray-400 border-transparent hover:text-cyan-accent hover:border-cyan-accent hover:bg-navy-dark' 
                  : 'text-gray-600 border-transparent hover:text-electric-blue hover:border-electric-blue hover:bg-blue-50'
            }`}
          >
            Proposition 2
          </button>
          <button
            onClick={() => handleTabClick('third', 'third-pre.csv')}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
              activeTab === 'third'
                ? isDark 
                  ? 'text-cyan-accent border-cyan-accent bg-navy-dark' 
                  : 'text-electric-blue border-electric-blue bg-blue-50'
                : isDark 
                  ? 'text-gray-400 border-transparent hover:text-cyan-accent hover:border-cyan-accent hover:bg-navy-dark' 
                  : 'text-gray-600 border-transparent hover:text-electric-blue hover:border-electric-blue hover:bg-blue-50'
            }`}
          >
            Proposition 3
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading customer data...</p>
            </div>
          </div>
        ) : !activeTab ? (
          <div className={`p-6 rounded-lg ${isDark ? 'bg-navy-dark' : 'bg-gray-50'}`}>
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-electric-blue dark:text-cyan-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                Click on a proposition tab to view customer data
              </h4>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                Each proposition contains detailed customer information including contact details, purchase metrics, and insights
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className={`border-b-2 ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  {csvData[0]?.map((header, index) => (
                    <th
                      key={index}
                      className={`px-3 py-2 text-left font-semibold ${isDark ? 'bg-navy-dark' : 'bg-gray-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.slice(1).map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`border-b ${isDark ? 'border-navy-light hover:bg-navy-dark' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
