import { Dialog, Form, Input, Select, Button, message } from 'tdesign-react';
import Text from '../typography';
import styles from './index.less';
import { useCallback, useMemo, useState } from 'react';
import type { BalanceResponse } from '@reddio.com/js';
import { reddio } from '@/utils/config';
import { ERC721Address } from '@/utils/common';
import { useQueryClient } from '@tanstack/react-query';
import { useSnapshot } from 'valtio';
import { store } from '@/utils/store';

const FormItem = Form.FormItem;

interface IOperateProps {
  onClose: () => void;
  balance: {
    ERC721: BalanceResponse[];
    ERC721M: BalanceResponse[];
  };
}

const Sell = (props: IOperateProps) => {
  const { onClose, balance } = props;
  const snap = useSnapshot(store);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<'ERC721' | 'ERC721M'>(
    'ERC721',
  );

  const rules = useMemo<any>(() => {
    return {
      price: [{ required: true, message: 'Price is required', type: 'error' }],
      tokenId: [
        {
          required: true,
          message: 'Token ID is required',
          type: 'error',
        },
      ],
    };
  }, []);

  const options = useMemo(() => {
    return balance[selectedType].map((item: any) => ({
      label: item.token_id,
      value: item.token_id,
    }));
  }, [balance, selectedType]);

  const submit = useCallback(async () => {
    const error = await form.validate?.();
    if (error && Object.keys(error).length) return;
    setLoading(true);
    const type = form.getFieldValue?.('type');
    const keypair = await reddio.keypair.generateFromEthSignature();
    const params = await reddio.utils.getOrderParams({
      keypair,
      amount: '1',
      tokenAddress: type === 'ERC721' ? ERC721Address : snap.erc721MAddress,
      tokenId: form.getFieldValue?.('tokenId'),
      orderType: 'sell',
      tokenType: type,
      price: form.getFieldValue?.('price').toString(),
      marketplaceUuid: '11ed793a-cc11-4e44-9738-97165c4e14a7',
    });
    await reddio.apis.order(params);
    setLoading(false);
    queryClient.refetchQueries(['orderList']);
    message.success('Sell Success');
    onClose();
  }, []);

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
          <Text type="bold">Sell NFT</Text>
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
              form.reset?.({ fields: ['tokenId'] });
              setSelectedType(changedValues.type as any);
            }
          }}
        >
          <FormItem label="Asset Type" name="type" initialData="ERC721">
            <Select
              clearable
              options={[
                { label: 'ERC721', value: 'ERC721' },
                { label: 'ERC721M', value: 'ERC721M' },
              ]}
            />
          </FormItem>
          <FormItem label="Token Id" name="tokenId">
            <Select clearable options={options} />
          </FormItem>
          <FormItem label="ETH Price" name="price" initialData={0.001}>
            <Input type="number" />
          </FormItem>
          <div className={styles.buttonWrapper}>
            <Button
              theme="default"
              shape="round"
              size="large"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              shape="round"
              size="large"
              loading={loading}
              onClick={submit}
            >
              Sell
            </Button>
          </div>
        </Form>
      </div>
    </Dialog>
  );
};

export default Sell;
