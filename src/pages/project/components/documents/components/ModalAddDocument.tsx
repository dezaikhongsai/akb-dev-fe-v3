import { ClockCircleOutlined, FileAddOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Typography } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";

interface IDocumentData {
    document : {
        projectId : string,
        type : string,
        name : string,
        contents : IContentInput[];
    };
    files : File[]
}

interface IContentInput{
    content : string;
    fileIndexes : number[];
}
interface ModalAddDocumentProp{
    open : boolean;
    onClose : () => void;
    onSuccess ? : () => void;
}

const ModalAddDocument : React.FC<ModalAddDocumentProp> = ({
    open,
    onClose,
    onSuccess
}) => {

  const {t} = useTranslation(['project' , 'common']);

  const handleSave = () => {
    console.log("save click");
  }
  return (
   <Modal
    open = {open}
    onCancel={onClose}
    width={800}
    title = {
        <Space>
            <FileAddOutlined/>
            <Typography.Text>{t('document.add')}</Typography.Text>
        </Space>
    }
    footer = {[
        <Button
          icon = {<ClockCircleOutlined/>}
          onClick={onClose}
        >
            {t('common.close')}
        </Button>,
        <Button
          icon = {<SaveOutlined/>}
          onClick={handleSave}
        >
            {t('document.save')}
        </Button>
    ]}
   >
    This is a modal;
   </Modal>
  )
}

export default ModalAddDocument
