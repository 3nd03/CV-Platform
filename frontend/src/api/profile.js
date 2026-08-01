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
