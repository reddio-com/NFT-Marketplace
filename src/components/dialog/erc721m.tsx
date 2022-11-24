import { Dialog, Form, Input, Button } from 'tdesign-react';
import Text from '../typography';
import styles from './index.less';
import { useCallback, useMemo } from 'react';

const FormItem = Form.FormItem;

interface IOperateProps {
  onClose: () => void;
}

const ERC721MDialog = (props: IOperateProps) => {
  const { onClose } = props;
  const [form] = Form.useForm();

  const rules = useMemo<any>(() => {
    return {
      address: [
        { required: true, message: 'Address is required', type: 'error' },
      ],
    };
  }, []);

  const submit = useCallback(async () => {
    const error = await form.validate?.();
    if (error && Object.keys(error).length) return;
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
          <Text type="bold">Add ERC721M</Text>
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
          <FormItem
            label="Contract Address"
            name="address"
            initialData={window.localStorage.getItem('erc721m') || ''}
          >
            <Input />
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
            <Button shape="round" size="large" onClick={submit}>
              Add
            </Button>
          </div>
        </Form>
      </div>
    </Dialog>
  );
};

export default ERC721MDialog;
