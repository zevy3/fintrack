import { useMutation } from '@tanstack/react-query'
import { Button } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import { reportApi } from '../../../entities/report'
import { errorMessage } from '../../../shared/api/errors'
import { downloadBlob } from '../../../shared/lib/download'
import { useNotify } from '../../../shared/ui'

export function ExportCsvButton({ month }: { month: string }) {
  const notify = useNotify()
  const mutation = useMutation({
    mutationFn: () => reportApi.exportCsv(month),
    onSuccess: (blob) => downloadBlob(blob, `transactions-${month}.csv`),
    onError: (e) => notify(errorMessage(e), 'error'),
  })

  return (
    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => mutation.mutate()} disabled={mutation.isPending}>
      {mutation.isPending ? 'Формирование…' : 'Экспорт в CSV'}
    </Button>
  )
}
