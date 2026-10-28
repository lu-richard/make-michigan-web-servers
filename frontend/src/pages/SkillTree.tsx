import { useEffect, useState } from 'react'
import DashboardNavBar from '../components/DashboardNavBar'
import Sidebar from '../components/SkillTreeSidebar'
import { useAppContext } from '../context/AppContext'
import type { CertificateData, MakerspaceCardData, MakerspaceCreds, TrainingPrerequisites, CredentialModelLink } from '../types/types'
import { apiGetList } from '../lib/api'
import { Outlet } from 'react-router-dom'

/**
 * Fetch makerspace_credential_models rows for a makerspace.
 */
export async function fetchMakerspaceCredRows(
  makerspaceId: string
): Promise<{ data: MakerspaceCreds[] | null; error: any }> {
  try {
    const data = await apiGetList<MakerspaceCreds>('/makerspace-credential-models/', { makerspace_id: makerspaceId })
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Given an array of credential_model_ids, fetch credential_models rows (id + name).
 */
export async function fetchCredentialModelsByIds(
  ids: string[]
): Promise<{ data: CredentialModelLink[] | null; error: any }> {
  if (!ids || ids.length === 0) return { data: [], error: null }
  try {
    const data = await apiGetList<CredentialModelLink>('/credential-models/', { credential_model_id__in: ids.join(',') })
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Given dependent credential model ids, fetch prerequisite rows (credential_model_prerequisites)
 * and then fetch the credential_models for those prerequisite ids so callers have names.
 * Returns a map keyed by dependent id: { prerequisite_ids: [...], prerequisite_models: [...] }
 */
export async function fetchPrereqsForDependentModels(dependentIds: string[]): Promise<{
  prereqMap: Record<string, { prerequisite_ids: string[]; prerequisite_models: CredentialModelLink[] }>
  error: any
}> {
  if (!dependentIds || dependentIds.length === 0) {
    return { prereqMap: {}, error: null }
  }

  let rows: TrainingPrerequisites[]
  try {
    rows = await apiGetList<TrainingPrerequisites>('/credential-model-prereqs/', { dependent_credential_model_id__in: dependentIds.join(',') })
  } catch (error) {
    return { prereqMap: {}, error }
  }

  const map: Record<string, Set<string>> = {}
  for (const r of rows) {
    const dep = r.dependent_credential_model_id
    const prereq = r.prerequisite_credential_model_id
    if (!map[dep]) map[dep] = new Set()
    map[dep].add(prereq)
  }

  const allPrereqIds = Array.from(new Set(rows.map((r) => r.prerequisite_credential_model_id)))
  const { data: prereqModels, error: modelsErr } = await fetchCredentialModelsByIds(allPrereqIds)

  if (modelsErr) return { prereqMap: {}, error: modelsErr }

  const prereqModelsArr = prereqModels ?? []

  const prereqMap: Record<string, { prerequisite_ids: string[]; prerequisite_models: CredentialModelLink[] }> = {}
  for (const depId of Object.keys(map)) {
    const ids = Array.from(map[depId])
    prereqMap[depId] = {
      prerequisite_ids: ids,
      prerequisite_models: prereqModelsArr.filter((m) => ids.includes(m.credential_model_id)),
    }
  }

  return { prereqMap, error: null }
}




export default function SkillTree() {
  const { profile } = useAppContext()                               // changed code: get logged-in user
  const [selectedMakerspace, setSelectedMakerspace] = useState<MakerspaceCardData | null>(null)

  const [credentialModels, setCredentialModels] = useState<CredentialModelLink[] | null>(null)
  const [prereqMap, setPrereqMap] = useState<Record<string, { prerequisite_ids: string[]; prerequisite_models: CredentialModelLink[] }> | null>(null)
  const [credsLoading, setCredsLoading] = useState(false)
  const [credsError, setCredsError] = useState<string | null>(null)

  const [completedModelIds, setCompletedModelIds] = useState<Set<string>>(new Set())   // changed code: state for completed

  useEffect(() => {
    // Only bail out when there is no logged-in user.
    // loading completed trainings should not depend on the selected makerspace.
    if (!profile?.['user_id']) {
      setCompletedModelIds(new Set())
      return
    }

    let mounted = true

    const loadCompleted = async () => {
      try {
        const rows = await apiGetList<CertificateData>('/credential-summary/', { recipient_user_id: profile!['user_id'] })
        if (!mounted) return
        const ids = new Set(rows.map((r) => r.credential_model_id))
        setCompletedModelIds(ids)
      } catch {
        if (mounted) setCompletedModelIds(new Set())
      }
    }
    void loadCompleted()
    return () => {
      mounted = false
    }
  }, [profile?.['user_id']])
    useEffect(() => {
    let mounted = true

    if (!selectedMakerspace) {
      setCredentialModels(null)
      setPrereqMap(null)
      setCredsError(null)
      setCredsLoading(false)
      return
    }

    const loadCredentials = async () => {
      setCredsLoading(true)
      setCredsError(null)

      const { data: credsRows, error: credsRowsErr } = await fetchMakerspaceCredRows(selectedMakerspace.makerspace_id)
      if (!mounted) return

      if (credsRowsErr) {
        setCredsError(String((credsRowsErr as any)?.message ?? credsRowsErr))
        setCredentialModels([])
        setPrereqMap({})
        setCredsLoading(false)
        return
      }

      const modelIds = (credsRows ?? []).map((r: MakerspaceCreds) => r.credential_model_id)
      if (modelIds.length === 0) {
        setCredentialModels([])
        setPrereqMap({})
        setCredsLoading(false)
        return
      }

      const { data: models, error: modelsErr } = await fetchCredentialModelsByIds(modelIds)
      if (!mounted) return
      if (modelsErr) {
        setCredsError(String((modelsErr as any)?.message ?? modelsErr))
        setCredentialModels([])
        setPrereqMap({})
        setCredsLoading(false)
        return
      }
      setCredentialModels(models ?? [])

      const { prereqMap: fetchedPrereqMap, error: prereqErr } = await fetchPrereqsForDependentModels(modelIds)
      if (!mounted) return
      if (prereqErr) {
        setCredsError(String((prereqErr as any)?.message ?? prereqErr))
        setPrereqMap({})
      } else {
        setPrereqMap(fetchedPrereqMap)
      }

      setCredsLoading(false)
    }

    void loadCredentials()
    return () => {
      mounted = false
    }
  }, [selectedMakerspace])

  return (
    <>
      <DashboardNavBar />
      <div style={{ display: 'flex', height: '100vh' }}>
        <Sidebar onSelect={(m: MakerspaceCardData) => setSelectedMakerspace(m)} />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',       // horizontal centering
          }}
        >
          <Outlet context={{ selectedMakerspace, setSelectedMakerspace, credsLoading, credsError, credentialModels, prereqMap, completedModelIds }}/>
        </main>
      </div>
    </>
  )
}

