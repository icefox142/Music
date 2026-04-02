/**
 * 通知 API
 * Notifications API
 */

export interface NotificationMessage {
  type: "notification" | "heartbeat" | "connected";
  data?: unknown;
  timestamp?: string;
}

/**
 * 订阅实时通知（SSE）
 *
 * @param onMessage - 接收到消息时的回调
 * @param onError - 发生错误时的回调
 * @returns EventSource 实例，用于取消订阅
 *
 * @example
 * ```ts
 * const eventSource = subscribeToNotifications(
 *   (message) => console.log('收到通知:', message),
 *   (error) => console.error('连接错误:', error)
 * );
 *
 * // 取消订阅
 * eventSource.close();
 * ```
 */
export const subscribeToNotifications = (
  onMessage: (message: NotificationMessage) => void,
  onError?: (error: Event) => void
): EventSource => {
  const token = localStorage.getItem("access_token");

  // SSE 不支持自定义 headers，需要通过 URL 参数传递 token
  const url = new URL("http://localhost:9999/api/client/notifications/subscribe");
  if (token) {
    url.searchParams.append("token", token);
  }

  const eventSource = new EventSource(url.toString());

  eventSource.addEventListener("notification", (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage({ type: "notification", data, timestamp: String(event.timeStamp) });
    } catch (error) {
      console.error("Failed to parse notification:", error);
    }
  });

  eventSource.addEventListener("heartbeat", (event) => {
    onMessage({ type: "heartbeat", timestamp: String(event.timeStamp) });
  });

  eventSource.addEventListener("connected", (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage({ type: "connected", data, timestamp: String(event.timeStamp) });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      onMessage({ type: "connected", timestamp: String(event.timeStamp) });
    }
  });

  eventSource.onerror = (error) => {
    if (onError) {
      onError(error);
    }
  };

  return eventSource;
};

/**
 * 导出通知API对象（保持API结构一致性）
 */
export const notificationsApi = {
  subscribe: subscribeToNotifications,
};
