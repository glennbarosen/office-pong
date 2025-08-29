import type { ClientType, DistGroupType } from '../types'

interface Option<T> {
    label: string
    value: T
}

export const DIST_GROUPS: Option<DistGroupType>[] = [
    { label: 'Fremtind', value: 'FRE' },
    { label: 'Sparebank 1', value: 'SB1' },
    { label: 'DNB', value: 'DNB' },
    { label: 'Eika', value: 'EIK' },
    { label: 'Fana', value: 'FAN' },
    { label: 'Møre', value: 'MOR' },
]

export const CLIENTS: Option<ClientType>[] = [
    { label: 'SAM', value: 'SAM' },
    { label: 'SKS', value: 'SKS' },
    { label: 'Kundesøk BM', value: 'KUNDESOK_BM' },
]
