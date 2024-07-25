import useTransactionStatus from '@/composables/useTransactionStatus'
import { Address, TransactionExecutionError } from 'viem'

type EvmHowAboutToExecuteEvents = {
  onSuccess?: (param: EvmHowAboutToExecuteOnSuccessParam) => void
  onError?: () => void
}

export type EvmHowAboutToExecuteParam = {
  account: Address
  address: Address
  functionName: string
  abi: any
  args: any[]
} & EvmHowAboutToExecuteEvents

export type EvmHowAboutToExecuteOnSuccessParam = {
  txHash: string
  blockNumber: string
}

/*
 TODO
 unify useMetaTransaction api between evms
*/
export default function useEvmMetaTransaction() {
  const { $i18n } = useNuxtApp()
  const { isLoading, initTransactionLoader, status, stopLoader } =
    useTransactionStatus()
  const { urlPrefix } = usePrefix()
  const tx = ref<ExecResult>()
  const isError = ref(false)

  const { walletClient, publicClient } = useViem(urlPrefix.value)

  const howAboutToExecute = async ({
    account,
    functionName,
    address,
    args,
    abi,
    onSuccess,
    onError,
  }: EvmHowAboutToExecuteParam): Promise<void> => {
    try {
      const { request } = await publicClient.simulateContract({
        account,
        address,
        abi,
        args,
        functionName,
      })

      const txHash = await walletClient.writeContract(request)
      console.log('[EXEC] Executed', txHash)

      successCb(onSuccess)({ txHash })
    } catch (e) {
      errorCb(onError)({ error: e })
    }
  }

  const successCb =
    (onSuccess?: (param: EvmHowAboutToExecuteOnSuccessParam) => void) =>
    async ({ txHash }) => {
      const transaciton = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      })
      const blockNumber = transaciton.blockNumber.toString()

      console.log('[EXEC] Completed', transaciton)

      if (onSuccess) {
        onSuccess({ txHash: txHash, blockNumber: blockNumber })
      }

      status.value = TransactionStatus.Finalized
      isLoading.value = false
      tx.value = undefined
    }

  const errorCb =
    (onError?: () => void) =>
    ({ error }) => {
      if (error instanceof TransactionExecutionError) {
        const isCancelled = error.message.includes('User rejected the request.')
        isError.value = !isCancelled

        if (isCancelled) {
          warningMessage($i18n.t('general.tx.cancelled'), { reportable: false })
          status.value = TransactionStatus.Cancelled
        }
      } else {
        isError.value = true
        dangerMessage(error.toString())
        if (onError) {
          onError()
        }
      }
      isLoading.value = false
      tx.value = undefined
    }

  return {
    howAboutToExecute,
    initTransactionLoader,
    status,
    isLoading,
    stopLoader,
    isError,
  }
}
