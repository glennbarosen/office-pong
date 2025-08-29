import { useQuery } from '@tanstack/react-query'
import { getMessagesWithFiltersOptions } from '../types/@tanstack/react-query.gen'
import type { GetMessagesWithFiltersData } from '../types'

export const useMessages = (queryOptions?: GetMessagesWithFiltersData['query']) =>
    useQuery(getMessagesWithFiltersOptions({ query: queryOptions }))
