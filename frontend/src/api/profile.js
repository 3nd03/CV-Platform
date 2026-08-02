import client from './client'

export async function createProfile(profileData) {
  const { data } = await client.post('/profile', profileData)
  return data
}

export async function getProfile() {
  const { data } = await client.get('/profile')
  return data
}

export async function updateProfile(profileData) {
  const { data } = await client.put('/profile', profileData)
  return data
}

export async function getAllProfiles() {
  const { data } = await client.get('/profile/all')
  return data
}

export async function activateProfile(profileId) {
  const { data } = await client.put(`/profile/${profileId}/activate`)
  return data
}

export async function renameProfile(profileId, label) {
  const { data } = await client.put(`/profile/${profileId}/label`, { label })
  return data
}

export async function cvPrefill(file) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await client.post('/profile/cv-prefill', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getProfileHistory() {
  const { data } = await client.get('/profile/history')
  return data
}

export async function getToolHistory(toolKey) {
  const { data } = await client.get(`/profile/history/${toolKey}`)
  return data
}
