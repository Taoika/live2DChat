import { notification } from 'antd';
import type { NotificationPlacement } from 'antd/es/notification/interface';

export const notice = (msg: string) => {
  const openNotification = (placement: NotificationPlacement, msg: string) => {
    notification.info({
      message: "提示",
      description: msg,
      placement,
    });
  };
  
  openNotification('top', msg);
};
