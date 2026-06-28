import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { spectatorApi } from '../api'

export const useJoinEvent = () => {
  const navigate = useNavigate()
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const joinByCode = useCallback(async (code: string) => {
    if (!code.trim()) {
      setError('Please enter an event code.')
      return
    }

    setIsJoining(true)
    setError(null)

    try {
      const event = await spectatorApi.getEventByCode(code.trim())
      navigate(`/events/${event.id}/watch`)
    } catch {
      setError('Event not found. Check the code and try again.')
    } finally {
      setIsJoining(false)
    }
  }, [navigate])

  return { joinByCode, isJoining, error, setError }
}