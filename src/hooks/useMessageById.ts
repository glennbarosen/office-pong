import { useQuery } from '@tanstack/react-query'
import { getMessageByIdOptions } from '../types/@tanstack/react-query.gen'

export const useMessageById = (id: string) => useQuery(getMessageByIdOptions({ path: { id } }))
