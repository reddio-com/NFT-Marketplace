import { Dialog, Form, Input, Select, Button, message } from 'tdesign-react';
import Text from '../typography';
import styles from './index.less';
import { useCallback, useMemo, useState } from 'react';
import type { BalanceResponse } from '@reddio.com/js';
import { reddio } from '@/utils/config';
import { ERC20Address, ERC721Address, USRDAddress } from '@/utils/common';
import { useQueryClient } from '@tanstack/react-query';
import { useSnapshot } from 'valtio';
import { store } from '@/utils/store';
import { generateKey } from '@/utils/util';

const FormItem = Form.FormItem;

interface IOperateProps {
  onClose: () => void;
  balance: {
    ERC721: BalanceResponse[];
    ERC721M: BalanceResponse[];
  };
}

const SellERC20 = (props: IOperateProps) => {
  const { onClose, balance } = props;
  const snap = useSnapshot(store);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const rules = useMemo<any>(() => {
    return {
      price: [{ required: true, message: 'Price is required', type: 'error' }],
      amount: [
        { required: true, message: 'Amount is required', type: 'error' },
      ],
    };
  }, []);

  const submit = useCallback(async () => {
    const error = await form.validate?.();
    if (error && Object.keys(error).length) return;
    setLoading(true);
    const keypair = await generateKey();
    const params = await reddio.utils.getOrderParams({
      keypair,
      amount: '1',
      tokenAddress: ERC20Address,
      orderType: 'sell',
      tokenType: 'ERC20',
      price: form.getFieldValue?.('price').toString(),
      baseTokenAddress: USRDAddress,
      baseTokenType: 'ERC20',
    });
    await reddio.apis.order(params);
    setLoading(false);
    queryClient.refetchQueries(['erc20OrderListQuery']);
    message.success('SellERC20 Success');
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
          <Text type="bold">Sell ERC20</Text>
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
        >
          <FormItem label="Amount" name="amount" initialData={1}>
            <Input type="number" />
          </FormItem>
          <FormItem label="RED20 Price" name="price" initialData={1}>
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

export default SellERC20;
