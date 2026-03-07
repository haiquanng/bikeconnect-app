import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { orderService } from '../../api/orderService';
import { API_BASE_URL } from '../../config/appConfig';

// Order statuses after VNPay IPN / return processes successfully
const SUCCESS_STATUSES = new Set(['WAITING_SELLER_CONFIRMATION', 'COMPLETED']);
const FAILURE_STATUSES = new Set(['PAYMENT_TIMEOUT', 'DEPOSIT_EXPIRED', 'CANCELLED', 'REJECTED']);

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS  = 5 * 60 * 1000; // 5 phút

const VnpayWebViewScreen = ({ navigation, route }: any) => {
  const { paymentUrl, orderId } = route.params as { paymentUrl: string; orderId: string };

  const [webLoading, setWebLoading] = useState(true);
  const [polling, setPolling]       = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successOpacity = useRef(new Animated.Value(0)).current;

  // Refs for stable, non-stale values
  const handledRef         = useRef(false);
  const pollingStartedRef  = useRef(false);      // guard: prevent multiple intervals
  const firstLoadDoneRef   = useRef(false);      // hide loading only once
  const pollTimerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef         = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) { clearInterval(pollTimerRef.current);  pollTimerRef.current = null; }
    if (timeoutRef.current)   { clearTimeout(timeoutRef.current);     timeoutRef.current   = null; }
    setPolling(false);
  }, []);

  // Single place to finish with result — prevents double-navigation
  const finish = useCallback((result: 'success' | 'failed' | 'cancelled', reason?: string) => {
    if (handledRef.current) { return; }
    handledRef.current = true;
    stopPolling();

    if (result === 'failed') {
      Alert.alert(
        'Thanh toán thất bại',
        reason ?? 'Giao dịch không thành công. Vui lòng thử lại.',
        [{ text: 'OK', onPress: () => navigation.replace('OrderDetail', { orderId, paymentResult: 'failed' }) }],
      );
    } else if (result === 'cancelled') {
      navigation.replace('OrderDetail', { orderId, paymentResult: 'cancelled' });
    } else {
      // Show success overlay for 3s before navigating
      setShowSuccess(true);
      Animated.timing(successOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      setTimeout(() => {
        navigation.replace('OrderDetail', { orderId, paymentResult: 'success' });
      }, 3000);
    }
  }, [navigation, orderId, stopPolling, successOpacity]);

  // Forward VNPay return URL params to real backend — this is how order status gets updated
  // (WebView can't load localhost return URL, so we proxy the call ourselves)
  const forwardReturnUrl = useCallback((interceptedUrl: string) => {
    const queryString = interceptedUrl.split('?')[1] ?? '';
    if (!queryString) { return; }
    const backendUrl = `${API_BASE_URL}/orders/vnpay-return?${queryString}`;
    fetch(backendUrl).catch(() => {}); // fire-and-forget; polling handles success detection
  }, []);

  // FAST PATH A: intercept the vnpay-return URL *before* WebView loads it
  // Blocks ERR_CONNECTION_REFUSED on localhost, forwards params to real backend
  const shouldStartLoadWithRequest = useCallback((request: { url: string }) => {
    const url = request.url ?? '';
    // VNPay sandbox is allowed to load
    if (url.includes('sandbox.vnpayment.vn') || url.includes('vnpayment.vn')) {
      return true;
    }
    // Intercept return URL: forward to backend then decide outcome from responseCode
    if (url.includes('vnpay-return')) {
      const responseCode = url.match(/vnp_ResponseCode=(\d+)/)?.[1];
      if (responseCode === '00') {
        forwardReturnUrl(url); // backend processes → order status updates
        finish('success');     // polling in OrderDetail will confirm final status
      } else {
        finish('failed');
      }
      return false;
    }
    // Fallback for redirect-based results (payment=success/failed in URL)
    if (url.includes('payment=success')) { finish('success'); return false; }
    if (url.includes('payment=failed'))  { finish('failed');  return false; }
    return true;
  }, [finish, forwardReturnUrl]);

  // FAST PATH B: onNavigationStateChange as fallback (fires after navigation starts)
  const handleNavigationChange = useCallback((navState: WebViewNavigation) => {
    const url = navState.url ?? '';
    if (url.includes('payment=success')) { finish('success'); }
    else if (url.includes('payment=failed')) { finish('failed'); }
  }, [finish]);

  // POLL PATH: poll order status every 2.5s (handles IPN-only cases)
  const startPolling = useCallback(() => {
    if (pollingStartedRef.current) { return; }  // already started, skip
    pollingStartedRef.current = true;
    setPolling(true);

    timeoutRef.current = setTimeout(() => {
      if (!handledRef.current) {
        handledRef.current = true;
        stopPolling();
        Alert.alert(
          'Hết thời gian chờ',
          'Không nhận được xác nhận từ VNPay. Vui lòng kiểm tra lại đơn hàng.',
          [{ text: 'Xem đơn hàng', onPress: () => navigation.replace('OrderDetail', { orderId }) }],
        );
      }
    }, POLL_TIMEOUT_MS);

    pollTimerRef.current = setInterval(async () => {
      if (handledRef.current) { return; }  // fast path already handled it
      try {
        const order = await orderService.getOrderById(orderId);
        if (SUCCESS_STATUSES.has(order.status))      { finish('success'); }
        else if (FAILURE_STATUSES.has(order.status)) { finish('failed'); }
        // else: still RESERVED_* → chờ tiếp
      } catch {
        // Mạng tạm thời lỗi → bỏ qua, poll lại sau
      }
    }, POLL_INTERVAL_MS);
  }, [orderId, finish, stopPolling, navigation]);

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  // Hide loading overlay only on the first load, then never show it again
  const handleWebLoadEnd = useCallback(() => {
    if (!firstLoadDoneRef.current) {
      firstLoadDoneRef.current = true;
      setWebLoading(false);
    }
    startPolling();
  }, [startPolling]);

  const handleClose = () => {
    Alert.alert(
      'Huỷ thanh toán?',
      'Nếu bạn đã thanh toán, giao dịch vẫn được ghi nhận.',
      [
        { text: 'Tiếp tục thanh toán', style: 'cancel' },
        { text: 'Thoát', style: 'destructive', onPress: () => finish('cancelled') },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleClose} activeOpacity={0.7}>
          <Icon name="close" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>Thanh toán VNPay</Text>

        <View style={styles.headerRight}>
          {polling && <ActivityIndicator size="small" color={colors.primaryGreen} />}
        </View>
      </View>

      <View style={styles.secureBar}>
        <Icon name="lock-closed" size={12} color={colors.primaryGreen} />
        <Text style={styles.secureText}>Kết nối bảo mật SSL – cổng thanh toán VNPay</Text>
      </View>

      <WebView
        source={{ uri: paymentUrl }}
        style={styles.webview}
        onShouldStartLoadWithRequest={shouldStartLoadWithRequest}
        onNavigationStateChange={handleNavigationChange}
        onLoadEnd={handleWebLoadEnd}
        onError={() => { firstLoadDoneRef.current = true; setWebLoading(false); }}
        javaScriptEnabled
        domStorageEnabled
      />

      {webLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
          <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
        </View>
      )}

      {showSuccess && (
        <Animated.View style={[styles.successOverlay, { opacity: successOpacity }]}>
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <Text style={styles.successCheckmark}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Thanh toán thành công!</Text>
            <Text style={styles.successSub}>Đơn hàng đang chờ người bán xác nhận</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.gray[100],
  },
  headerBtn:   { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  headerRight: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  secureBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    backgroundColor: colors.primaryGreen + '10', paddingVertical: 5,
  },
  secureText: { fontSize: 11, color: colors.primaryGreen, fontWeight: '500' },
  webview: { flex: 1 },
  loadingOverlay: {
    position: 'absolute', top: 80, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loadingText: { fontSize: 14, color: colors.textSecondary },
  successOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  successCard: {
    backgroundColor: colors.white, borderRadius: 20,
    paddingVertical: 36, paddingHorizontal: 32,
    alignItems: 'center', width: 280,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 12,
  },
  successIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  successCheckmark: { fontSize: 40, color: colors.white, fontWeight: '700' },
  successTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  successSub:   { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 18 },
});

export default VnpayWebViewScreen;
