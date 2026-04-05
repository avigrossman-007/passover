import mixpanel from 'mixpanel-browser'

mixpanel.init('039a7132d6f151fdbdb5edea456a64f3', {
  track_pageview: true,
  persistence: 'localStorage',
})

// Persistent user ID per device
let userId = localStorage.getItem('passover-user-id')
if (!userId) {
  userId = crypto.randomUUID()
  localStorage.setItem('passover-user-id', userId)
}
mixpanel.identify(userId)

export function track(event: string, props?: Record<string, unknown>) {
  mixpanel.track(event, props)
}

export default mixpanel
