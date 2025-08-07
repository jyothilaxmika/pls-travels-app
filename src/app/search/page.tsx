"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Navigation from '@/components/layout/Navigation'

interface SearchResult {
  id: string
  type: 'trip' | 'driver'
  title: string
  subtitle: string
  details: Record<string, any>
  created_at: string
}

export default function SearchPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    status: 'all'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const searchTerm = `%${searchQuery}%`
      
      // Search trips
      const { data: trips } = await supabase
        .from('trips')
        .select(`
          id,
          date,
          platform,
          destination,
          amount,
          distance_km,
          status,
          created_at,
          drivers(name, phone)
        `)
        .or(`destination.ilike.${searchTerm},platform.ilike.${searchTerm}`)
        .order('created_at', { ascending: false })

      // Search drivers
      const { data: drivers } = await supabase
        .from('drivers')
        .select('*')
        .or(`name.ilike.${searchTerm},phone.ilike.${searchTerm},license_number.ilike.${searchTerm}`)
        .order('created_at', { ascending: false })

      const searchResults: SearchResult[] = []

      // Process trip results
      if (trips) {
        trips.forEach(trip => {
          searchResults.push({
            id: trip.id,
            type: 'trip',
            title: `${trip.platform} - ${trip.destination}`,
            subtitle: `₹${trip.amount} • ${trip.distance_km}km`,
            details: trip,
            created_at: trip.created_at
          })
        })
      }

      // Process driver results
      if (drivers) {
        drivers.forEach(driver => {
          searchResults.push({
            id: driver.id,
            type: 'driver',
            title: driver.name,
            subtitle: `${driver.phone} • ${driver.license_number}`,
            details: driver,
            created_at: driver.created_at
          })
        })
      }

      // Apply filters
      let filteredResults = searchResults
      
      if (filters.type !== 'all') {
        filteredResults = filteredResults.filter(result => result.type === filters.type)
      }

      if (filters.status !== 'all') {
        filteredResults = filteredResults.filter(result => {
          if (result.type === 'trip') {
            return result.details.status === filters.status
          }
          return true
        })
      }

      setResults(filteredResults)

      // Add to search history
      if (searchQuery && !searchHistory.includes(searchQuery)) {
        setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      performSearch(query)
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'trip') {
      router.push(`/trips?trip=${result.id}`)
    } else {
      router.push(`/drivers/${result.id}`)
    }
  }

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem)
    performSearch(historyItem)
    router.push(`/search?q=${encodeURIComponent(historyItem)}`)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    router.push('/search')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trip':
        return <MapPin className="h-4 w-4" />
      case 'driver':
        return <Users className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Search</h1>
          <p className="text-gray-600">Find trips, drivers, and more</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search trips, drivers, destinations..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="trip">Trips</option>
                    <option value="driver">Drivers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && !query && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Searches</h3>
            <div className="space-y-2">
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(item)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Search className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getTypeIcon(result.type)}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 mb-1">
                          {result.title}
                        </h4>
                        <p className="text-gray-600 mb-2">{result.subtitle}</p>
                        
                        {result.type === 'trip' && (
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(result.details.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              ₹{result.details.amount}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(result.details.status)}`}>
                              {result.details.status}
                            </span>
                          </div>
                        )}
                        
                        {result.type === 'driver' && (
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{result.details.email}</span>
                            <span>{result.details.status}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleResultClick(result)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {query && !loading && results.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        )}
      </div>
    </div>
  )
}
