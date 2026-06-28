import { useAuthStore } from '../../features/auth/store/authStore'

export const useUnits = () => {
  const user = useAuthStore((state) => state.user)
  const useMetric = user?.unitPreference === 'Kilometers'
  return { useMetric }
}