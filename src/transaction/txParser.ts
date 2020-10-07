import {
  _Input,
  _Output,
  _DelegationCert,
  _StakingKeyRegistrationCert,
  _StakingKeyDeregistrationCert,
  _StakepoolRegistrationCert,
  _Withdrawal,
  _UnsignedTxDecoded,
  _UnsignedTxParsed,
  TxBodyKeys,
  TxCertificateKeys,
  _Certificates,
} from './types'

function parseTxInputs(txInputs: any[]): _Input[] {
  return txInputs.map(([txHash, outputIndex]): _Input => (
    { txHash, outputIndex }
  ))
}

function parseTxOutputs(txOutputs: any[]): _Output[] {
  return txOutputs.map(([address, coins]): _Output => (
    { address, coins }
  ))
}

function parseTxCerts(txCertificates: any[]): _Certificates {
  const stakeKeyRegistrationCertParser = (
    [type, [, pubKey]]: any,
  ): _StakingKeyRegistrationCert => ({ type, pubKey })

  const stakeKeyDeregistrationCertParser = (
    [type, [, pubKey]]: any,
  ): _StakingKeyDeregistrationCert => ({ type, pubKey })

  const delegationCertParser = (
    [type, [, pubKey], poolHash]: any,
  ): _DelegationCert => ({ type, pubKey, poolHash })

  const stakepoolRegistrationCertParser = (
    [
      type,
      poolPubKey,
      operatorPubKey,
      fixedCost,
      margin,
      tagged,
      rewardAddressBuff,
      ownerPubKeys,
      s1,
      s2,
    ]: any,
  ): _StakepoolRegistrationCert => ({
    // TODO: check whether this is accurate and which of these we actually need{
    type,
    poolPubKey,
    operatorPubKey,
    fixedCost,
    margin,
    tagged,
    rewardAddressBuff,
    ownerPubKeys,
    s1,
    s2,
  })

  const filterCertificates = (key: TxCertificateKeys) => txCertificates.filter(
    ([type]) => type === key,
  )

  const stakingKeyRegistrationCerts = filterCertificates(
    TxCertificateKeys.STAKING_KEY_REGISTRATION,
  ).map(stakeKeyRegistrationCertParser)

  const stakingKeyDeregistrationCerts = filterCertificates(
    TxCertificateKeys.STAKING_KEY_DEREGISTRATION,
  ).map(stakeKeyDeregistrationCertParser)

  const delegationCerts = filterCertificates(
    TxCertificateKeys.DELEGATION,
  ).map(delegationCertParser)

  const stakepoolRegistrationCerts = filterCertificates(
    TxCertificateKeys.STAKEPOOL_REGISTRATION,
  ).map(stakepoolRegistrationCertParser)

  return {
    stakingKeyRegistrationCerts,
    stakingKeyDeregistrationCerts,
    delegationCerts,
    stakepoolRegistrationCerts,
  }
}

function parseTxWithdrawals(withdrawals: Map<Buffer, number>): _Withdrawal[] {
  return Array.from(withdrawals).map(([address, coins]): _Withdrawal => (
    { address, coins }
  ))
}

function parseUnsignedTx([txBody, meta]: _UnsignedTxDecoded): _UnsignedTxParsed {
  const inputs = parseTxInputs(txBody.get(TxBodyKeys.INPUTS))
  const outputs = parseTxOutputs(txBody.get(TxBodyKeys.OUTPUTS))
  const fee = `${txBody.get(TxBodyKeys.FEE)}`
  const ttl = `${txBody.get(TxBodyKeys.TTL)}`
  const certificates = parseTxCerts(
    txBody.get(TxBodyKeys.CERTIFICATES) || [],
  )
  const withdrawals = parseTxWithdrawals(
    txBody.get(TxBodyKeys.WITHDRAWALS) || new Map(),
  )
  const metaDataHash = txBody.get(TxBodyKeys.META_DATA_HASH) as Buffer
  return {
    inputs,
    outputs,
    fee,
    ttl,
    certificates,
    withdrawals,
    metaDataHash,
    meta,
  }
}

export {
  parseUnsignedTx,
}
