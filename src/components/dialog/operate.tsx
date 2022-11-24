import {
  Dialog,
  Form,
  Input,
  Select,
  Button,
  NotificationPlugin,
} from 'tdesign-react';
import { InfoCircleFilledIcon } from 'tdesign-icons-react';
import Text from '../typography';
import styles from './index.less';
import { store } from '@/utils/store';
import { useCallback, useMemo, useState } from 'react';
import { reddio } from '@/utils/config';
import { ERC20Address, ERC721Address } from '@/utils/common';
import type { SignTransferParams, BalancesV2Response } from '@reddio.com/js';

const FormItem = Form.FormItem;

interface IOperateProps {
  type: string;
  ethAddress: string;
  onClose: () => void;
  l1Balance: Record<string, any>;
  l2Balance: BalancesV2Response[];
}

const Operate = (props: IOperateProps) => {
  const { type, onClose, l1Balance, l2Balance, ethAddress } = props;
  const [form] = Form.useForm();

  const [selectType, setSelectType] = useState('GoerliETH');
  const [needApprove, setNeedApprove] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => {
    switch (type) {
      case 'Deposit': {
        return 'Deposit L1 Asset to starkex';
      }
      case 'Transfer': {
        return 'Transfer between two starkex accounts';
      }
      default: {
        return 'Withdraw from L2';
      }
    }
  }, [type]);

  const balance = useMemo(() => {
    if (type === 'Deposit') {
      return l1Balance[selectType || 'GoerliETH'];
    }
    const item = l2Balance.find((item) => item.contract_address === selectType);
    return item ? item.display_value : '';
  }, [selectType, l1Balance, type, l2Balance]);

  const balanceValidator = useCallback(
    (val: string) => {
      if (Number(val) > Number(balance)) {
        return {
          result: false,
          message: "You don't have that much balance",
          type: 'error',
        };
      }
      return { result: true, message: '', type: 'success' };
    },
    [balance],
  );

  const rules = useMemo<any>(() => {
    return {
      type: [{ required: true, message: 'Type is required', type: 'error' }],
      address: [
        { required: true, message: 'Address is required', type: 'error' },
      ],
      tokenId: [
        {
          required: form.getFieldValue?.('type') === 'ERC721',
          message: 'Token ID is required',
          type: 'error',
        },
      ],
      amount: [
        {
          required: form.getFieldValue?.('type') !== 'ERC721',
          message: 'Amount is required',
          type: 'error',
        },
        { validator: balanceValidator },
      ],
    };
  }, [balanceValidator]);

  const buttonText = useMemo(() => {
    if (type === 'Deposit') {
      return needApprove ? 'Approve' : type;
    }
    return type;
  }, [type, needApprove]);

  const tokenIds = useMemo(() => {
    if (type === 'Deposit') {
      return l1Balance.tokenIds.map((item: any) => ({
        label: item,
        value: item,
      }));
    }
    const item = l2Balance.find((item) => item.contract_address === selectType);
    if (item && (item.type === 'ERC721' || item.type === 'ERC721M')) {
      return item.available_token_ids.map((id) => ({ label: id, value: id }));
    }
    return [];
  }, [type, l1Balance, l2Balance, selectType]);

  const options = useMemo(() => {
    if (type === 'Deposit') {
      return [
        { label: 'GoerliETH', value: 'GoerliETH' },
        { label: 'ERC20', value: 'ERC20' },
        { label: 'ERC721', value: 'ERC721' },
      ];
    } else {
      return l2Balance.map((item) => ({
        label: item.symbol,
        value: item.contract_address,
      }));
    }
  }, [l2Balance, type]);

  const isERC721 = useMemo(() => {
    const item = l2Balance.find((item) => item.contract_address === selectType);
    return item && (item.type === 'ERC721' || item.type === 'ERC721M');
  }, [selectType, l2Balance]);

  const showNotification = useCallback((content: string) => {
    const notification = NotificationPlugin.success({
      title: 'Message',
      content,
      closeBtn: true,
      duration: 10000,
      onCloseBtnClick: () => {
        NotificationPlugin.close(notification);
      },
    });
  }, []);

  const approve = useCallback(async () => {
    try {
      setLoading(true);
      const tokenAddress =
        selectType === 'ERC20' ? ERC20Address : ERC721Address;
      let tx;
      if (selectType === 'ERC20') {
        tx = await reddio.erc20.approve({
          tokenAddress,
          amount: form.getFieldValue?.('amount'),
        });
      } else {
        tx = await reddio.erc721.approve({
          tokenAddress,
          tokenId: form.getFieldValue?.('tokenId'),
        });
      }
      showNotification(
        'Approve success，wait a moment before making a deposit',
      );
      await tx.wait();
      setNeedApprove(false);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }, [selectType]);

  const deposit = useCallback(
    async (type: any) => {
      try {
        setLoading(true);
        const { starkKey } = store;
        const quantizedAmount = form.getFieldValue?.('amount');
        if (type === 'ETH') {
          await reddio.apis.depositETH({
            starkKey,
            quantizedAmount,
          });
        } else if (type === 'ERC20') {
          await reddio.apis.depositERC20({
            starkKey,
            quantizedAmount,
            tokenAddress: ERC20Address,
          });
        } else {
          await reddio.apis.depositERC721({
            starkKey,
            tokenId: form.getFieldValue?.('tokenId'),
            tokenAddress: ERC721Address,
          });
        }
        showNotification('Deposit is successful, please wait for the arrival');
        setLoading(false);
        onClose();
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    },
    [store, form],
  );

  const transfer = useCallback(
    async (type: any) => {
      try {
        console.log(type, '=======');
        setLoading(true);
        const { starkKey } = store;
        const amount = form.getFieldValue?.('amount');
        const receiver = form.getFieldValue?.('address');
        const tokenId = form.getFieldValue?.('tokenId');
        const { privateKey } = await reddio.keypair.generateFromEthSignature();
        const params: SignTransferParams = {
          starkKey,
          privateKey,
          amount,
          receiver,
          type,
        };
        if (type === 'ERC20') {
          params.contractAddress = selectType;
        }
        if (type === 'ERC721' || type === 'ERC721M') {
          params.contractAddress = selectType;
          params.tokenId = tokenId;
        }
        await reddio.apis.transfer(params);
        showNotification('Transfer is successful, please wait for the arrival');
        setLoading(false);
        onClose();
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    },
    [store, form, selectType],
  );

  const withdrawal = useCallback(
    async (type: any) => {
      try {
        setLoading(true);
        const { starkKey } = store;
        const amount = form.getFieldValue?.('amount');
        const receiver = form.getFieldValue?.('address');
        const tokenId = form.getFieldValue?.('tokenId');
        const { privateKey } = await reddio.keypair.generateFromEthSignature();
        const params: SignTransferParams = {
          starkKey,
          privateKey,
          amount,
          receiver,
          type,
        };
        if (type === 'ERC20') {
          params.contractAddress = selectType;
        }
        if (type === 'ERC721' || type === 'ERC721M') {
          params.contractAddress = selectType;
          params.tokenId = tokenId;
        }
        await reddio.apis.withdrawalFromL2(params);
        showNotification(
          'WithdrawalFromL2 is successful, please wait for the arrival',
        );
        setLoading(false);
        onClose();
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    },
    [store, form, selectType],
  );

  const submit = useCallback(async () => {
    const error = await form.validate?.();
    if (error && Object.keys(error).length) return;
    const assetType = l2Balance.find(
      (item) => item.contract_address === selectType,
    )?.type;
    switch (type) {
      case 'Deposit': {
        if (buttonText === 'Approve') {
          approve();
        } else {
          deposit(assetType);
        }
        return;
      }
      case 'Transfer': {
        transfer(assetType);
        return;
      }
      case 'Withdrawal': {
        withdrawal(assetType);
        return;
      }
    }
  }, [selectType, buttonText]);

  return (
    <Dialog
      closeBtn
      closeOnOverlayClick
      destroyOnClose={false}
      draggable={false}
      footer={false}
      header={false}
      mode="modal"
      onClose={onClose}
      placement="top"
      preventScrollThrough
      showInAttachedElement={false}
      showOverlay
      theme="default"
      visible
    >
      <div className={styles.operateDialogContent}>
        <div>
          <Text type="bold">{title}</Text>
        </div>
        <Form
          form={form}
          colon={false}
          requiredMark
          labelAlign="top"
          layout="vertical"
          preventSubmitDefault
          showErrorMessage
          rules={rules}
          onValuesChange={(changedValues) => {
            if (changedValues.type) {
              setNeedApprove(changedValues.type !== 'GoerliETH');
              setSelectType(changedValues.type as any);
              form.reset?.({ type: 'initial', fields: ['amount', 'tokenId'] });
            }
            if (changedValues.tokenId) {
              setNeedApprove(true);
            }
          }}
        >
          <FormItem label="Asset Type" name="type">
            <Select clearable options={options} />
          </FormItem>
          <FormItem
            initialData={
              type !== 'Transfer'
                ? type === 'Withdrawal'
                  ? ethAddress
                  : store.starkKey
                : '0x4c2d19ac0a343218cebcea5ab124440a0650744c081247b8e4146877d2a5cad'
            }
            label={
              type === 'Withdrawal' ? 'To ETH Address' : 'To Starkex Address'
            }
            name="address"
          >
            <Input size="medium" status="default" type="text" />
          </FormItem>
          {isERC721 ? (
            <FormItem label="Token Id" name="tokenId">
              <Select clearable options={tokenIds} />
            </FormItem>
          ) : (
            <FormItem label="Amount" name="amount">
              <Input size="medium" status="default" type="number" />
            </FormItem>
          )}
        </Form>
        {!isERC721 ? <Text>Balance: {balance}</Text> : null}
        <div className={styles.buttonWrapper}>
          <Button theme="default" shape="round" size="large" onClick={onClose}>
            Cancel
          </Button>
          <Button shape="round" size="large" onClick={submit} loading={loading}>
            {buttonText}
          </Button>
        </div>
        {type === 'Withdrawal' ? (
          <div className={styles.infoWrapper}>
            <InfoCircleFilledIcon />
            <Text>
              Wait approximately 4 hours for funds move to the withdrawal area.
            </Text>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
};

export default Operate;
